"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, Scale, BookOpen, Gavel } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface NetworkNode {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export function LegalNetworkGraph() {
  const [activeNode, setActiveNode] = useState<string>("precedent");

  const nodes: NetworkNode[] = [
    {
      id: "case",
      label: "1. CASE FACTS",
      sublabel: "Natural Language Input",
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      color: "from-blue-500/20 to-blue-600/30 border-blue-500/40",
      description: "Structured extraction of plaintiff & defendant arguments, chronological events, and undisputed evidence.",
    },
    {
      id: "facts",
      label: "2. LEGAL ISSUES",
      sublabel: "NLP Entity Extraction",
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      color: "from-purple-500/20 to-purple-600/30 border-purple-500/40",
      description: "Automated identification of actionable legal disputes, breach of contract, or constitutional rights violations.",
    },
    {
      id: "law",
      label: "3. STATUTE / SECTION",
      sublabel: "Indian Penal Code / BNS / CPC",
      icon: <BookOpen className="w-5 h-5 text-amber-400" />,
      color: "from-amber-500/20 to-amber-600/30 border-amber-500/40",
      description: "Automated section mapping to statutory provisions, constitutional articles, and regulatory clauses.",
    },
    {
      id: "precedent",
      label: "4. PRECEDENTS & RAG",
      sublabel: "Vector Embedding RAG",
      icon: <Scale className="w-5 h-5 text-emerald-400" />,
      color: "from-emerald-500/20 to-emerald-600/30 border-emerald-500/40",
      description: "Semantic search across 500,000+ Supreme Court & High Court judgments for ratio decidendi matching.",
    },
    {
      id: "judgment",
      label: "5. STRATEGY & ADVISORY",
      sublabel: "Actionable Output",
      icon: <Gavel className="w-5 h-5 text-cyan-400" />,
      color: "from-cyan-500/20 to-cyan-600/30 border-cyan-500/40",
      description: "Synthesized litigation strategy, winning probability estimate, and draft petition outline.",
    },
  ];

  const currentNode = nodes.find((n) => n.id === activeNode) || nodes[3];

  return (
    <div className="w-full space-y-8">
      {/* Interactive Node Flow Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {nodes.map((node) => {
          const isActive = node.id === activeNode;
          return (
            <motion.div
              key={node.id}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => setActiveNode(node.id)}
              className={`cursor-pointer p-4 rounded-xl border bg-gradient-to-b backdrop-blur-md transition-all duration-300 ${
                node.color
              } ${isActive ? "ring-2 ring-blue-400 shadow-xl shadow-blue-500/20" : "opacity-75 hover:opacity-100"}`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-1.5 rounded-lg bg-black/40 dark:bg-white/10">{node.icon}</div>
                <Badge variant={isActive ? "blue" : "neutral"} size="sm">
                  {node.id.toUpperCase()}
                </Badge>
              </div>
              <h4 className="text-xs font-bold text-[var(--text-primary)] font-serif truncate">
                {node.label}
              </h4>
              <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 truncate">{node.sublabel}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Node Details Card */}
      <Card variant="glass" className="border-blue-500/30 bg-[var(--bg-card)]/80 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">{currentNode.icon}</div>
            <div>
              <span className="text-xs uppercase font-sans tracking-widest text-blue-400 font-semibold">
                AI Knowledge Pipeline Stage
              </span>
              <h3 className="text-xl font-bold text-[var(--text-primary)] font-serif">
                {currentNode.label}
              </h3>
            </div>
          </div>
          <Badge variant="gold">{currentNode.sublabel}</Badge>
        </div>

        <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed">
          {currentNode.description}
        </p>
      </Card>
    </div>
  );
}
