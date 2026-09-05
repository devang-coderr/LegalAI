import { Construction, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface DemoFeatureScreenProps { workspace: "Citizen" | "Lawyer"; title: string; description: string; }
/** Legacy fallback component retained for any future API-only screen. Core workspace screens no longer use it. */
export function DemoFeatureScreen({ workspace, title, description }: DemoFeatureScreenProps) {
  return <section className="mx-auto flex min-h-[58vh] max-w-2xl items-center px-4 py-12"><Card variant="glass" hoverable={false} className="w-full border-[var(--accent-blue-glow)] text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400"><Construction className="h-5 w-5" /></div><Badge variant="blue" className="mt-5">{workspace} workspace · API screen</Badge><h1 className="mt-4 font-serif text-3xl font-bold">{title}</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">{description}</p><div className="mt-7 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]"><Sparkles className="h-3.5 w-3.5 text-blue-400" />Reserved for an API-backed extension</div></Card></section>;
}
