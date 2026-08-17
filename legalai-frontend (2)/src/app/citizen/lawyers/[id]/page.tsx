import { notFound } from "next/navigation";
import { MapPin, Languages, Star, GraduationCap } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MOCK_LAWYERS } from "@/mocks/lawyers";

export function generateStaticParams() {
  return MOCK_LAWYERS.map((l) => ({ id: l.id }));
}

export default async function LawyerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lawyer = MOCK_LAWYERS.find((l) => l.id === id);
  if (!lawyer) notFound();

  return (
    <DashboardShell role="citizen">
      <PageHeader title={lawyer.name} description={lawyer.court} />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card glow={false} className="lg:col-span-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">Overview</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
              <GraduationCap className="h-4 w-4 text-[var(--azure)]" /> {lawyer.experienceYears} years experience
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
              <MapPin className="h-4 w-4 text-[var(--azure)]" /> {lawyer.location}
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
              <Languages className="h-4 w-4 text-[var(--azure)]" /> {lawyer.languages.join(", ")}
            </div>
            {lawyer.rating && (
              <div className="flex items-center gap-2 text-sm text-[var(--gold)]">
                <Star className="h-4 w-4 fill-current" /> {lawyer.rating} rating
              </div>
            )}
          </div>

          <h3 className="mt-6 text-sm font-medium text-[var(--ink)]">Practice Areas</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {lawyer.practiceAreas.map((area) => (
              <span key={area} className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs text-[var(--ink-muted)]">
                {area}
              </span>
            ))}
          </div>
        </Card>

        <Card glow={false}>
          <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">Availability</h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Typically responds within 1–2 business days.
          </p>
          <Button className="mt-5 w-full justify-center">Request Consultation</Button>
        </Card>
      </div>
    </DashboardShell>
  );
}
