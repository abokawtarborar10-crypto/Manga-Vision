/**
 * Builds inpainting masks from high-contrast image pixels constrained to
 * Gemini's text-only geometry. Bubble bounds are context/layout only.
 *
 * CRITICAL — memory safety:
 *   OpenCV WASM Mats live on the WASM heap.  `Buffer.from(mat.data.buffer,
 *   byteOffset, length)` creates a ZERO-COPY VIEW into that heap.  After
 *   mat.delete() the WASM heap slot is freed; any later read of the Buffer
 *   returns zeros (or garbage) — silently breaking all downstream stages.
 *   We always use `Buffer.from(mat.data)` which COPIES the Uint8ClampedArray
 *   into a fresh Node.js heap Buffer before the Mat is deleted.
 */

import sharp from "sharp";
import { getCV } from "./index.js";
import { refineTextMask } from "./TextMaskRefinement.js";

export interface OcrRegion {
  /** Tight OCR polygon in normalized [0,1] image coordinates. */
  polygon?: [number, number][];
  /** Gemini segmentation polygon in normalized [0,1000] coordinates. */
  mask?: [number, number][];
  glyphPolygons?: [number, number][][];
  bubblePolygon?: [number, number][];
  bubble_bbox?: [number, number, number, number];
  maskSource?: "glyph_polygons" | "gemini" | "box_fallback";
  type?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SegmentationResult {
  maskData: Buffer;
  width: number;
  height: number;
  maskPixels: number;
  regionDiagnostics: Array<{
    index: number;
    normalizedPolygon: [number, number][];
    pixelBounds: { x: number; y: number; width: number; height: number };
    paddingPx: number;
    maskPixels: number;
    areaRatio: number;
    maskSource: string;
    safe: boolean;
    skipReason?: string;
  }>;
}

export interface SegmentationOptions {
  paddingPx?: number;
  preserveBubbleBorders?: boolean;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function getTextPolygons(region: OcrRegion): [number, number][][] {
  if (region.glyphPolygons?.some((poly) => poly.length >= 3)) {
    return region.glyphPolygons.filter((poly) => poly.length >= 3);
  }
  if (region.polygon && region.polygon.length >= 3) return [region.polygon];
  if (region.mask && region.mask.length >= 3) {
    const scale = region.mask.some(([x, y]) => Math.abs(x) > 1 || Math.abs(y) > 1)
      ? 1000
      : 1;
    return [region.mask.map(([x, y]) => [x / scale, y / scale])];
  }
  return [];
}

function getTextBounds(
  region: OcrRegion,
  polygons: [number, number][][],
  width: number,
  height: number,
) {
  const points = polygons.flat();
  const fromPolygons = points.length > 0;
  const minX = fromPolygons ? Math.min(...points.map(([x]) => x)) : clamp01(region.x);
  const minY = fromPolygons ? Math.min(...points.map(([, y]) => y)) : clamp01(region.y);
  const maxX = fromPolygons ? Math.max(...points.map(([x]) => x)) : clamp01(region.x + region.w);
  const maxY = fromPolygons ? Math.max(...points.map(([, y]) => y)) : clamp01(region.y + region.h);
  const x = Math.max(0, Math.min(width - 1, Math.floor(minX * width)));
  const y = Math.max(0, Math.min(height - 1, Math.floor(minY * height)));
  const right = Math.max(x + 1, Math.min(width, Math.ceil(maxX * width)));
  const bottom = Math.max(y + 1, Math.min(height, Math.ceil(maxY * height)));
  return { x, y, width: right - x, height: bottom - y };
}

function normalizedBubbleBoxArea(
  box: [number, number, number, number] | undefined,
  width: number,
  height: number,
): number | undefined {
  if (!box) return undefined;
  const [ymin, xmin, ymax, xmax] = box;
  return Math.max(0, ((xmax - xmin) / 1000) * width) *
    Math.max(0, ((ymax - ymin) / 1000) * height);
}

export async function buildTextMasks(
  imgBuf: Buffer,
  regions: OcrRegion[],
  options: SegmentationOptions = {},
): Promise<SegmentationResult> {
  const cv = getCV();
  if (!cv) throw new Error("OpenCV is unavailable; text masking cannot run safely");

  const { data: rawData, info } = await sharp(imgBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;

  // Use new Uint8Array(rawData) to COPY the Node.js Buffer's bytes — this
  // is safe regardless of whether the Buffer shares an internal pool with a
  // non-zero byteOffset.
  const rgbaMat = new cv.Mat(H, W, cv.CV_8UC4);
  rgbaMat.data.set(new Uint8Array(rawData));

  const bgrMat = new cv.Mat();
  cv.cvtColor(rgbaMat, bgrMat, cv.COLOR_RGBA2BGR);
  rgbaMat.delete();

  // Contrast against a local background catches dark, light, and saturated
  // lettering without assuming a white bubble or black ink.
  const localBackground = new cv.Mat();
  cv.GaussianBlur(bgrMat, localBackground, new cv.Size(9, 9), 0);
  const colorDifference = new cv.Mat();
  cv.absdiff(bgrMat, localBackground, colorDifference);
  localBackground.delete();
  bgrMat.delete();

  const channels = new cv.MatVector();
  cv.split(colorDifference, channels);
  colorDifference.delete();
  const contrastMask = cv.Mat.zeros(H, W, cv.CV_8UC1);
  for (let channelIndex = 0; channelIndex < channels.size(); channelIndex++) {
    const channel = channels.get(channelIndex);
    const thresholded = new cv.Mat();
    cv.threshold(channel, thresholded, 14, 255, cv.THRESH_BINARY);
    cv.bitwise_or(contrastMask, thresholded, contrastMask);
    channel.delete();
    thresholded.delete();
  }
  channels.delete();

  const fullMask = cv.Mat.zeros(H, W, cv.CV_8UC1);

  const regionDiagnostics: SegmentationResult["regionDiagnostics"] = [];

  regions.forEach((region, index) => {
    const maskPoly = getTightPolygon(region);
    if (maskPoly.length < 3) return;

    const pxCoords = maskPoly.map(([nx, ny]) => [
      Math.max(0, Math.min(W - 1, Math.round(nx * W))),
      Math.max(0, Math.min(H - 1, Math.round(ny * H))),
    ]);
    const xs = pxCoords.map(([x]) => x);
    const ys = pxCoords.map(([, y]) => y);
    const boxWidth = Math.max(1, Math.max(...xs) - Math.min(...xs));
    const boxHeight = Math.max(1, Math.max(...ys) - Math.min(...ys));
    // A small margin catches antialiased outlines and glyph pixels just
    // outside Gemini's tight box without touching the bubble border. It is
    // based on the short side so vertical/horizontal text behave equally.
    const automaticPadding = Math.max(
      2,
      Math.min(10, Math.round(Math.min(boxWidth, boxHeight) * 0.14)),
    );
    const configuredPadding = Number.isFinite(options.paddingPx)
      ? Math.min(24, Math.max(0, options.paddingPx!))
      : automaticPadding;
    const paddingPx = Math.round(
      options.preserveBubbleBorders === false
        ? configuredPadding
        : Math.min(configuredPadding, automaticPadding),
    );
    const flat = pxCoords.flatMap(([x, y]) => [x, y]);

    const polyMask = cv.Mat.zeros(H, W, cv.CV_8UC1);
    const contourMat = cv.matFromArray(pxCoords.length, 1, cv.CV_32SC2, flat);
    const vec = new cv.MatVector();
    vec.push_back(contourMat);
    cv.fillPoly(polyMask, vec, new cv.Scalar(255), cv.LINE_8);
    vec.delete();
    contourMat.delete();

    // Dilating the filled text shape (rather than only thresholded ink)
    // creates one complete mask for every glyph, including pale/outlined
    // characters. A 3×3 kernel adds one pixel per iteration.
    const expandedMask = new cv.Mat();
    const expandKernel = cv.Mat.ones(3, 3, cv.CV_8U);
    cv.dilate(
      polyMask,
      expandedMask,
      expandKernel,
      new cv.Point(-1, -1),
      paddingPx,
    );
    expandKernel.delete();

    // Keep the threshold intersection in the union for future diagnostics;
    // the expanded polygon is the authoritative removal mask.
    const regionInk = new cv.Mat();
    cv.bitwise_and(threshMat, expandedMask, regionInk);
    cv.bitwise_or(expandedMask, regionInk, expandedMask);
    regionInk.delete();
    polyMask.delete();

    cv.bitwise_or(fullMask, expandedMask, fullMask);
    expandedMask.delete();

    regionDiagnostics.push({
      index,
      normalizedPolygon: maskPoly,
      pixelBounds: {
        x: Math.max(0, Math.min(...xs) - paddingPx),
        y: Math.max(0, Math.min(...ys) - paddingPx),
        width: Math.min(W, Math.max(...xs) + paddingPx) -
          Math.max(0, Math.min(...xs) - paddingPx),
        height: Math.min(H, Math.max(...ys) + paddingPx) -
          Math.max(0, Math.min(...ys) - paddingPx),
      },
      paddingPx,
    });
  });

  threshMat.delete();

  // SAFE copy: Buffer.from(typedArray) copies the data into a new
  // Node.js Buffer that does NOT reference the WASM heap.
  // mat.delete() can then safely free the WASM slot.
  const maskData = Buffer.from(fullMask.data);
  const maskPixels = cv.countNonZero(fullMask);
  fullMask.delete();

  return {
    maskData,
    width: W,
    height: H,
    maskPixels,
    regionDiagnostics,
  };
}
