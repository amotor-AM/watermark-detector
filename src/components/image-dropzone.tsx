"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ImageIcon, X } from "lucide-react";
import { Button } from "./ui/button";

interface ImageDropzoneProps {
  onImageSelect: (file: File) => void;
  isProcessing: boolean;
}

export function ImageDropzone({
  onImageSelect,
  isProcessing,
}: ImageDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
      onImageSelect(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearImage = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <label
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all sm:p-16 ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border/60 hover:border-primary/50 hover:bg-muted/30"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInput}
                disabled={isProcessing}
              />
              <motion.div
                animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
              >
                <Upload className="h-8 w-8 text-primary" />
              </motion.div>
              <p className="text-center text-base font-medium">
                Drag & drop your image here
              </p>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                or click to browse &middot; PNG, JPG, WebP supported
              </p>
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative overflow-hidden rounded-xl border border-border/50 bg-card/50"
          >
            {!isProcessing && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center justify-center bg-muted/20 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="max-h-80 rounded-lg object-contain"
              />
            </div>
            {selectedFile && (
              <div className="flex items-center gap-3 border-t border-border/40 px-4 py-3">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB &middot;{" "}
                    {selectedFile.type.split("/")[1]?.toUpperCase()}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
