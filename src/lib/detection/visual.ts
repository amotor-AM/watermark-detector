import type { DetectionResult, WatermarkRegion } from "./types";

interface PixelData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

function getPixelData(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): PixelData {
  const imageData = ctx.getImageData(0, 0, width, height);
  return { data: imageData.data, width, height };
}

/**
 * Detect semi-transparent overlays by analyzing alpha channel
 * and low-contrast regions that differ from surrounding content
 */
function detectSemiTransparentOverlays(
  pixels: PixelData
): DetectionResult | null {
  const { data, width, height } = pixels;
  const blockSize = 16;
  const cols = Math.floor(width / blockSize);
  const rows = Math.floor(height / blockSize);

  const blockVariance: number[][] = [];

  for (let row = 0; row < rows; row++) {
    blockVariance[row] = [];
    for (let col = 0; col < cols; col++) {
      let sumR = 0,
        sumG = 0,
        sumB = 0,
        count = 0;
      const values: number[] = [];

      for (let y = row * blockSize; y < (row + 1) * blockSize; y++) {
        for (let x = col * blockSize; x < (col + 1) * blockSize; x++) {
          const idx = (y * width + x) * 4;
          const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
          values.push(gray);
          sumR += data[idx];
          sumG += data[idx + 1];
          sumB += data[idx + 2];
          count++;
        }
      }

      const mean = values.reduce((a, b) => a + b, 0) / count;
      const variance =
        values.reduce((a, b) => a + (b - mean) ** 2, 0) / count;

      const avgR = sumR / count;
      const avgG = sumG / count;
      const avgB = sumB / count;
      const colorDiff =
        Math.abs(avgR - avgG) + Math.abs(avgG - avgB) + Math.abs(avgR - avgB);

      blockVariance[row][col] = variance + colorDiff * 0.1;
    }
  }

  // Look for bands of low-variance blocks in corners/edges (typical watermark placement)
  const regions: WatermarkRegion[] = [];
  const corners = [
    { startRow: 0, startCol: 0, endRow: Math.min(4, rows), endCol: Math.min(8, cols) },
    { startRow: 0, startCol: Math.max(0, cols - 8), endRow: Math.min(4, rows), endCol: cols },
    { startRow: Math.max(0, rows - 4), startCol: 0, endRow: rows, endCol: Math.min(8, cols) },
    { startRow: Math.max(0, rows - 4), startCol: Math.max(0, cols - 8), endRow: rows, endCol: cols },
    // Bottom center (common for TikTok, YouTube)
    { startRow: Math.max(0, rows - 4), startCol: Math.floor(cols / 4), endRow: rows, endCol: Math.floor((3 * cols) / 4) },
  ];

  for (const corner of corners) {
    let lowVarCount = 0;
    let totalBlocks = 0;
    for (let r = corner.startRow; r < corner.endRow; r++) {
      for (let c = corner.startCol; c < corner.endCol; c++) {
        if (blockVariance[r]?.[c] !== undefined) {
          totalBlocks++;
          if (blockVariance[r][c] < 50) lowVarCount++;
        }
      }
    }

    if (totalBlocks > 0 && lowVarCount / totalBlocks > 0.6) {
      regions.push({
        x: corner.startCol * blockSize,
        y: corner.startRow * blockSize,
        width: (corner.endCol - corner.startCol) * blockSize,
        height: (corner.endRow - corner.startRow) * blockSize,
        confidence: lowVarCount / totalBlocks,
      });
    }
  }

  if (regions.length === 0) return null;

  return {
    type: "semi-transparent",
    confidence: Math.min(0.7, regions.reduce((max, r) => Math.max(max, r.confidence), 0)),
    description: "Potential semi-transparent overlay detected in typical watermark positions",
    regions,
  };
}

/**
 * Edge detection using Sobel operator to find sharp text/logo edges
 * in regions where watermarks typically appear
 */
function detectEdgePatterns(pixels: PixelData): DetectionResult | null {
  const { data, width, height } = pixels;

  // Convert to grayscale
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    gray[i] = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
  }

  // Sobel operator
  const edges = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx =
        -gray[(y - 1) * width + (x - 1)] +
        gray[(y - 1) * width + (x + 1)] -
        2 * gray[y * width + (x - 1)] +
        2 * gray[y * width + (x + 1)] -
        gray[(y + 1) * width + (x - 1)] +
        gray[(y + 1) * width + (x + 1)];
      const gy =
        -gray[(y - 1) * width + (x - 1)] -
        2 * gray[(y - 1) * width + x] -
        gray[(y - 1) * width + (x + 1)] +
        gray[(y + 1) * width + (x - 1)] +
        2 * gray[(y + 1) * width + x] +
        gray[(y + 1) * width + (x + 1)];
      edges[idx] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  // Analyze edge density in watermark-typical regions
  const regions: WatermarkRegion[] = [];
  const checkRegions = [
    // Bottom-center (TikTok, YouTube watermarks)
    { x: Math.floor(width * 0.2), y: Math.floor(height * 0.85), w: Math.floor(width * 0.6), h: Math.floor(height * 0.12) },
    // Top-right (Instagram, stock photo watermarks)
    { x: Math.floor(width * 0.7), y: Math.floor(height * 0.02), w: Math.floor(width * 0.28), h: Math.floor(height * 0.08) },
    // Bottom-right (CapCut, general branding)
    { x: Math.floor(width * 0.65), y: Math.floor(height * 0.88), w: Math.floor(width * 0.33), h: Math.floor(height * 0.1) },
    // Center (stock photo watermarks)
    { x: Math.floor(width * 0.25), y: Math.floor(height * 0.35), w: Math.floor(width * 0.5), h: Math.floor(height * 0.3) },
    // Bottom-left
    { x: Math.floor(width * 0.02), y: Math.floor(height * 0.88), w: Math.floor(width * 0.33), h: Math.floor(height * 0.1) },
  ];

  // Get global edge statistics
  let globalEdgeSum = 0;
  let globalCount = 0;
  for (let i = 0; i < edges.length; i++) {
    globalEdgeSum += edges[i];
    globalCount++;
  }
  const globalAvgEdge = globalEdgeSum / globalCount;

  for (const region of checkRegions) {
    let edgeSum = 0;
    let count = 0;
    let highEdgeCount = 0;

    for (let y = region.y; y < Math.min(region.y + region.h, height); y++) {
      for (let x = region.x; x < Math.min(region.x + region.w, width); x++) {
        const val = edges[y * width + x];
        edgeSum += val;
        count++;
        if (val > 100) highEdgeCount++;
      }
    }

    if (count === 0) continue;
    const avgEdge = edgeSum / count;
    const edgeDensity = highEdgeCount / count;

    // Text/logo watermarks have distinctive edge patterns:
    // moderate-to-high edge density in a localized area
    if (edgeDensity > 0.05 && avgEdge > globalAvgEdge * 1.3) {
      regions.push({
        x: region.x,
        y: region.y,
        width: region.w,
        height: region.h,
        confidence: Math.min(0.85, edgeDensity * 3),
      });
    }
  }

  if (regions.length === 0) return null;

  return {
    type: "logo",
    confidence: Math.min(0.8, regions.reduce((max, r) => Math.max(max, r.confidence), 0)),
    description: "Edge patterns consistent with text or logo watermark detected",
    regions,
  };
}

/**
 * Detect repeating patterns that might indicate tiled watermarks
 * (common in stock photos)
 */
function detectRepeatingPatterns(pixels: PixelData): DetectionResult | null {
  const { data, width, height } = pixels;

  // Downsample for performance
  const scale = 4;
  const sw = Math.floor(width / scale);
  const sh = Math.floor(height / scale);
  const small = new Float32Array(sw * sh);

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const srcIdx = (y * scale * width + x * scale) * 4;
      small[y * sw + x] =
        data[srcIdx] * 0.299 + data[srcIdx + 1] * 0.587 + data[srcIdx + 2] * 0.114;
    }
  }

  // Auto-correlation at various offsets to find repeating patterns
  const offsets = [
    { dx: Math.floor(sw / 4), dy: 0 },
    { dx: Math.floor(sw / 3), dy: 0 },
    { dx: 0, dy: Math.floor(sh / 4) },
    { dx: 0, dy: Math.floor(sh / 3) },
    { dx: Math.floor(sw / 4), dy: Math.floor(sh / 4) },
  ];

  let maxCorrelation = 0;

  for (const offset of offsets) {
    let sum = 0;
    let count = 0;
    let sumDiff = 0;

    for (let y = 0; y < sh - Math.abs(offset.dy); y++) {
      for (let x = 0; x < sw - Math.abs(offset.dx); x++) {
        const idx1 = y * sw + x;
        const idx2 = (y + offset.dy) * sw + (x + offset.dx);
        const diff = Math.abs(small[idx1] - small[idx2]);
        sumDiff += diff;
        sum += small[idx1];
        count++;
      }
    }

    if (count === 0) continue;
    const avgDiff = sumDiff / count;
    const avgVal = sum / count;
    const correlation = avgVal > 0 ? 1 - avgDiff / avgVal : 0;

    maxCorrelation = Math.max(maxCorrelation, correlation);
  }

  if (maxCorrelation > 0.85) {
    return {
      type: "pattern",
      confidence: Math.min(0.7, (maxCorrelation - 0.85) * 5),
      description: "Repeating pattern detected, possibly a tiled watermark",
      regions: [{ x: 0, y: 0, width, height, confidence: maxCorrelation }],
    };
  }

  return null;
}

/**
 * Detect color channel anomalies typical of embedded watermarks
 */
function detectColorChannelAnomalies(
  pixels: PixelData
): DetectionResult | null {
  const { data, width, height } = pixels;

  // Check for uniform color tint in watermark-typical regions
  const bottomStrip = {
    startY: Math.floor(height * 0.88),
    endY: height,
  };

  let tintR = 0,
    tintG = 0,
    tintB = 0,
    count = 0;
  const satValues: number[] = [];

  for (let y = bottomStrip.startY; y < bottomStrip.endY; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx],
        g = data[idx + 1],
        b = data[idx + 2];
      tintR += r;
      tintG += g;
      tintB += b;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      satValues.push(max > 0 ? (max - min) / max : 0);
      count++;
    }
  }

  if (count === 0) return null;

  const avgR = tintR / count;
  const avgG = tintG / count;
  const avgB = tintB / count;
  const avgSat = satValues.reduce((a, b) => a + b, 0) / satValues.length;

  // Very low saturation in bottom strip could indicate a gradient overlay
  if (avgSat < 0.05 && Math.abs(avgR - avgG) < 10 && Math.abs(avgG - avgB) < 10) {
    const brightness = (avgR + avgG + avgB) / 3;
    if (brightness < 40 || brightness > 220) {
      return {
        type: "border",
        confidence: 0.5,
        description: "Uniform color band detected at image border — possible letterbox or branding strip",
        regions: [
          {
            x: 0,
            y: bottomStrip.startY,
            width,
            height: bottomStrip.endY - bottomStrip.startY,
            confidence: 0.5,
          },
        ],
      };
    }
  }

  return null;
}

/**
 * Platform-specific watermark detection using known patterns
 */
function detectPlatformWatermarks(
  pixels: PixelData
): DetectionResult | null {
  const { data, width, height } = pixels;

  // TikTok: typically bottom-center, white text with slight shadow
  // Check bottom 15% center region for white/near-white pixels on varying background
  const bottomCenter = {
    x: Math.floor(width * 0.25),
    y: Math.floor(height * 0.85),
    w: Math.floor(width * 0.5),
    h: Math.floor(height * 0.13),
  };

  let whitePixels = 0;
  let totalPixels = 0;
  let contrastCount = 0;

  for (let y = bottomCenter.y; y < Math.min(bottomCenter.y + bottomCenter.h, height); y++) {
    for (let x = bottomCenter.x; x < Math.min(bottomCenter.x + bottomCenter.w, width); x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx],
        g = data[idx + 1],
        b = data[idx + 2];
      totalPixels++;

      if (r > 220 && g > 220 && b > 220) {
        whitePixels++;
        // Check if surrounding pixels are significantly darker (text on background)
        if (x > 0 && y > 0) {
          const prevIdx = ((y - 1) * width + x) * 4;
          const prevBrightness =
            data[prevIdx] * 0.299 + data[prevIdx + 1] * 0.587 + data[prevIdx + 2] * 0.114;
          const curBrightness = r * 0.299 + g * 0.587 + b * 0.114;
          if (Math.abs(curBrightness - prevBrightness) > 80) {
            contrastCount++;
          }
        }
      }
    }
  }

  if (totalPixels === 0) return null;

  const whiteRatio = whitePixels / totalPixels;
  const contrastRatio = contrastCount / totalPixels;

  // TikTok-style: scattered white text pixels with contrast against background
  if (whiteRatio > 0.02 && whiteRatio < 0.3 && contrastRatio > 0.005) {
    return {
      type: "text-overlay",
      platform: "TikTok / Short-form video",
      confidence: Math.min(0.75, contrastRatio * 20),
      description:
        "White text overlay pattern detected in bottom region, consistent with TikTok/short-form video watermarks",
      regions: [
        {
          x: bottomCenter.x,
          y: bottomCenter.y,
          width: bottomCenter.w,
          height: bottomCenter.h,
          confidence: Math.min(0.75, contrastRatio * 20),
        },
      ],
    };
  }

  return null;
}

export function analyzeVisual(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): DetectionResult[] {
  const pixels = getPixelData(ctx, width, height);
  const results: DetectionResult[] = [];

  const semiTransparent = detectSemiTransparentOverlays(pixels);
  if (semiTransparent) results.push(semiTransparent);

  const edgePatterns = detectEdgePatterns(pixels);
  if (edgePatterns) results.push(edgePatterns);

  const repeating = detectRepeatingPatterns(pixels);
  if (repeating) results.push(repeating);

  const colorAnomalies = detectColorChannelAnomalies(pixels);
  if (colorAnomalies) results.push(colorAnomalies);

  const platform = detectPlatformWatermarks(pixels);
  if (platform) results.push(platform);

  return results;
}
