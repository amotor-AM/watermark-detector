"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageDropzone } from "@/components/image-dropzone";
import { DetectionResults } from "@/components/detection-results";
import { RegionOverlay } from "@/components/region-overlay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scan, RotateCcw, Shield, Loader2 } from "lucide-react";
import { detectWatermarks } from "@/lib/detection/engine";
import type { DetectionReport } from "@/lib/detection/types";

export default function DetectPage() {
  const [report, setReport] = useState<DetectionReport | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setReport(null);
    setImageUrl(URL.createObjectURL(file));

    try {
      const result = await detectWatermarks(file);
      setReport(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze image"
      );
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleReset = () => {
    setReport(null);
    setImageUrl(null);
    setError(null);
    setIsProcessing(false);
  };

  return (
    <div className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex items-center justify-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5">
            <Shield className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs text-muted-foreground">
              100% private — images never leave your device
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Watermark Detection
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload an image to scan for visible and invisible watermarks.
          </p>
        </motion.div>

        {/* Upload Area */}
        <AnimatePresence mode="wait">
          {!report && !isProcessing && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ImageDropzone
                onImageSelect={handleImageSelect}
                isProcessing={isProcessing}
              />
            </motion.div>
          )}

          {/* Processing */}
          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-border/50 bg-card/50">
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Scan className="h-12 w-12 text-primary" />
                  </motion.div>
                  <p className="mt-6 text-lg font-medium">Analyzing image...</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {[
                      "Metadata extraction",
                      "Edge detection",
                      "Frequency analysis",
                      "Pattern matching",
                      "Color analysis",
                    ].map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.3 }}
                      >
                        <Badge variant="secondary" className="text-xs">
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          {step}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="flex flex-col items-center p-8">
                  <p className="text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleReset}
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results */}
          {report && !isProcessing && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Results</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  New Scan
                </Button>
              </div>

              <Tabs defaultValue="report" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="report" className="flex-1">
                    Report
                  </TabsTrigger>
                  <TabsTrigger value="visual" className="flex-1">
                    Visual Map
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="report" className="mt-6">
                  <DetectionResults report={report} />
                </TabsContent>
                <TabsContent value="visual" className="mt-6">
                  {imageUrl && report.detections.some((d) => d.regions.length > 0) ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Detected regions are highlighted on the image.
                      </p>
                      <RegionOverlay report={report} imageUrl={imageUrl} />
                    </div>
                  ) : (
                    <Card className="border-border/50 bg-card/50">
                      <CardContent className="flex flex-col items-center p-8">
                        <p className="text-sm text-muted-foreground">
                          {report.detections.length === 0
                            ? "No watermark regions to display."
                            : "No spatial regions detected for visual mapping."}
                        </p>
                        {imageUrl && (
                          <div className="mt-4 overflow-hidden rounded-lg border border-border/50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageUrl}
                              alt="Uploaded"
                              className="max-h-80 object-contain"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
