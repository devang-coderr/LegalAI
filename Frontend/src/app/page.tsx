"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Search,
  FileText,
  BookOpen,
  CheckCircle2,
  Gavel,
  Briefcase,
  Users,
} from "lucide-react";

import { FloatingNavbar } from "@/components/layout/FloatingNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LadyJusticeArt } from "@/components/legal/LadyJusticeArt";
import { SupremeCourtColumns } from "@/components/legal/SupremeCourtColumns";
import { LegalNetworkGraph } from "@/components/legal/LegalNetworkGraph";
import { HeroSceneRotator, SCENES, type HeroScene } from "@/components/legal/HeroSceneRotator";
import { CinematicBackground } from "@/components/layout/CinematicBackground";

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeScene, setActiveScene] = useState<HeroScene>(SCENES[0]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/citizen/case-intelligence?query=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/citizen/case-intelligence");
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      {/* Header / Navbar */}
      <FloatingNavbar />

      <main className="relative pt-28 pb-20 space-y-24 sm:space-y-32">
        {/* ================= HERO SECTION ================= */}
        {/* Cinematic visual is scoped to this section only — it must not bleed into the rest of the page. */}
        <section className="relative overflow-hidden rounded-[2.5rem] mx-3 sm:mx-6 lg:mx-8 min-h-[78vh] flex items-end">
          {/* Quiet gold wash + column motif, sits under the photo scenes */}
          <CinematicBackground variant="hero" className="rounded-[2.5rem]" />
          {/* Crossfading photo scenes with Ken-Burns drift + built-in readability overlay */}
          <HeroSceneRotator onSceneChange={(scene) => setActiveScene(scene)} />

          <div className="relative z-10 w-full max-w-4xl px-4 sm:px-8 pb-14 pt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/25 bg-white/10 backdrop-blur-md text-xs font-semibold text-white shadow-lg mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Next-Gen Legal Technology Platform</span>
            </motion.div>

            {/* Rotating headline — crossfades with each hero scene, ~600ms, no bounce */}
            <div className="space-y-2 min-h-[6.5rem] sm:min-h-[8.5rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScene.heading}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-sans text-white leading-[1.15] drop-shadow-md">
                    {activeScene.heading}
                  </h1>
                  <h2 className="text-3xl sm:text-5xl font-normal tracking-tight font-serif italic text-amber-300 drop-shadow-md">
                    {activeScene.subheading}
                  </h2>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="min-h-[3.5rem] max-w-2xl mt-4 mb-8">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeScene.supportingText}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
                  className="text-base sm:text-lg text-white/85 leading-relaxed font-sans"
                >
                  {activeScene.supportingText}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Interactive Quick Legal Search Input — static, not tied to scene rotation */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              onSubmit={handleHeroSearch}
              className="relative max-w-xl"
            >
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-blue-300 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Describe your legal issue (e.g., Property dispute regarding ancestral land title)..."
                  className="w-full pl-12 pr-32 py-4 rounded-2xl bg-white/12 backdrop-blur-md border border-white/25 text-sm text-white placeholder-white/60 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-300/30 shadow-xl transition-all"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="absolute right-2 text-xs"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Solve Case
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2 mt-2.5 px-2 text-[11px] text-white/70">
                <span>Try: &quot;Tenant eviction notice response&quot;</span>
                <span className="flex items-center gap-1 text-emerald-300">
                  <Shield className="w-3 h-3" /> Encrypted & Private
                </span>
              </div>
            </motion.form>

            {/* Hero Action Buttons — static, not tied to scene rotation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 pt-5"
            >
              <Link href="/citizen">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Users className="w-4 h-4" />}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Citizen Portal
                </Button>
              </Link>

              <Link href="/lawyer">
                <Button
                  variant="secondary"
                  size="lg"
                  className="!bg-white/10 !border-white/30 !text-white hover:!bg-white/20"
                  leftIcon={<Briefcase className="w-4 h-4 text-purple-200" />}
                >
                  Lawyer Workspace
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ================= STATS TICKER ================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: "Indexed Judgments", value: "500,000+", detail: "Supreme Court & High Courts" },
              { label: "Citation Precision", value: "99.4%", detail: "Ratio Decidendi Matching" },
              { label: "OCR Document Processing", value: "< 5 Sec", detail: "Clause & Risk Extraction" },
              { label: "Active Legal Workspaces", value: "10,000+", detail: "Citizens & Lawyers" },
            ].map((stat, idx) => (
              <Card key={idx} variant="glass" hoverable={false} className="p-6 text-center space-y-1">
                <h3 className="text-2xl sm:text-4xl font-extrabold font-serif text-blue-400">
                  {stat.value}
                </h3>
                <p className="text-xs font-semibold text-[var(--text-primary)]">{stat.label}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{stat.detail}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ================= FEATURES GRID ================= */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="blue">Architectural Capabilities</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--text-primary)]">
              Powered by Judicial AI Engineering
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Designed specifically for Indian law, precedents, statutory codes, and litigation workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="glass" className="space-y-4">
              <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-400">
                <Gavel className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-serif text-[var(--text-primary)]">
                Case Intelligence Solver
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Translates plain language disputes into structured facts, applicable statutory provisions, and actionable next steps.
              </p>
              <Link
                href="/citizen/case-intelligence"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:underline pt-2"
              >
                Try Case Solver →
              </Link>
            </Card>

            <Card variant="glass" className="space-y-4">
              <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-serif text-[var(--text-primary)]">
                RAG Legal Research & Citations
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Retrieval-Augmented Generation connects AI syntheses directly to verified Supreme Court ratio decidendi & citations.
              </p>
              <Link
                href="/citizen/legal-research"
                className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:underline pt-2"
              >
                Explore Legal RAG →
              </Link>
            </Card>

            <Card variant="glass" className="space-y-4">
              <div className="p-3 w-fit rounded-xl bg-amber-500/10 text-amber-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-serif text-[var(--text-primary)]">
                Document OCR & Risk Checker
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Drag and drop contracts or court notices for automated clause detection, date extraction, and risk flags.
              </p>
              <Link
                href="/citizen/documents"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:underline pt-2"
              >
                Upload Document →
              </Link>
            </Card>
          </div>
        </section>

        {/* ================= AI KNOWLEDGE GRAPH SHOWCASE ================= */}
        <section id="research" className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="gold">Visual Knowledge Pipeline</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--text-primary)]">
              From Case Facts to Actionable Intelligence
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Hover over pipeline stages to see how LegalAI processes legal queries.
            </p>
          </div>

          <LegalNetworkGraph />
        </section>

        {/* ================= SUPREME COURT COLUMNS SCROLL REVEAL ================= */}
        <SupremeCourtColumns />

        {/* ================= DUAL WORKSPACE SHOWCASE ================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="blue">Tailored User Experiences</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--text-primary)]">
              Designed for Citizens & Advocates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Citizen Portal Card */}
            <Card variant="glass" className="p-8 space-y-6 border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif text-[var(--text-primary)]">
                    Citizen Mode
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">Clear, accessible legal guidance</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Plain language legal problem solver</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Document required checklist & risk check</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Directory of verified Advocates & High Court lawyers</span>
                </li>
              </ul>

              <Link href="/citizen">
                <Button variant="primary" className="w-full mt-4" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Enter Citizen Portal
                </Button>
              </Link>
            </Card>

            {/* Lawyer Workspace Card */}
            <Card variant="glass" className="p-8 space-y-6 border-purple-500/30">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif text-[var(--text-primary)]">
                    Lawyer Workspace
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">High-density professional suite</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Deep case insights & precedent ratio matching</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Hearing preparation calendar & AI draft generator</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Precedent database filterable by Court & Section</span>
                </li>
              </ul>

              <Link href="/lawyer">
                <Button variant="secondary" className="w-full mt-4 border-purple-500/40 hover:bg-purple-500/10">
                  Enter Lawyer Workspace
                </Button>
              </Link>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
