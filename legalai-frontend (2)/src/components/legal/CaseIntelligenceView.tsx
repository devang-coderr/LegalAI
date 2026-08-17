import { FileText, ListChecks, Scale, BookOpen, Gavel, ArrowRight } from "lucide-react";

const SECTIONS = [
  { icon: FileText, title: "Case Summary", body: "A boundary-wall dispute between neighbouring property owners regarding an alleged encroachment." },
  { icon: ListChecks, title: "Important Facts", body: "Construction began without a joint boundary survey; no written notice was given beforehand." },
  { icon: Scale, title: "Legal Issues", body: "Encroachment on immovable property; obligation to provide prior notice under local municipal law." },
  { icon: BookOpen, title: "Relevant Law", body: "Sample: Specific Relief Act provisions on injunctions; local municipal building bye-laws." },
  { icon: Gavel, title: "Relevant Precedents", body: "3 sample judgments addressing similar boundary-encroachment disputes." },
  { icon: ArrowRight, title: "Suggested Next Steps", body: "Request a joint boundary survey; send a formal notice before pursuing further action." },
];

export function CaseIntelligenceView({ caseTitle }: { caseTitle: string }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">{caseTitle}</h2>
        <span className="rounded-full bg-[var(--gold-soft)] px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-[var(--gold)]">
          Demo Data
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((item) => (
          <div key={item.title} className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)]/50 p-4">
            <div className="flex items-center gap-2 text-[var(--azure)]">
              <item.icon className="h-4 w-4" />
              <p className="text-xs font-medium uppercase tracking-wide">{item.title}</p>
            </div>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
