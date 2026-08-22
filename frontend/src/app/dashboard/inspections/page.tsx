"use client";
import { useState, useMemo } from "react";
import { ClipboardCheck, Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader, StatCard, Badge, EmptyState, CardGridSkeleton } from "@/components/ui";
import { useInspections } from "@/lib/api-data";
import { useT } from "@/i18n";
import { useUnits } from "@/lib/format";

/**
 * Vehicle inspections (DVIR) submitted by drivers from the mobile app.
 * Read-only by design: the record is the driver's signed statement about the
 * vehicle, so the office reviews it but never edits it.
 */
export default function InspectionsPage() {
  const tr = useT();
  const { number } = useUnits();
  const [search, setSearch] = useState("");
  const [defectsOnly, setDefectsOnly] = useState(false);
  const { data: rows, ready } = useInspections(defectsOnly);

  const filtered = useMemo(
    () =>
      rows.filter(
        (i) =>
          i.plate_number?.toLowerCase().includes(search.toLowerCase()) ||
          i.driver_name?.toLowerCase().includes(search.toLowerCase())
      ),
    [rows, search]
  );

  const stats = {
    total: rows.length,
    defects: rows.filter((i) => i.has_defects).length,
    clean: rows.filter((i) => !i.has_defects).length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={ClipboardCheck}
        title={tr("ui.insp_title")}
        subtitle={tr("ui.insp_subtitle")}
        gradient="from-sky-500 to-cyan-600"
      />

      <div className="grid grid-cols-3 gap-4 stagger">
        <StatCard icon={ClipboardCheck} label={tr("ui.insp_total")} value={number(stats.total)} gradient="from-sky-500 to-cyan-600" />
        <StatCard icon={AlertTriangle} label={tr("ui.insp_defects")} value={number(stats.defects)} gradient="from-rose-500 to-red-600" />
        <StatCard icon={CheckCircle2} label={tr("ui.insp_clean")} value={number(stats.clean)} gradient="from-emerald-500 to-teal-600" />
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr("ui.insp_search")}
            className="field ps-10"
          />
        </div>
        <button
          onClick={() => setDefectsOnly((v) => !v)}
          className={`btn ${defectsOnly ? "btn-primary" : "btn-ghost"} sm:w-48`}
        >
          <AlertTriangle className="w-4 h-4" /> {tr("ui.insp_defects_only")}
        </button>
      </div>

      {!ready ? (
        <CardGridSkeleton count={6} cols="xl:grid-cols-2" />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ClipboardCheck}
            title={tr("ui.insp_none")}
            description={tr("ui.insp_none_hint")}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 stagger">
          {filtered.map((i) => (
            <div key={i.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 font-mono">{i.plate_number}</h3>
                    <Badge tone={i.kind === "PRE" ? "blue" : "purple"}>
                      {i.kind === "PRE" ? tr("ui.insp_pre") : tr("ui.insp_post")}
                    </Badge>
                    {i.has_defects ? (
                      <Badge tone="red" icon={AlertTriangle}>{tr("ui.insp_defect")}</Badge>
                    ) : (
                      <Badge tone="green" icon={CheckCircle2}>{tr("ui.insp_ok")}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {i.driver_name} · {new Date(i.created_at).toLocaleString()}
                  </p>
                </div>
                {i.odometer != null && (
                  <span className="text-sm text-slate-500 shrink-0 font-mono">
                    {number(i.odometer)} km
                  </span>
                )}
              </div>

              {i.has_defects && (
                <div className="mt-4 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3">
                  <p className="text-sm font-semibold text-rose-700">
                    {i.failed_items.map((k) => tr(`ui.insp_item_${k}`)).join(" · ")}
                  </p>
                  {i.defect_notes && (
                    <p className="text-sm text-rose-600/90 mt-1">{i.defect_notes}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
