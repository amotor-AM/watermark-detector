# WatermarkDetect

Universal watermark detection web app. Detect watermarks from TikTok, Instagram, YouTube, CapCut, stock photos, and more — entirely in your browser.

## Features

- **Universal Detection** — Supports multiple platforms and watermark types
- **100% Private** — All processing runs client-side; images never leave your device
- **Multi-Layer Analysis** — Edge detection, frequency analysis (FFT), color channel analysis, metadata extraction, pattern matching
- **Visible & Invisible** — Detects logos, text overlays, semi-transparent marks, tiled patterns, and embedded watermarks
- **Visual Region Mapping** — Highlights detected watermark regions on the image
- **Dark Mode** — Full light/dark theme support
- **Mobile Responsive** — Works on all screen sizes

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Animations:** Framer Motion
- **Detection:** Canvas API, Sobel edge detection, FFT frequency analysis, EXIF/XMP metadata (via exifr)
- **Icons:** Lucide React

## Detection Methods

| Method | What it finds |
|---|---|
| Edge detection (Sobel) | Logos, text overlays, sharp branding elements |
| Frequency analysis (FFT) | Invisible/embedded watermarks in frequency domain |
| Color channel analysis | Semi-transparent overlays, gradient bands |
| Pattern matching | Tiled/repeating watermarks (stock photos) |
| Metadata extraction | EXIF/XMP data revealing source platform or software |
| Platform heuristics | TikTok, CapCut, Instagram-specific watermark patterns |

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Landing page
│   └── detect/
│       └── page.tsx        # Detection tool page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── navbar.tsx          # Navigation bar
│   ├── footer.tsx          # Footer
│   ├── theme-provider.tsx  # Dark/light theme context
│   ├── image-dropzone.tsx  # Drag-and-drop image upload
│   ├── detection-results.tsx # Results display
│   └── region-overlay.tsx  # Canvas overlay for visual mapping
└── lib/
    ├── utils.ts            # Utility functions
    └── detection/
        ├── types.ts        # TypeScript types
        ├── engine.ts       # Main detection orchestrator
        ├── visual.ts       # Visual analysis (edges, colors, patterns)
        ├── frequency.ts    # FFT frequency domain analysis
        └── metadata.ts     # EXIF/XMP metadata extraction
```

## Deployment

Optimized for Vercel free tier:

```bash
npx vercel
```

Zero server cost — all detection runs client-side.

## License

MIT
