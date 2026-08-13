"use client";
import { useState } from "react";
import {
  LifeBuoy, Send, CheckCircle, Clock, Plus, Mail, Phone,
  MessageCircle, BookOpen, Headphones,
} from "lucide-react";
import { PageHeader, Badge, EmptyState, Field } from "@/components/ui";
import FloatingAlert from "@/components/FloatingAlert";
import { useSupportTickets, createSupportTicket } from "@/lib/api-data";
import type { Ticket } from "@/lib/types";
import { useT } from "@/i18n";

const tone: Record<string, string> = { open: "amber", answered: "green", closed: "gray" };

export default function SupportPage() {
  const tr = useT();
  const { data: tickets, refetch } = useSupportTickets();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    try {
      await createSupportTicket(subject.trim(), message.trim());
      await refetch();
      setSubject("");
      setMessage("");
      setAlert({ type: "success", msg: "Ticket submitted — our team will respond soon." });
    } catch {
      setAlert({ type: "error", msg: "Could not submit ticket. Please try again." });
    }
    setTimeout(() => setAlert(null), 3000);
  };

  const channels = [
    { icon: Mail, label: "Email", value: "support@pathnio.com", tone: "from-violet-500 to-purple-600" },
    { icon: Phone, label: "Phone", value: "+49 30 1234 5678", tone: "from-emerald-500 to-teal-600" },
    { icon: Headphones, label: "Live chat", value: "Mon–Fri, 9–18 CET", tone: "from-purple-500 to-fuchsia-600" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader icon={LifeBuoy} title={tr("ui.support")} subtitle={tr("ui.we_re_here_to_help")} gradient="from-teal-500 to-violet-600" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
        {channels.map((c) => (
          <div key={c.label} className="card card-hover p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.tone} flex items-center justify-center shadow-md`}>
              <c.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-slate-500">{c.label}</div>
              <div className="font-semibold text-slate-800">{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New ticket */}
        <form onSubmit={submit} className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2"><Plus className="w-5 h-5 text-violet-600" /> {tr("ui.new_ticket")}</h2>
          <Field label={tr("ui.subject")} required>
            <input className="field" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={tr("ui.how_can_we_help")} />
          </Field>
          <Field label={tr("ui.message")} required>
            <textarea className="field min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={tr("ui.describe_your_issue")} />
          </Field>
          <button type="submit" className="btn btn-primary w-full"><Send className="w-4 h-4" /> {tr("ui.submit_ticket")}</button>
        </form>

        {/* Ticket list */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><MessageCircle className="w-5 h-5 text-violet-600" /> Your tickets ({tickets.length})</h2>
          {tickets.length === 0 ? (
            <EmptyState icon={BookOpen} title={tr("ui.no_tickets_yet")} description="Submit a ticket and it will appear here." />
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto scroll-slim pr-1">
              {tickets.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-800 truncate">{t.subject}</h3>
                    <Badge tone={tone[t.status]} icon={t.status === "answered" ? CheckCircle : Clock}>{t.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{t.message}</p>
                  {t.reply && (
                    <div className="mt-3 pl-3 border-l-2 border-violet-300 text-sm text-slate-600">
                      <span className="font-semibold text-violet-700">{tr("ui.support")}</span> {t.reply}
                    </div>
                  )}
                  <div className="text-xs text-slate-400 mt-2">{new Date(t.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {alert && <FloatingAlert type={alert.type} msg={alert.msg} onClose={() => setAlert(null)} />}
    </div>
  );
}
