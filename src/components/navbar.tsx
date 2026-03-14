"use client";

import Link from "next/link";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import { Moon, Sun, Scan } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Scan className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg">WatermarkDetect</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/detect"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Detect
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Link href="/detect">
            <Button size="sm" className="hidden sm:flex">
              Try Free
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
