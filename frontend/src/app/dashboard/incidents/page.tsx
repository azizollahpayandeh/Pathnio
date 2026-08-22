"use client";
import { useState, useMemo } from "react";
import { ShieldAlert, Search, CheckCircle2, MapPin } from "lucide-react";
import { PageHeader, StatCard, Badge, EmptyState, PageLoading } from "@/components/ui";
import { useIncidents, resolveIncident } from "@/lib/api-data";
import { toast } from "@/components/Toast";
import { useT, useTValue } from "@/i18n";
import { useUnits } from "@/lib/format";

/** Incidents reported by drivers from the road: breakdowns, accidents, delays. */
export default function IncidentsPage() {
  const tr = useT();
  const tv = useTValue();
  const { number } = useUnits();
  const [search, setSearch] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const { data: rows, ready, refetch } = useIncidents(openOnly);

  const filtered = useMemo(
    () =>
      rows.filter(
        (i) =>
          i.plate_number?.toLowerCase().includes(search.toLowerCase()) ||
          i.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
          i.description?.toLowerCase().includes(search.toLowerCase())
      ),
    [rows, search]
  );

  const stats = {
    total: rows.length,
    open: rows.filter((i) => !i.resolved_at).length,
    high: rows.filter((i) => i.severity === "HIGH" && !i.resolved_at).length,
  };

  const resolve = async (id: string) => {
    try {
      await resolveIncident(id);
      await refetch();
      toast.success(tr("ui.inc_resolved"));
    } catch (err) {
      toast.fromError(err, tr("ui.something_went_wrong"));
    }
  };

  const tone = (s: string) => (s === "HIGH" ? "red" : s === "MEDIUM" ? "amber" : "gray");

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={ShieldAlert}
        title={tr("ui.inc_title")}
        subtitle={tr("ui.inc_subtitle")}
        gradient="from-rose-500 to-red-600"
      />

      <div className="grid grid-cols-3 gap-4 stagger">
        <StatCard icon={ShieldAlert} label={tr("ui.inc_total")} value={number(stats.total)} gradient="from-slate-500 to-slate-700" />
        <StatCard icon={ShieldAlert} label={tr("ui.inc_open")} value={number(stats.open)} gradient="from-amber-500 to-orange-600" />
        <StatCard icon={ShieldAlert} label={tr("ui.inc_urgent")} value={number(stats.high)} gradient="from-rose-500 to-red-600" />
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr("ui.inc_search")}
            className="field ps-10"
          />
        </div>
        <button
          onClick={() => setOpenOnly((v) => !v)}
          className={`btn ${openOnly ? "btn-primary" : "btn-ghost"} sm:w-44`}
        >
          {tr("ui.inc_open_only")}
        </button>
      </div>

      {!ready ? (
        <PageLoading />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={CheckCircle2}
            title={tr("ui.inc_none")}
            description={tr("ui.inc_none_hint")}
          />
        </div>
      ) : (
        <div className="space-y-3 stagger">
          {filtered.map((i) => (
            <div key={i.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone={tone(i.severity)}>{tv(i.severity)}</Badge>
                    <span className="font-bold text-slate-900">{tv(i.kind)}</span>
                    {i.plate_number && (
                      <span className="font-mono text-sm text-slate-500">{i.plate_number}</span>
                    )}
                    {i.resolved_at && (
                      <Badge tone="green" icon={CheckCircle2}>{tr("ui.inc_done")}</Badge>
                    )}
                  </div>
                  <p className="text-slate-700 mt-2">{i.description}</p>
                  <p className="text-sm text-slate-400 mt-1.5">
                    {i.driver_name} · {new Date(i.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {i.lat != null && i.lng != null && (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${i.lat}&mlon=${i.lng}#map=15/${i.lat}/${i.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost text-sm"
                    >
                      <MapPin className="w-4 h-4" /> {tr("ui.inc_map")}
                    </a>
                  )}
                  {!i.resolved_at && (
                    <button onClick={() => resolve(i.id)} className="btn btn-primary text-sm">
                      <CheckCircle2 className="w-4 h-4" /> {tr("ui.inc_resolve")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
