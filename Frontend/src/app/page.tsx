"use client";

import React from "react";

import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Hero } from "@/components/landing/Hero";
import { Legal3DStory } from "@/components/landing/Legal3DStory";
import { StatsSection } from "@/components/landing/StatsSection";
import { KnowledgeNetwork } from "@/components/landing/KnowledgeNetwork";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PhoneShowcase } from "@/components/landing/PhoneShowcase";
import { Insights } from "@/components/landing/Insights";
import { AboutSection } from "@/components/landing/AboutSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

/**
 * Public marketing landing page.
 *
 * This intentionally does NOT reveal Citizen Mode / Lawyer Workspace / Legal RAG /
 * Case Analysis as first-class navigation — those remain the reward for signing in.
 * The authenticated application (src/app/citizen, src/app/lawyer, dashboards, auth,
 * RAG, OCR, etc.) is completely untouched by this file.
 */
export default function LandingPage() {
  return (
    <div className="landing-root relative min-h-screen transition-colors">
      <LandingNavbar />

      <main className="relative">
        <Hero />
        <Legal3DStory />
        <StatsSection />
        <KnowledgeNetwork />
        <HowItWorks />
        <PhoneShowcase />
        <Insights />
        <AboutSection />
        <ContactSection />
        <FinalCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
