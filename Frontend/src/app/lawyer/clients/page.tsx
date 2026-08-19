"use client";

import { useMemo, useState } from "react";
import { Calendar, ChevronRight, FileText, Mail, Phone, Search, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const clients = [
  { id:"CL-104", name:"Aarav Mehta", matter:"Property inheritance dispute", cases:2, next:"25 Aug 2026", status:"Active", phone:"+91 98••• 1204", email:"aarav@example.com" },
  { id:"CL-118", name:"Neha Kapoor", matter:"Employment termination claim", cases:1, next:"30 Aug 2026", status:"Action required", phone:"+91 97••• 4310", email:"neha@example.com" },
  { id:"CL-126", name:"Rohan Iyer", matter:"Construction contract dispute", cases:1, next:"05 Sep 2026", status:"Active", phone:"+91 99••• 8852", email:"rohan@example.com" },
  { id:"CL-132", name:"Priya Nair", matter:"Consumer complaint", cases:1, next:"—", status:"Closed", phone:"+91 96••• 7771", email:"priya@example.com" },
];

export default function LawyerClientsPage(){
 const [q,setQ]=useState(""); const [selected,setSelected]=useState(clients[0]);
 const filtered=useMemo(()=>clients.filter(c=>`${c.name} ${c.matter}`.toLowerCase().includes(q.toLowerCase())),[q]);
 return <div className="space-y-8 py-4">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><Badge variant="violet">Client management</Badge><h1 className="mt-2 font-serif text-4xl font-bold">Clients</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">Keep client matters, contacts, documents, and upcoming work organized in one place.</p></div><Button variant="gold"><UsersRound className="mr-2 h-4 w-4"/>Add client</Button></div>
  <div className="grid gap-6 lg:grid-cols-[.95fr_1.35fr]">
   <Card variant="glass" className="p-4"><div className="relative mb-4"><Search className="absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search clients or matters" className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-2.5 pl-9 pr-4 text-xs"/></div><div className="space-y-2">{filtered.map(c=><button key={c.id} onClick={()=>setSelected(c)} className={`w-full rounded-xl border p-4 text-left transition ${selected.id===c.id?'border-[var(--accent-blue)] bg-[var(--accent-blue)]/8':'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]'}`}><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">{c.name}</p><p className="mt-1 text-[11px] text-[var(--text-secondary)]">{c.matter}</p></div><ChevronRight className="h-4 w-4 text-[var(--text-muted)]"/></div><div className="mt-3 flex items-center justify-between"><Badge size="sm" variant={c.status==='Action required'?'warning':c.status==='Closed'?'default':'blue'}>{c.status}</Badge><span className="text-[10px] text-[var(--text-muted)]">{c.id}</span></div></button>)}</div></Card>
   <Card variant="glass" className="p-6"><div className="flex flex-col gap-4 border-b border-[var(--border-color)] pb-5 sm:flex-row sm:items-start sm:justify-between"><div><Badge variant="blue">Client profile</Badge><h2 className="mt-2 font-serif text-2xl font-bold">{selected.name}</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">{selected.matter}</p></div><Badge variant={selected.status==='Action required'?'warning':'default'}>{selected.status}</Badge></div><div className="grid gap-3 py-5 sm:grid-cols-2"><div className="rounded-xl bg-[var(--bg-card)] p-4"><Mail className="h-4 w-4 text-[var(--accent-blue)]"/><p className="mt-2 text-[10px] text-[var(--text-muted)]">Email</p><p className="text-xs font-semibold">{selected.email}</p></div><div className="rounded-xl bg-[var(--bg-card)] p-4"><Phone className="h-4 w-4 text-[var(--accent-blue)]"/><p className="mt-2 text-[10px] text-[var(--text-muted)]">Phone</p><p className="text-xs font-semibold">{selected.phone}</p></div><div className="rounded-xl bg-[var(--bg-card)] p-4"><FileText className="h-4 w-4 text-[var(--accent-gold)]"/><p className="mt-2 text-[10px] text-[var(--text-muted)]">Linked cases</p><p className="text-xs font-semibold">{selected.cases} matter{selected.cases>1?'s':''}</p></div><div className="rounded-xl bg-[var(--bg-card)] p-4"><Calendar className="h-4 w-4 text-[var(--accent-gold)]"/><p className="mt-2 text-[10px] text-[var(--text-muted)]">Next hearing</p><p className="text-xs font-semibold">{selected.next}</p></div></div><div className="space-y-3"><h3 className="font-serif font-bold">Matter workspace</h3><div className="grid gap-2 sm:grid-cols-3"><Button variant="outline" size="sm">View cases</Button><Button variant="outline" size="sm">Documents</Button><Button variant="outline" size="sm">Research notes</Button></div></div></Card>
  </div>
 </div>
}
