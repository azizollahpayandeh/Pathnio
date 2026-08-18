"use client";
import React, { useState } from "react";
import { Route } from "lucide-react";
import { Modal, Field } from "./ui";
import { useDrivers, useVehicles } from "@/lib/api-data";
import { useT, useTValue } from "@/i18n";

export type NewTrip = {
  origin: string;
  destination: string;
  driver_ref: string | null;
  vehicle_ref: string | null;
  distance: number;
  status: string;
  cargo: string;
  revenue: number;
  notes: string;
  start_time: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddTrip: (t: NewTrip) => void | Promise<void>;
}

// Raw API values; the visible label is localised at render time.
const STATUSES = ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"];

export default function AddTripModal({ isOpen, onClose, onAddTrip }: Props) {
  const tr = useT();
  const tv = useTValue();
  const { data: drivers } = useDrivers();
  const { data: vehicles } = useVehicles();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NewTrip>({
    origin: "",
    destination: "",
    driver_ref: null,
    vehicle_ref: null,
    distance: 0,
    status: tr("ui.planned"),
    cargo: "",
    revenue: 0,
    notes: "",
    start_time: new Date().toISOString().slice(0, 16),
  });

  const set = (k: keyof NewTrip, v: string | number | null) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onAddTrip({
        ...form,
        driver_ref: form.driver_ref || null,
        vehicle_ref: form.vehicle_ref || null,
        start_time: new Date(form.start_time).toISOString(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={tr("ui.new_trip")} subtitle={tr("ui.schedule_or_log_a_journey")} icon={Route} gradient="from-purple-500 to-fuchsia-600" maxWidth="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={tr("ui.origin")} required>
            <input className="field" required value={form.origin} onChange={(e) => set("origin", e.target.value)} placeholder="Berlin" />
          </Field>
          <Field label={tr("ui.destination")} required>
            <input className="field" required value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Hamburg" />
          </Field>
          <Field label={tr("ui.driver")}>
            <select className="field" value={form.driver_ref ?? ""} onChange={(e) => set("driver_ref", e.target.value || null)}>
              <option value="">{tr("ui.unassigned")}</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
            </select>
          </Field>
          <Field label={tr("ui.vehicle")}>
            <select className="field" value={form.vehicle_ref ?? ""} onChange={(e) => set("vehicle_ref", e.target.value || null)}>
              <option value="">{tr("ui.unassigned")}</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.plate_number}{v.model ? ` — ${v.model}` : ""}</option>)}
            </select>
          </Field>
          <Field label={tr("ui.distance_field")}>
            <input className="field" type="number" min={0} value={form.distance} onChange={(e) => set("distance", Number(e.target.value))} />
          </Field>
          <Field label={tr("ui.revenue_currency")}>
            <input className="field" type="number" min={0} value={form.revenue} onChange={(e) => set("revenue", Number(e.target.value))} />
          </Field>
          <Field label={tr("ui.cargo")}>
            <input className="field" value={form.cargo} onChange={(e) => set("cargo", e.target.value)} placeholder="Electronics" />
          </Field>
          <Field label={tr("ui.status")}>
            <select className="field" value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{tv(s)}</option>)}
            </select>
          </Field>
          <Field label={tr("ui.start_time")}>
            <input className="field" type="datetime-local" value={form.start_time.slice(0, 16)} onChange={(e) => set("start_time", e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">{tr("ui.cancel")}</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? tr("ui.saving") : tr("ui.add_trip")}</button>
        </div>
      </form>
    </Modal>
  );
}
