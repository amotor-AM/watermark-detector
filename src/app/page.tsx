"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scan,
  Shield,
  Zap,
  Eye,
  Upload,
  FileSearch,
  BarChart3,
  Check,
  ArrowRight,
  Lock,
  Globe,
  Layers,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <motion.div
          className="relative mx-auto max-w-4xl text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              100% Free &middot; Runs in your browser
            </Badge>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Detect watermarks{" "}
            <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              instantly
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Universal watermark detection for TikTok, Instagram, YouTube,
            CapCut, and more. Private, fast, and completely free.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/detect">
              <Button size="lg" className="gap-2 px-8 text-base">
                Start Detecting <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="px-8 text-base">
                Learn More
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/40 bg-muted/30 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Three steps. Zero uploads.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Your images never leave your device.
            </p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Upload,
                step: "01",
                title: "Drop your image",
                desc: "Drag and drop or click to select any image file.",
              },
              {
                icon: FileSearch,
                step: "02",
                title: "Instant analysis",
                desc: "Our engine scans for visible and invisible watermarks in milliseconds.",
              },
              {
                icon: BarChart3,
                step: "03",
                title: "Get your report",
                desc: "See detected watermarks, their locations, types, and confidence scores.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <span className="mb-2 text-5xl font-bold text-primary/10">
                      {item.step}
                    </span>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Everything you need to detect watermarks
            </h2>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Globe,
                title: "Universal Detection",
                desc: "Supports TikTok, Instagram, YouTube, CapCut, stock photos, and more.",
              },
              {
                icon: Shield,
                title: "100% Private",
                desc: "All processing happens in your browser. Images never leave your device.",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Advanced algorithms analyze your image in under a second.",
              },
              {
                icon: Eye,
                title: "Visible & Invisible",
                desc: "Detects logos, text overlays, semi-transparent marks, and hidden watermarks.",
              },
              {
                icon: Layers,
                title: "Multi-Layer Analysis",
                desc: "Edge detection, frequency analysis, color channels, and metadata inspection.",
              },
              {
                icon: Lock,
                title: "No Account Needed",
                desc: "Start detecting immediately — no sign-up, no email, no friction.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-border/50 bg-card/50 transition-colors hover:border-primary/30">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="border-t border-border/40 bg-muted/30 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Works with all major platforms
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our detection engine recognizes watermark patterns from these
              platforms and more.
            </p>
          </motion.div>
          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {[
              "TikTok",
              "Instagram",
              "YouTube",
              "CapCut",
              "Snapchat",
              "Shutterstock",
              "Getty Images",
              "Adobe Stock",
              "Canva",
            ].map((platform) => (
              <Badge
                key={platform}
                variant="outline"
                className="px-4 py-2 text-sm"
              >
                {platform}
              </Badge>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">
              Pricing
            </Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start free, upgrade when you need more.
            </p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl">Free</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Perfect for individual use
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Single image detection",
                      "All detection methods",
                      "In-browser processing",
                      "Watermark type identification",
                      "Detection confidence scores",
                      "Visual region highlighting",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/detect" className="mt-8 block">
                    <Button className="w-full" variant="outline">
                      Get Started Free
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro Tier */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="relative h-full border-primary/50 bg-gradient-to-b from-primary/5 to-transparent">
                <div className="absolute -top-3 right-6">
                  <Badge className="bg-primary px-3 py-1">Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">Pro</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$7</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    For professionals and teams
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Everything in Free",
                      "Batch processing (50+ images)",
                      "API access",
                      "White-label (remove branding)",
                      "Priority processing",
                      "Export detection reports (PDF/JSON)",
                      "Email support",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-8 w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-muted/30 px-4 py-20 sm:px-6">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Scan className="mx-auto mb-6 h-12 w-12 text-primary" />
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to detect watermarks?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Drop your image and get results in seconds. No sign-up required.
          </p>
          <Link href="/detect">
            <Button size="lg" className="mt-8 gap-2 px-8 text-base">
              Try It Now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
