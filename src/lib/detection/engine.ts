import type { DetectionReport, DetectionResult } from "./types";
import { analyzeMetadata, extractMetadata } from "./metadata";
import { analyzeVisual } from "./visual";
import { analyzeFrequency } from "./frequency";

export async function detectWatermarks(file: File): Promise<DetectionReport> {
  const startTime = performance.now();

  // Load image
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  // Run all detection methods
  const metadata = await extractMetadata(file);
  const metadataResults = analyzeMetadata(metadata);
  const visualResults = analyzeVisual(ctx, img.width, img.height);
  const frequencyResults = analyzeFrequency(ctx, img.width, img.height);

  const allDetections: DetectionResult[] = [
    ...metadataResults,
    ...visualResults,
    ...frequencyResults,
  ];

  // Deduplicate overlapping regions of same type
  const deduped = deduplicateResults(allDetections);

  // Calculate overall score
  const overallScore = calculateOverallScore(deduped);

  const processingTimeMs = performance.now() - startTime;

  return {
    imageWidth: img.width,
    imageHeight: img.height,
    fileName: file.name,
    fileSize: file.size,
    processingTimeMs,
    detections: deduped,
    overallScore,
    metadata,
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}

function deduplicateResults(results: DetectionResult[]): DetectionResult[] {
  if (results.length <= 1) return results;

  const deduped: DetectionResult[] = [];

  for (const result of results) {
    const existing = deduped.find(
      (d) =>
        d.type === result.type &&
        d.regions.length > 0 &&
        result.regions.length > 0 &&
        regionsOverlap(d.regions[0], result.regions[0])
    );

    if (existing) {
      // Keep higher confidence
      if (result.confidence > existing.confidence) {
        const idx = deduped.indexOf(existing);
        deduped[idx] = result;
      }
    } else {
      deduped.push(result);
    }
  }

  return deduped;
}

function regionsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

function calculateOverallScore(detections: DetectionResult[]): number {
  if (detections.length === 0) return 5;

  // Combine confidences using probabilistic union
  let probNoWatermark = 1;
  for (const d of detections) {
    probNoWatermark *= 1 - d.confidence;
  }

  const score = (1 - probNoWatermark) * 100;
  return Math.round(Math.min(95, Math.max(5, score)));
}
