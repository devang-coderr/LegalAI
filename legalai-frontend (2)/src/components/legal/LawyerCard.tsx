import { MapPin, Star, Languages } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Lawyer } from "@/types/lawyer";

export function LawyerCard({ lawyer }: { lawyer: Lawyer }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--azure-soft)] font-[family-name:var(--font-display)] text-lg text-[var(--azure)]">
          {lawyer.name
            .split(" ")
            .map((p) => p[0])
            .slice(-2)
            .join("")}
        </div>
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
            {lawyer.name}
          </h3>
          <p className="text-xs text-[var(--ink-faint)]">{lawyer.court}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {lawyer.practiceAreas.map((area) => (
          <span
            key={area}
            className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-[11px] text-[var(--ink-muted)]"
          >
            {area}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--ink-faint)]">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {lawyer.location}
        </span>
        <span className="flex items-center gap-1">
          <Languages className="h-3.5 w-3.5" /> {lawyer.languages.join(", ")}
        </span>
        {lawyer.rating && (
          <span className="flex items-center gap-1 text-[var(--gold)]">
            <Star className="h-3.5 w-3.5 fill-current" /> {lawyer.rating}
          </span>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <Button href={`/citizen/lawyers/${lawyer.id}`} variant="ghost" className="flex-1 justify-center px-3 py-2 text-xs">
          View Profile
        </Button>
        <Button href={`/citizen/lawyers/${lawyer.id}`} className="flex-1 justify-center px-3 py-2 text-xs">
          Request Consultation
        </Button>
      </div>
    </Card>
  );
}
