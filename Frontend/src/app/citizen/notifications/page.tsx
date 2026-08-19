"use client";
import { useState } from "react";
import { Bell, Calendar, CheckCircle2, FileText, Gavel, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
const initial=[
 {id:1,icon:Calendar,title:"Hearing reminder",text:"Your property dispute hearing is scheduled for 25 August 2026.",time:"20 min ago"},
 {id:2,icon:FileText,title:"Document processed",text:"Your uploaded sale deed has completed the analysis step.",time:"2 hrs ago"},
 {id:3,icon:Gavel,title:"Relevant judgment found",text:"LegalAI found a judgment relevant to your saved property issue.",time:"Yesterday"},
 {id:4,icon:UserRound,title:"Lawyer response",text:"Your legal team has added a note to your active case.",time:"2 days ago"},
];
export default function CitizenNotificationsPage(){ const [items,setItems]=useState(initial); return <div className="space-y-8 py-4"><div className="flex items-end justify-between"><div><Badge variant="blue">Your activity</Badge><h1 className="mt-2 font-serif text-4xl font-bold">Notifications</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">Stay informed about case activity, documents, hearings, and legal updates.</p></div><Button variant="outline" size="sm" onClick={()=>setItems([])}>Mark all read</Button></div><div className="space-y-3">{items.map(n=><Card key={n.id} variant="glass" className="p-5"><div className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400"><n.icon className="h-5 w-5"/></div><div className="flex-1"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-bold">{n.title}</h2><span className="text-[10px] text-[var(--text-muted)]">{n.time}</span></div><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{n.text}</p><Badge size="sm" className="mt-3">Unread</Badge></div></div></Card>)}{items.length===0&&<Card variant="glass" className="p-12 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400"/><p className="mt-3 text-sm">You’re all caught up.</p></Card>}</div></div>}
