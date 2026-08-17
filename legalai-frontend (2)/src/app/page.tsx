import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/hero/Hero";
import { KnowledgeNetwork } from "@/components/sections/KnowledgeNetwork";
import { FeatureCards } from "@/components/sections/FeatureCards";
import { ArchitectureReveal } from "@/components/sections/ArchitectureReveal";
import { ModeSplit } from "@/components/sections/ModeSplit";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <KnowledgeNetwork />
      <ArchitectureReveal />
      <FeatureCards />
      <ModeSplit />
      <Footer />
    </main>
  );
}
