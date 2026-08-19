"use client";

import React, { useState } from "react";
import {
  MapPin,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";

interface LawyerItem {
  id: string;
  name: string;
  court: string;
  location: string;
  experience: string;
  languages: string;
  specialization: string;
  rating: number;
  bio: string;
}

export default function LawyerDirectoryPage() {
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerItem | null>(null);

  const lawyers: LawyerItem[] = [
    {
      id: "law-1",
      name: "Adv. Rajesh Sharma",
      court: "High Court of Delhi & Supreme Court",
      location: "New Delhi",
      experience: "14 Years",
      languages: "English, Hindi",
      specialization: "Property, Civil & Constitutional Law",
      rating: 4.9,
      bio: "Senior counsel specializing in landlord-tenant disputes, land acquisition, and writ petitions before the High Court of Delhi.",
    },
    {
      id: "law-2",
      name: "Adv. Priya Deshmukh",
      court: "Bombay High Court",
      location: "Mumbai",
      experience: "11 Years",
      languages: "English, Marathi, Hindi",
      specialization: "Corporate Contracts, Arbitration & Consumer Disputes",
      rating: 4.8,
      bio: "Arbitrator and counsel with extensive trial experience in commercial arbitration and breach of contract disputes.",
    },
  ];

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Badge variant="blue">Verified Advocates</Badge>
        <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">
          Find Verified Legal Counsel
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Connect with Bar Council verified advocates across High Courts & Supreme Court of India.
        </p>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lawyers.map((lawyer) => (
          <Card key={lawyer.id} variant="glass" className="p-6 space-y-4 hover:border-blue-500/40">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 font-bold text-lg flex items-center justify-center shrink-0 border border-blue-500/30">
                {lawyer.name.split(" ")[1][0]}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-serif">
                    {lawyer.name}
                  </h3>
                  <Badge variant="gold" size="sm">★ {lawyer.rating}</Badge>
                </div>
                <p className="text-xs text-blue-400 font-medium">{lawyer.court}</p>
                <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] pt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {lawyer.location}</span>
                  <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {lawyer.experience}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-color)]">
              {lawyer.specialization}
            </p>

            <div className="pt-2 flex gap-3">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => setSelectedLawyer(lawyer)}
              >
                Request Consultation
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Lawyer Profile & Booking Drawer */}
      <Drawer
        isOpen={!!selectedLawyer}
        onClose={() => setSelectedLawyer(null)}
        title={selectedLawyer?.name || "Lawyer Profile"}
      >
        {selectedLawyer && (
          <div className="space-y-6">
            <div className="space-y-1">
              <Badge variant="blue">{selectedLawyer.court}</Badge>
              <h3 className="text-xl font-bold font-serif text-[var(--text-primary)]">
                {selectedLawyer.name}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">{selectedLawyer.specialization}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Professional Bio & Practice Summary
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed p-3 rounded-xl bg-[var(--bg-secondary)]">
                {selectedLawyer.bio}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-3">
              <h4 className="font-bold text-blue-300">Request Consultation Session</h4>
              <p className="text-blue-200/80">
                Submitting this request will securely share your AI case intelligence summary with Adv. {selectedLawyer.name.split(" ")[1]}.
              </p>
              <Button variant="primary" size="md" className="w-full">
                Confirm Consultation Request
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
