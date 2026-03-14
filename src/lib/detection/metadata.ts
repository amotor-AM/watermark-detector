import exifr from "exifr";
import type { DetectionResult, ImageMetadata } from "./types";

const WATERMARK_SOFTWARE = [
  "tiktok",
  "capcut",
  "instagram",
  "snapchat",
  "adobe",
  "canva",
  "photoshop",
  "lightroom",
  "vsco",
  "snapseed",
];

const WATERMARK_INDICATORS = [
  "watermark",
  "copyright",
  "branded",
  "overlay",
  "logo",
  "stock",
  "shutterstock",
  "getty",
  "adobe stock",
  "istock",
  "unsplash",
  "pexels",
];

export async function extractMetadata(file: File): Promise<ImageMetadata> {
  try {
    const parsed = await exifr.parse(file, {
      tiff: true,
      xmp: true,
      icc: false,
      iptc: true,
      jfif: true,
      ihdr: true,
    });

    if (!parsed) return {};

    return {
      format: parsed.FileType || parsed.MIMEType,
      software: parsed.Software || parsed.CreatorTool,
      creator: parsed.Creator || parsed.Artist || parsed.Author,
      copyright: parsed.Copyright || parsed.Rights,
      comment: parsed.Comment || parsed.UserComment || parsed.Description,
      exif: parsed,
    };
  } catch {
    return {};
  }
}

export function analyzeMetadata(metadata: ImageMetadata): DetectionResult[] {
  const results: DetectionResult[] = [];

  const allValues = Object.values(metadata.exif || {})
    .filter((v) => typeof v === "string")
    .map((v) => (v as string).toLowerCase());

  const softwareMatch = WATERMARK_SOFTWARE.find(
    (sw) =>
      metadata.software?.toLowerCase().includes(sw) ||
      allValues.some((v) => v.includes(sw))
  );

  if (softwareMatch) {
    results.push({
      type: "metadata",
      platform: softwareMatch,
      confidence: 0.6,
      description: `Image was processed by ${softwareMatch}`,
      regions: [],
      details: { software: metadata.software || softwareMatch },
    });
  }

  const indicatorMatch = WATERMARK_INDICATORS.find(
    (ind) =>
      metadata.copyright?.toLowerCase().includes(ind) ||
      metadata.comment?.toLowerCase().includes(ind) ||
      allValues.some((v) => v.includes(ind))
  );

  if (indicatorMatch) {
    results.push({
      type: "metadata",
      confidence: 0.75,
      description: `Metadata contains watermark indicator: "${indicatorMatch}"`,
      regions: [],
      details: {
        indicator: indicatorMatch,
        copyright: metadata.copyright || "",
      },
    });
  }

  return results;
}
