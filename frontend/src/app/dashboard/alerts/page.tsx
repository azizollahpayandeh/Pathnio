"use client";
import { useState, useMemo } from "react";
import {
  Bell, AlertTriangle, CheckCircle, Info, Search, Clock,
  Check, Trash2, CheckCheck, ShieldAlert,
} from "lucide-react";
import { PageHeader, StatCard, Badge, EmptyState } from "@/components/ui";
import { useFleetAlerts, acknowledgeAlert } from "@/lib/api-data";
import type { AlertPriority } from "@/lib/types";
import { useT } from "@/i18n";

const tone: Record<AlertPriority, string> = { low: "gray", medium: "blue", high: "amber", critical: "red" };
const icon: Record<AlertPriority, typeof Info> = { low: Info, medium: Bell, high: AlertTriangle, critical: ShieldAlert };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AlertsPage() {
  const tr = useT();
  const { data: alerts, refetch } = useFleetAlerts();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      alerts.filter(
        (a) =>
          (filter === "all" || !a.read) &&
          (a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.message.toLowerCase().includes(search.toLowerCase()))
      ),
    [alerts, filter, search]
  );

  const unread = alerts.filter((a) => !a.read).length;
  const critical = alerts.filter((a) => a.priority === "critical").length;

  const markAllRead = async () => {
    await Promise.all(alerts.filter((a) => !a.read).map((a) => acknowledgeAlert(a.id)));
    await refetch();
  };
  const ack = async (id: string) => { await acknowledgeAlert(id); await refetch(); };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={Bell}
        title={tr("ui.alerts")}
        subtitle={tr("ui.notifications_from_across_your_fleet")}
        gradient="from-amber-500 to-orange-600"
        actions={
          <button onClick={markAllRead} className="btn btn-ghost" disabled={unread === 0}>
            <CheckCheck className="w-4 h-4" /> {tr("ui.mark_all_read")}
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4 stagger">
        <StatCard icon={Bell} label={tr("ui.total")} value={alerts.length} gradient="from-violet-500 to-purple-600" />
        <StatCard icon={Clock} label={tr("ui.unread")} value={unread} gradient="from-amber-500 to-orange-600" />
        <StatCard icon={ShieldAlert} label={tr("ui.critical")} value={critical} gradient="from-rose-500 to-red-600" />
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr("ui.search_alerts")} className="field pl-10" />
        </div>
        <div className="flex p-1 bg-slate-100 rounded-xl">
          {(["all", "unread"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-lg font-semibold capitalize text-sm transition ${filter === f ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={CheckCircle} title={tr("ui.you_re_all_caught_up")} description="No alerts match your filter." /></div>
      ) : (
        <div className="space-y-3 stagger">
          {filtered.map((a) => {
            const Icon = icon[a.priority];
            return (
              <div key={a.id} className={`card p-4 flex items-start gap-4 transition ${a.read ? "" : "border-l-4 border-l-violet-500"}`}>
                <div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center ${a.priority === "critical" ? "bg-rose-100 text-rose-600" : a.priority === "high" ? "bg-amber-100 text-amber-600" : "bg-violet-100 text-violet-600"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900">{a.title}</h3>
                    <Badge tone={tone[a.priority]}>{a.priority}</Badge>
                    {!a.read && <span className="w-2 h-2 rounded-full bg-violet-500" />}
                  </div>
                  <p className="text-slate-600 text-sm mt-0.5">{a.message}</p>
                  <span className="text-xs text-slate-400 mt-1 inline-block">{timeAgo(a.timestamp)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {!a.read && (
                    <button onClick={() => ack(a.id)} className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition" title={tr("ui.mark_read")}>
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => ack(a.id)} className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition" title={tr("ui.delete")}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
