import { Scan } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Scan className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold">WatermarkDetect</span>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/detect" className="hover:text-foreground transition-colors">
              Detect Tool
            </Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} WatermarkDetect. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
