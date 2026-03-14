import type { DetectionResult } from "./types";

/**
 * Simple FFT-based frequency analysis to detect invisible watermarks.
 * Invisible watermarks often show up as periodic spikes in the frequency domain.
 */

function fft1d(
  re: Float64Array,
  im: Float64Array,
  n: number,
  inverse: boolean
): void {
  // Bit-reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  // Cooley-Tukey FFT
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1;
    const angle = ((2 * Math.PI) / len) * (inverse ? -1 : 1);
    const wRe = Math.cos(angle);
    const wIm = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let j = 0; j < half; j++) {
        const uRe = re[i + j];
        const uIm = im[i + j];
        const vRe = re[i + j + half] * curRe - im[i + j + half] * curIm;
        const vIm = re[i + j + half] * curIm + im[i + j + half] * curRe;
        re[i + j] = uRe + vRe;
        im[i + j] = uIm + vIm;
        re[i + j + half] = uRe - vRe;
        im[i + j + half] = uIm - vIm;
        const newCurRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = newCurRe;
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < n; i++) {
      re[i] /= n;
      im[i] /= n;
    }
  }
}

function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

export function analyzeFrequency(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): DetectionResult[] {
  const results: DetectionResult[] = [];

  // Downsample for performance (FFT on full resolution is expensive)
  const maxDim = 256;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const sw = Math.floor(width * scale);
  const sh = Math.floor(height * scale);

  // Get downsampled grayscale data
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = sw;
  tempCanvas.height = sh;
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCtx.drawImage(ctx.canvas, 0, 0, sw, sh);
  const imageData = tempCtx.getImageData(0, 0, sw, sh);

  const n = nextPow2(Math.max(sw, sh));

  // Perform 1D FFT on rows and accumulate magnitude spectrum
  const magnitudeSpectrum = new Float64Array(n);
  const re = new Float64Array(n);
  const im = new Float64Array(n);

  // Row-wise FFT
  for (let y = 0; y < sh; y++) {
    re.fill(0);
    im.fill(0);
    for (let x = 0; x < sw; x++) {
      const idx = (y * sw + x) * 4;
      re[x] =
        imageData.data[idx] * 0.299 +
        imageData.data[idx + 1] * 0.587 +
        imageData.data[idx + 2] * 0.114;
    }
    fft1d(re, im, n, false);
    for (let x = 0; x < n; x++) {
      magnitudeSpectrum[x] += Math.sqrt(re[x] * re[x] + im[x] * im[x]);
    }
  }

  // Normalize
  const maxMag = Math.max(...magnitudeSpectrum);
  if (maxMag > 0) {
    for (let i = 0; i < n; i++) {
      magnitudeSpectrum[i] /= maxMag;
    }
  }

  // Look for unusual spikes in mid-to-high frequencies
  // Invisible watermarks often embed in specific frequency bands
  const lowCutoff = Math.floor(n * 0.1);
  const highCutoff = Math.floor(n * 0.45);

  let avgMagnitude = 0;
  let count = 0;
  const spikes: { freq: number; magnitude: number }[] = [];

  for (let i = lowCutoff; i < highCutoff; i++) {
    avgMagnitude += magnitudeSpectrum[i];
    count++;
  }
  avgMagnitude /= count || 1;

  for (let i = lowCutoff; i < highCutoff; i++) {
    if (magnitudeSpectrum[i] > avgMagnitude * 3) {
      spikes.push({ freq: i, magnitude: magnitudeSpectrum[i] });
    }
  }

  if (spikes.length >= 2 && spikes.length <= 20) {
    results.push({
      type: "pattern",
      confidence: Math.min(0.65, spikes.length * 0.05),
      description: `Frequency domain analysis found ${spikes.length} unusual spectral peaks — possible invisible watermark embedding`,
      regions: [{ x: 0, y: 0, width, height, confidence: 0.5 }],
      details: {
        spectralPeaks: String(spikes.length),
        frequencyRange: `${lowCutoff}-${highCutoff}`,
      },
    });
  }

  return results;
}
