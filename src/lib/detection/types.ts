export interface WatermarkRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface DetectionResult {
  type: WatermarkType;
  platform?: string;
  confidence: number;
  description: string;
  regions: WatermarkRegion[];
  details?: Record<string, string>;
}

export type WatermarkType =
  | "logo"
  | "text-overlay"
  | "semi-transparent"
  | "metadata"
  | "pattern"
  | "border";

export interface DetectionReport {
  imageWidth: number;
  imageHeight: number;
  fileName: string;
  fileSize: number;
  processingTimeMs: number;
  detections: DetectionResult[];
  overallScore: number; // 0-100, likelihood of watermark presence
  metadata: ImageMetadata;
}

export interface ImageMetadata {
  format?: string;
  software?: string;
  creator?: string;
  copyright?: string;
  comment?: string;
  exif?: Record<string, unknown>;
  xmp?: Record<string, unknown>;
}
