"use client";

import { useEffect, useRef } from "react";
import type { DetectionReport } from "@/lib/detection/types";

interface RegionOverlayProps {
  report: DetectionReport;
  imageUrl: string;
}

const COLORS = [
  "rgba(239, 68, 68, 0.5)",   // red
  "rgba(249, 115, 22, 0.5)",  // orange
  "rgba(234, 179, 8, 0.5)",   // yellow
  "rgba(168, 85, 247, 0.5)",  // purple
  "rgba(59, 130, 246, 0.5)",  // blue
];

export function RegionOverlay({ report, imageUrl }: RegionOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Scale to fit container (max 600px wide)
      const maxWidth = 600;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw detection regions
      report.detections.forEach((detection, di) => {
        const color = COLORS[di % COLORS.length];
        const borderColor = color.replace("0.5)", "1)");

        detection.regions.forEach((region) => {
          const x = region.x * scale;
          const y = region.y * scale;
          const w = region.width * scale;
          const h = region.height * scale;

          ctx.fillStyle = color;
          ctx.fillRect(x, y, w, h);

          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, w, h);

          // Label
          ctx.font = "bold 11px system-ui";
          const label = detection.type;
          const labelWidth = ctx.measureText(label).width + 8;
          ctx.fillStyle = borderColor.replace("0.5)", "0.9)");
          ctx.fillRect(x, y - 18, labelWidth, 18);
          ctx.fillStyle = "white";
          ctx.fillText(label, x + 4, y - 5);
        });
      });
    };
    img.src = imageUrl;
  }, [report, imageUrl]);

  return (
    <div className="overflow-hidden rounded-lg border border-border/50">
      <canvas ref={canvasRef} className="w-full" />
    </div>
  );
}
