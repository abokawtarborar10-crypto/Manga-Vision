import { getCV } from "./index.js";

type CvApi = NonNullable<ReturnType<typeof getCV>>;
type CvMat = any;
type Point = [number, number];

export interface RefineTextMaskOptions {
  width: number;
  height: number;
  textBoundsArea: number;
  bubblePolygon?: Point[];
  maxPaddingPx: number;
}

export interface RefinedTextMask {
  mask: CvMat;
  maskPixels: number;
  areaRatio: number;
  paddingPx: number;
  safe: boolean;
  skipReason?: string;
}

/**
 * Turns high-contrast pixels inside a text-only seed into a conservative
 * inpainting mask. Bubble geometry is used only to protect its outline.
 */
export function refineTextMask(
  cv: CvApi,
  contrastMask: CvMat,
  seedMask: CvMat,
  options: RefineTextMaskOptions,
): RefinedTextMask {
  const ink = new cv.Mat();
  cv.bitwise_and(contrastMask, seedMask, ink);

  // Join antialiased edges with one tiny closing pass. Filling only each
  // connected foreground contour recovers solid glyph strokes without
  // painting the empty area of the model's text-region polygon.
  const closeKernel = cv.Mat.ones(3, 3, cv.CV_8U);
  const joined = new cv.Mat();
  cv.morphologyEx(
    ink,
    joined,
    cv.MORPH_CLOSE,
    closeKernel,
    new cv.Point(-1, -1),
    1,
  );
  closeKernel.delete();
  ink.delete();

  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(
    joined,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE,
  );
  joined.delete();
  hierarchy.delete();

  const mask = cv.Mat.zeros(options.height, options.width, cv.CV_8UC1);
  for (let index = 0; index < contours.size(); index++) {
    const contour = contours.get(index);
    const bounds = cv.boundingRect(contour);
    // Preserve tiny punctuation/dots, but discard isolated single-pixel
    // compression noise. A compact component can never exceed its seed.
    if (bounds.width === 1 && bounds.height === 1) {
      contour.delete();
      continue;
    }
    cv.drawContours(mask, contours, index, new cv.Scalar(255), cv.FILLED);
    contour.delete();
  }
  contours.delete();

  const safeBounds = cv.findNonZero(seedMask);
  const bounds = safeBounds.rows > 0
    ? cv.boundingRect(safeBounds)
    : { width: 0, height: 0 };
  safeBounds.delete();
  const shortestSide = Math.min(bounds.width, bounds.height);
  const adaptivePadding = shortestSide < 20 ? 0 : shortestSide < 56 ? 1 : 2;
  const paddingPx = Math.min(
    adaptivePadding,
    Math.max(0, Math.min(2, Math.round(options.maxPaddingPx))),
  );
  if (paddingPx > 0) {
    const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
    cv.dilate(mask, mask, kernel, new cv.Point(-1, -1), paddingPx);
    kernel.delete();
  }

  // The bubble outline is context, not text. Subtract a one-pixel inner ring
  // from the predicted outline after dilation so a touching glyph is left
  // partly intact rather than destroying the border.
  if (options.bubblePolygon && options.bubblePolygon.length >= 3) {
    const points = options.bubblePolygon.map(([x, y]) => [
      Math.max(0, Math.min(options.width - 1, Math.round(x * options.width))),
      Math.max(0, Math.min(options.height - 1, Math.round(y * options.height))),
    ]);
    const flat = points.flatMap(([x, y]) => [x, y]);
    const bubble = cv.Mat.zeros(options.height, options.width, cv.CV_8UC1);
    const contour = cv.matFromArray(points.length, 1, cv.CV_32SC2, flat);
    const polygon = new cv.MatVector();
    polygon.push_back(contour);
    cv.fillPoly(bubble, polygon, new cv.Scalar(255), cv.LINE_8);
    polygon.delete();
    contour.delete();

    const borderKernel = cv.Mat.ones(3, 3, cv.CV_8U);
    const inner = new cv.Mat();
    cv.erode(
      bubble,
      inner,
      borderKernel,
      new cv.Point(-1, -1),
      1,
    );
    borderKernel.delete();
    const border = new cv.Mat();
    cv.subtract(bubble, inner, border);
    const notBorder = new cv.Mat();
    cv.bitwise_not(border, notBorder);
    cv.bitwise_and(mask, notBorder, mask);
    bubble.delete();
    inner.delete();
    border.delete();
    notBorder.delete();
  }

  const maskPixels = cv.countNonZero(mask);
  const areaRatio = maskPixels / Math.max(1, options.textBoundsArea);
  if (maskPixels === 0) {
    return {
      mask,
      maskPixels,
      areaRatio,
      paddingPx,
      safe: false,
      skipReason: "no high-contrast glyph pixels found",
    };
  }
  if (areaRatio > 0.65) {
    mask.setTo(new cv.Scalar(0));
    return {
      mask,
      maskPixels: 0,
      areaRatio,
      paddingPx,
      safe: false,
      skipReason: "mask covers more than 65% of the text bounds",
    };
  }

  return { mask, maskPixels, areaRatio, paddingPx, safe: true };
}