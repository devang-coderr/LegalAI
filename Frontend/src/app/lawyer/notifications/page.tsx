"use client";
import { useState } from "react";
import { Bell, Calendar, CheckCircle2, FileText, Search, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
const initial=[
 {id:1,icon:Calendar,title:"Hearing tomorrow",text:"Apex Infrastructure vs. Union of India is listed at 10:30 AM.",time:"12 min ago",type:"hearing"},
 {id:2,icon:UserRound,title:"New client document",text:"Aarav Mehta uploaded a property title document.",time:"1 hr ago",type:"client"},
 {id:3,icon:Search,title:"Research match found",text:"Two new precedents match your saved arbitration query.",time:"3 hrs ago",type:"research"},
 {id:4,icon:FileText,title:"Brief analysis complete",text:"The uploaded contract has 12 extracted clauses and 1 risk flag.",time:"Yesterday",type:"document"},
];
export default function LawyerNotificationsPage(){ const [items,setItems]=useState(initial); return <div className="space-y-8 py-4"><div className="flex items-end justify-between"><div><Badge variant="violet">Workspace activity</Badge><h1 className="mt-2 font-serif text-4xl font-bold">Notifications</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">Hearing updates, client activity, research matches, and document alerts.</p></div><Button variant="outline" size="sm" onClick={()=>setItems([])}>Mark all read</Button></div><div className="space-y-3">{items.map(n=><Card key={n.id} variant="glass" className="p-5"><div className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"><n.icon className="h-5 w-5"/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-bold">{n.title}</h2><span className="text-[10px] text-[var(--text-muted)]">{n.time}</span></div><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{n.text}</p><Badge size="sm" variant="default" className="mt-3">Unread</Badge></div></div></Card>)}{items.length===0&&<Card variant="glass" className="p-12 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400"/><p className="mt-3 text-sm">You’re all caught up.</p></Card>}</div></div>}
