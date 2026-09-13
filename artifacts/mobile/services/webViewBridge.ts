/**
 * WebViewBridge — Mihon-grade source networking layer
 *
 * Source adapters call webViewBridge.fetch() / fetchRendered() instead of
 * the plain fetch() polyfill. The GlobalWebViewBridge React component
 * (mounted once in _layout.tsx) owns the real WebView instances and
 * fulfills every pending request by injecting fetch() scripts into the
 * appropriate persistent hidden WebView.
 *
 * Why this works where fetch() fails:
 *   - cf_clearance is an HttpOnly cookie → JS can't read it, but the
 *     WebView's HTTP stack *already carries it* on every request it makes.
 *   - The WebView stays alive across the entire app session, accumulating
 *     cookies exactly like a real browser tab.
 *   - After one CF solve the session persists until the next challenge
 *     (typically days), so users rarely see the verification UI again.
 */

export type BridgeSourceStatus =
  | "initializing"   // WebView mounting / loading base URL
  | "idle"           // Ready to accept requests
  | "executing"      // Running an injected request
  | "cf_challenge"   // CF challenge page visible, waiting for user
  | "verified";      // CF solved, session active

export interface BridgeRequest {
  id: string;
  sourceId: string;
  url: string;
  method?: string;
  headers?: Record<string, string>;
  /** True → navigate WebView to URL and extract fully-rendered DOM (for SPAs) */
  extractRendered?: boolean;
  /** ms to wait after navigation before extracting rendered HTML */
  renderWaitMs?: number;
  timeoutMs?: number;
}

export interface BridgeResponse {
  ok: boolean;
  status: number;
  body: string;
  contentType?: string;
  finalUrl?: string;
}

type RequestListener = (req: BridgeRequest) => void;
type StatusListener = (sourceId: string, status: BridgeSourceStatus) => void;

interface PendingEntry {
  resolve: (r: BridgeResponse) => void;
  reject: (e: Error) => void;
  handle: ReturnType<typeof setTimeout>;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

class WebViewBridgeService {
  private pending = new Map<string, PendingEntry>();
  private requestListeners: RequestListener[] = [];
  private statusListeners: StatusListener[] = [];
  private statuses = new Map<string, BridgeSourceStatus>();

  // ── Public API for source adapters ────────────────────────────────────────

  fetch(
    sourceId: string,
    url: string,
    opts?: {
      method?: string;
      headers?: Record<string, string>;
      timeoutMs?: number;
    },
  ): Promise<BridgeResponse> {
    return this._enqueue({
      id: makeId(),
      sourceId,
      url,
      method: opts?.method ?? "GET",
      headers: opts?.headers,
      extractRendered: false,
      timeoutMs: opts?.timeoutMs ?? 20000,
    });
  }

  fetchRendered(
    sourceId: string,
    url: string,
    waitMs = 2500,
  ): Promise<BridgeResponse> {
    return this._enqueue({
      id: makeId(),
      sourceId,
      url,
      extractRendered: true,
      renderWaitMs: waitMs,
      timeoutMs: 30000,
    });
  }

  private _enqueue(req: BridgeRequest): Promise<BridgeResponse> {
    return new Promise<BridgeResponse>((resolve, reject) => {
      const handle = setTimeout(() => {
        this.pending.delete(req.id);
        reject(new Error(`[bridge] timeout: ${req.url}`));
      }, req.timeoutMs ?? 20000);

      this.pending.set(req.id, { resolve, reject, handle });
      this.requestListeners.forEach((l) => l(req));
    });
  }

  // ── Called by GlobalWebViewBridge ─────────────────────────────────────────

  resolve(id: string, response: BridgeResponse) {
    const entry = this.pending.get(id);
    if (!entry) return;
    clearTimeout(entry.handle);
    this.pending.delete(id);
    entry.resolve(response);
  }

  reject(id: string, error: string) {
    const entry = this.pending.get(id);
    if (!entry) return;
    clearTimeout(entry.handle);
    this.pending.delete(id);
    entry.reject(new Error(error));
  }

  setStatus(sourceId: string, status: BridgeSourceStatus) {
    this.statuses.set(sourceId, status);
    this.statusListeners.forEach((l) => l(sourceId, status));
    console.log(`[bridge:${sourceId}] status → ${status}`);
  }

  getStatus(sourceId: string): BridgeSourceStatus {
    return this.statuses.get(sourceId) ?? "initializing";
  }

  // ── Registration ──────────────────────────────────────────────────────────

  onRequest(listener: RequestListener): () => void {
    this.requestListeners.push(listener);
    return () => {
      this.requestListeners = this.requestListeners.filter((l) => l !== listener);
    };
  }

  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  /**
   * Wait for the user to complete the source's browser verification.
   *
   * Source adapters use this after a browser challenge response. The actual
   * request is retried by the adapter through this same WebView, so its
   * cookies/session never need to be copied into the native HTTP client.
   */
  waitForVerification(sourceId: string, timeoutMs = 120_000): Promise<void> {
    const current = this.getStatus(sourceId);
    if (current === "verified") return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | null = null;
      let unsubscribe: (() => void) | null = null;
      let settled = false;

      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        unsubscribe?.();
        if (error) reject(error);
        else resolve();
      };

      unsubscribe = this.onStatusChange((sid, status) => {
        if (sid !== sourceId) return;
        if (status === "verified") finish();
      });

      timer = setTimeout(() => {
        finish(new Error(`[bridge] verification timed out for ${sourceId}`));
      }, timeoutMs);

      // The status may have changed between the initial check and listener
      // registration.
      if (this.getStatus(sourceId) === "verified") finish();
    });
  }
}

export const webViewBridge = new WebViewBridgeService();
