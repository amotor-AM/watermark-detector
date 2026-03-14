import type { DetectionReport, DetectionResult } from "./types";
import { analyzeMetadata, extractMetadata } from "./metadata";
import { analyzeVisual } from "./visual";
import { analyzeFrequency } from "./frequency";

export async function detectWatermarks(file: File): Promise<DetectionReport> {
  const startTime = performance.now();

  // Load image
  const img = await loadImage(file);
  
  // Downsample large images for faster processing
  const maxDim = 1920;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const targetWidth = Math.floor(img.width * scale);
  const targetHeight = Math.floor(img.height * scale);
  
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Run detection methods asynchronously to avoid blocking
  const metadata = await extractMetadata(file);
  const metadataResults = analyzeMetadata(metadata);
  
  // Break up visual analysis to prevent blocking
  const visualResults = await new Promise<DetectionResult[]>((resolve) => {
    setTimeout(() => {
      resolve(analyzeVisual(ctx, targetWidth, targetHeight));
    }, 0);
  });
  
  // Skip frequency analysis for very large images or use timeout
  let frequencyResults: DetectionResult[] = [];
  if (Math.max(targetWidth, targetHeight) <= 1920) {
    try {
      frequencyResults = await Promise.race([
        new Promise<DetectionResult[]>((resolve) => {
          setTimeout(() => {
            resolve(analyzeFrequency(ctx, targetWidth, targetHeight));
          }, 0);
        }),
        new Promise<DetectionResult[]>((_, reject) => 
          setTimeout(() => reject(new Error('Frequency analysis timeout')), 5000)
        )
      ]);
    } catch (err) {
      console.warn('Frequency analysis skipped:', err);
      frequencyResults = [];
    }
  }

  // Scale regions back to original dimensions
  const scaleRegions = (results: DetectionResult[]): DetectionResult[] => {
    if (scale === 1) return results;
    return results.map(result => ({
      ...result,
      regions: result.regions.map(region => ({
        ...region,
        x: Math.round(region.x / scale),
        y: Math.round(region.y / scale),
        width: Math.round(region.width / scale),
        height: Math.round(region.height / scale),
      }))
    }));
  };

  const allDetections: DetectionResult[] = [
    ...metadataResults,
    ...scaleRegions(visualResults),
    ...scaleRegions(frequencyResults),
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
