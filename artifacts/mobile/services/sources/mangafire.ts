import { Platform } from "react-native";
import { Chapter, Manga, MangaSource } from "./types";
import { proxiedFetch, SourceError } from "./fetchClient";
import { webViewBridge } from "../webViewBridge";

const SITE_URL = "https://mangafire.to";

// ── MangaFire JSON API ─────────────────────────────────────────────────────
// MangaFire's frontend (a Vite/SPA bundle served from s.mfcdn.nl) is fully
// client-rendered — plain HTML fetches of /filter, /manga/{id}, etc. return
// only an empty app shell with no manga data embedded server-side.
//
// The SPA itself talks to a first-party JSON REST API mounted at
// `${SITE_URL}/api/*` (axios instance with baseURL:"/api",
// Accept: application/json, X-Requested-With: XMLHttpRequest). That API is
// NOT behind Cloudflare's JS challenge (verified via direct requests with no
// cookies) and returns clean JSON, so we use it directly instead of
// scraping HTML or requiring a WebView.
//
// Known endpoints (reverse-engineered from the production JS bundle):
//   GET /api/titles?sort=...&page=...&keyword=...   → { items: [...] }  (listing/search)
//   GET /api/top-titles                              → { items: [...] }  (curated trending)
//   GET /api/titles/{hid}                            → { data: {...} }   (manga details)
//   GET /api/titles/{hid}/chapters?lang=en           → { items: [...] }  (chapter list)
//   GET /api/chapters/{chapterId}                    → { data: {...} }   (chapter + pages)
//
// `hid` is MangaFire's short opaque manga identifier (e.g. "dkw" for
// One Piece) — used as our internal manga id. Chapter identifiers are
// MangaFire's numeric chapter row ids, used directly as our chapter id.

const API_OPTS = {
  sourceId: "mangafire",
  siteUrl: SITE_URL,
  timeoutMs: 18000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "X-Requested-With": "XMLHttpRequest",
    Referer: SITE_URL + "/",
  },
};

function isCloudflarePage(html: string): boolean {
  return /just a moment|checking your browser|cf-browser-verification|challenge-form|challenge-running|attention required|cloudflare_challenge|cf-mitigated|verification required/i.test(html);
}

/**
 * Fetch a MangaFire `/api/*` JSON endpoint through the shared proxy/session
 * layer (proxied on web for CORS, direct on native).
 */
async function mfApiFetch<T>(
  path: string,
  query = "",
  signal?: AbortSignal,
  verificationAttempt = 0,
): Promise<T> {
  const url = `${SITE_URL}/api${path}${query}`;
  let status = 0;
  let text = "";
  let contentType = "";
  let finalUrl = url;

  try {
    if (Platform.OS !== "web") {
      // Native requests must stay inside the persistent WebView. A native
      // fetch cannot see the WebView's browser session after verification.
      const response = await webViewBridge.fetch("mangafire", url, {
        headers: API_OPTS.headers,
        timeoutMs: API_OPTS.timeoutMs,
      });
      status = response.status;
      text = response.body;
      contentType = response.contentType ?? "";
      finalUrl = response.finalUrl ?? url;
    } else {
      const res = await proxiedFetch(
        "mangafire",
        `/api${path}`,
        query,
        API_OPTS,
        signal ? { signal } : undefined,
      );
      status = res.status;
      text = await res.text();
      contentType = res.headers.get("content-type") ?? "";
      finalUrl = res.url || url;
    }

    if (__DEV__) {
      console.log(
        `[MANGAFIRE_REQUEST] url=${url} method=GET status=${status} contentType=${contentType || "unknown"} redirectedUrl=${finalUrl}`,
      );
    }

    if (isCloudflarePage(text) || status === 403 || status === 503) {
      if (__DEV__) {
        console.warn(
          `[MANGAFIRE_CHALLENGE] detected=true challengeType=browser-verification url=${finalUrl}`,
        );
      }

      if (Platform.OS !== "web" && verificationAttempt < 2) {
        try {
          await webViewBridge.waitForVerification("mangafire");
          return mfApiFetch<T>(path, query, signal, verificationAttempt + 1);
        } catch {
          throw new SourceError(
            "MangaFire verification could not be completed in this environment.",
            "cloudflare",
            status || 403,
            "mangafire",
          );
        }
      }

      throw new SourceError(
        "MangaFire requires browser verification before this content can load.",
        "cloudflare",
        status || 403,
        "mangafire",
      );
    }

    return JSON.parse(text) as T;
  } catch {
    if (Platform.OS !== "web" && verificationAttempt < 2 && /browser verification required|cf blocked/i.test(String((arguments as unknown as { [key: number]: unknown })[0]))) {
      await webViewBridge.waitForVerification("mangafire");
      return mfApiFetch<T>(path, query, signal, verificationAttempt + 1);
    }
    throw new SourceError(
      `MangaFire: invalid JSON from /api${path}`,
      status >= 500 ? "upstream" : "parse",
      status,
      "mangafire",
    );
  }
}

// ── Response shape types ───────────────────────────────────────────────────

interface MfPoster {
  small?: string;
  medium?: string;
  large?: string;
}

interface MfTitleListItem {
  id: number;
  hid: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  poster?: MfPoster;
  latestChapter?: number;
  year?: number;
  rank?: number;
  chapterUpdatedAt?: string;
  url?: string;
}

interface MfTitleListResponse {
  items: MfTitleListItem[];
}

interface MfTaxonomy {
  id: number;
  title: string;
}

interface MfTitleDetail extends MfTitleListItem {
  synopsisHtml?: string;
  altTitles?: string[];
  rating?: number;
  ratingCount?: number;
  chapterTotal?: number;
  follows?: number;
  viewsTotal?: number;
  languages?: string[];
  genres?: MfTaxonomy[];
  themes?: MfTaxonomy[];
  demographics?: MfTaxonomy[];
  authors?: MfTaxonomy[];
}

interface MfTitleDetailResponse {
  data: MfTitleDetail;
}

interface MfChapterListItem {
  id: number;
  number: number | string;
  name?: string;
  language: string;
  type?: string;
  createdAt?: number;
}

interface MfChapterListResponse {
  items: MfChapterListItem[];
}

interface MfChapterPage {
  url: string;
  width?: number;
  height?: number;
}

interface MfChapterDetail {
  id: number;
  number: number | string;
  name?: string;
  language: string;
  pages: MfChapterPage[];
}

interface MfChapterDetailResponse {
  data: MfChapterDetail;
}

// ── Mapping helpers ─────────────────────────────────────────────────────────

const MF_STATUS_MAP: Record<string, Manga["status"]> = {
  releasing: "ongoing",
  ongoing: "ongoing",
  finished: "completed",
  completed: "completed",
  hiatus: "hiatus",
  cancelled: "cancelled",
  discontinued: "cancelled",
};

function bestCover(poster?: MfPoster): string {
  return poster?.large ?? poster?.medium ?? poster?.small ?? "";
}

function mapListItem(item: MfTitleListItem): Manga {
  return {
    id: item.hid,
    title: item.title,
    coverUrl: bestCover(item.poster),
    sourceId: "mangafire",
    status: item.status ? MF_STATUS_MAP[item.status.toLowerCase()] : undefined,
    year: item.year,
    chaptersCount: item.latestChapter,
  };
}

function mapDetail(item: MfTitleDetail): Manga {
  return {
    id: item.hid,
    title: item.title,
    coverUrl: bestCover(item.poster),
    sourceId: "mangafire",
    status: item.status ? MF_STATUS_MAP[item.status.toLowerCase()] : undefined,
    rating: typeof item.rating === "number" ? item.rating : undefined,
    description: item.synopsisHtml
      ? item.synopsisHtml.replace(/<[^>]*>/g, "").trim()
      : undefined,
    genres: (item.genres ?? []).map((g) => g.title),
    author: (item.authors ?? []).map((a) => a.title).join(", ") || undefined,
    altTitles: item.altTitles,
    year: item.year,
    chaptersCount: item.chapterTotal || item.latestChapter,
  };
}

function mapChapter(item: MfChapterListItem): Chapter {
  return {
    id: String(item.id),
    number: String(item.number),
    title: item.name && item.name.trim() ? item.name.trim() : undefined,
    publishedAt: item.createdAt ? new Date(item.createdAt * 1000).toISOString() : "",
    translatedLanguage: item.language,
  };
}

// ── Source implementation ───────────────────────────────────────────────────

export const mangafireSource: MangaSource = {
  id: "mangafire",
  name: "MangaFire",
  baseUrl: SITE_URL,
  isEnabled: true,
  requiresVerification: true,

  async getTrending(page = 0): Promise<Manga[]> {
    try {
      if (page === 0) {
        const json = await mfApiFetch<MfTitleListResponse>("/top-titles");
        const items = json.items ?? [];
        if (items.length > 0) return items.map(mapListItem);
      }
      const json = await mfApiFetch<MfTitleListResponse>(
        "/titles",
        `?sort=${encodeURIComponent("rank")}&page=${page + 1}`,
      );
      return (json.items ?? []).map(mapListItem);
    } catch (err) {
      if (err instanceof SourceError) throw err;
      return [];
    }
  },

  async getLatestUpdates(page = 0): Promise<Manga[]> {
    try {
      const json = await mfApiFetch<MfTitleListResponse>(
        "/titles",
        `?sort=${encodeURIComponent("chapter_updated_at:desc")}&page=${page + 1}`,
      );
      return (json.items ?? []).map(mapListItem);
    } catch (err) {
      if (err instanceof SourceError) throw err;
      return [];
    }
  },

  async search(query: string, page = 0): Promise<Manga[]> {
    try {
      const qs = `?keyword=${encodeURIComponent(query)}&sort=${encodeURIComponent("relevance:desc")}&page=${page + 1}`;
      const json = await mfApiFetch<MfTitleListResponse>("/titles", qs);
      return (json.items ?? []).map(mapListItem);
    } catch (err) {
      if (err instanceof SourceError) throw err;
      throw new SourceError("MangaFire search failed.", "network", undefined, "mangafire");
    }
  },

  async getMangaDetails(id: string): Promise<Manga> {
    try {
      const json = await mfApiFetch<MfTitleDetailResponse>(`/titles/${encodeURIComponent(id)}`);
      return mapDetail(json.data);
    } catch (err) {
      if (err instanceof SourceError) throw err;
      throw new SourceError(
        `MangaFire manga details failed: ${err instanceof Error ? err.message : "unknown error"}`,
        "network",
        undefined,
        "mangafire",
      );
    }
  },

  async getChapters(mangaId: string, signal?: AbortSignal): Promise<Chapter[]> {
    try {
      const json = await mfApiFetch<MfChapterListResponse>(
        `/titles/${encodeURIComponent(mangaId)}/chapters`,
        "?lang=en",
        signal,
      );
      let items = json.items ?? [];
      // Some titles only have chapters in non-English languages; fall back
      // to the unfiltered list rather than showing nothing.
      if (items.length === 0) {
        const all = await mfApiFetch<MfChapterListResponse>(
          `/titles/${encodeURIComponent(mangaId)}/chapters`,
          "",
          signal,
        );
        items = all.items ?? [];
      }
      return items.map(mapChapter);
    } catch (err) {
      if (err instanceof SourceError) throw err;
      throw new SourceError(
        `MangaFire chapters failed: ${err instanceof Error ? err.message : "unknown error"}`,
        "network",
        undefined,
        "mangafire",
      );
    }
  },

  async getChapterPages(chapterId: string, signal?: AbortSignal): Promise<string[]> {
    try {
      const json = await mfApiFetch<MfChapterDetailResponse>(
        `/chapters/${encodeURIComponent(chapterId)}`,
        "",
        signal,
      );
      const pages = json.data?.pages ?? [];
      return pages.map((p) => p.url).filter((u): u is string => !!u);
    } catch (err) {
      if (err instanceof SourceError) throw err;
      throw new SourceError(
        `MangaFire chapter pages failed: ${err instanceof Error ? err.message : "unknown error"}`,
        "network",
        undefined,
        "mangafire",
      );
    }
  },
};
