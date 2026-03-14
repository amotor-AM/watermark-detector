"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import {
  Eye,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  FileImage,
  Fingerprint,
  Layers,
} from "lucide-react";
import type { DetectionReport, DetectionResult } from "@/lib/detection/types";

interface DetectionResultsProps {
  report: DetectionReport;
}

function getScoreColor(score: number): string {
  if (score < 25) return "text-green-500";
  if (score < 50) return "text-yellow-500";
  if (score < 75) return "text-orange-500";
  return "text-red-500";
}

function getScoreLabel(score: number): string {
  if (score < 25) return "Clean";
  if (score < 50) return "Possible";
  if (score < 75) return "Likely";
  return "Strong";
}

function getScoreBg(score: number): string {
  if (score < 25) return "bg-green-500";
  if (score < 50) return "bg-yellow-500";
  if (score < 75) return "bg-orange-500";
  return "bg-red-500";
}

function getTypeIcon(type: string) {
  switch (type) {
    case "logo":
      return Eye;
    case "text-overlay":
      return Eye;
    case "semi-transparent":
      return Layers;
    case "metadata":
      return Fingerprint;
    case "pattern":
      return Layers;
    case "border":
      return Layers;
    default:
      return Info;
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "logo":
      return "Logo / Icon";
    case "text-overlay":
      return "Text Overlay";
    case "semi-transparent":
      return "Semi-Transparent";
    case "metadata":
      return "Metadata";
    case "pattern":
      return "Pattern / Frequency";
    case "border":
      return "Border / Strip";
    default:
      return type;
  }
}

function DetectionCard({ detection }: { detection: DetectionResult }) {
  const Icon = getTypeIcon(detection.type);
  const confidencePercent = Math.round(detection.confidence * 100);

  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {getTypeLabel(detection.type)}
              </span>
              {detection.platform && (
                <Badge variant="secondary" className="text-xs">
                  {detection.platform}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {detection.description}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1">
                <Progress value={confidencePercent} className="h-1.5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {confidencePercent}%
              </span>
            </div>
            {detection.regions.length > 0 && detection.regions[0].width > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Region: ({detection.regions[0].x}, {detection.regions[0].y}) -{" "}
                {detection.regions[0].width}x{detection.regions[0].height}px
              </p>
            )}
            {detection.details && (
              <div className="mt-2 flex flex-wrap gap-1">
                {Object.entries(detection.details).map(([key, value]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DetectionResults({ report }: DetectionResultsProps) {
  const hasDetections = report.detections.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overall Score */}
      <Card className="overflow-hidden border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            {hasDetections ? (
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            Detection Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-muted/30"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={`${report.overallScore * 2.64} 264`}
                  strokeLinecap="round"
                  className={getScoreColor(report.overallScore)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${getScoreColor(report.overallScore)}`}>
                  {report.overallScore}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className={`${getScoreBg(report.overallScore)} text-white`}>
                  {getScoreLabel(report.overallScore)} Watermark
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {report.detections.length === 0
                  ? "No watermarks detected. The image appears clean."
                  : `Found ${report.detections.length} potential watermark${report.detections.length > 1 ? "s" : ""}.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Info */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <FileImage className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Dimensions</p>
                <p className="text-sm font-medium">
                  {report.imageWidth} x {report.imageHeight}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileImage className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Size</p>
                <p className="text-sm font-medium">
                  {(report.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Processing</p>
                <p className="text-sm font-medium">
                  {report.processingTimeMs.toFixed(0)}ms
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Detections</p>
                <p className="text-sm font-medium">{report.detections.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detections */}
      {report.detections.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Detected Watermarks
          </h3>
          {report.detections.map((detection, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <DetectionCard detection={detection} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Metadata */}
      {report.metadata && Object.keys(report.metadata).length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Image Metadata
            </h3>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {report.metadata.software && (
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Software
                      </dt>
                      <dd className="text-sm">{report.metadata.software}</dd>
                    </div>
                  )}
                  {report.metadata.creator && (
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Creator
                      </dt>
                      <dd className="text-sm">{report.metadata.creator}</dd>
                    </div>
                  )}
                  {report.metadata.copyright && (
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Copyright
                      </dt>
                      <dd className="text-sm">{report.metadata.copyright}</dd>
                    </div>
                  )}
                  {report.metadata.format && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Format</dt>
                      <dd className="text-sm">{report.metadata.format}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </motion.div>
  );
}
