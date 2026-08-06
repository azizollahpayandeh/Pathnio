"use client";
import React, { useState } from "react";
import { Route } from "lucide-react";
import { Modal, Field } from "./ui";
import { useCollection } from "@/lib/store";
import type { Trip } from "@/lib/types";

export type NewTrip = Omit<Trip, "id" | "createdAt">;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddTrip: (t: NewTrip) => void;
  initial?: Trip;
}

export default function AddTripModal({ isOpen, onClose, onAddTrip, initial }: Props) {
  const [drivers] = useCollection("drivers");
  const [vehicles] = useCollection("vehicles");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NewTrip>(
    initial ?? {
      origin: "",
      destination: "",
      driver: "",
      plate_number: "",
      distance: 100,
      status: "Scheduled",
      cargo: "",
      revenue: 400,
      start_time: new Date().toISOString().slice(0, 16),
    }
  );

  const set = (k: keyof NewTrip, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    onAddTrip({ ...form, start_time: new Date(form.start_time).toISOString() });
    setSaving(false);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={initial ? "Edit Trip" : "New Trip"} subtitle="Schedule or log a journey" icon={Route} gradient="from-purple-500 to-fuchsia-600" maxWidth="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Origin" required>
            <input className="field" required value={form.origin} onChange={(e) => set("origin", e.target.value)} placeholder="Berlin" />
          </Field>
          <Field label="Destination" required>
            <input className="field" required value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Hamburg" />
          </Field>
          <Field label="Driver">
            <select className="field" value={form.driver} onChange={(e) => set("driver", e.target.value)}>
              <option value="">Unassigned</option>
              {drivers.map((d) => <option key={d.id} value={d.full_name}>{d.full_name}</option>)}
            </select>
          </Field>
          <Field label="Vehicle">
            <select className="field" value={form.plate_number} onChange={(e) => set("plate_number", e.target.value)}>
              <option value="">Unassigned</option>
              {vehicles.map((v) => <option key={v.id} value={v.plate_number}>{v.plate_number} — {v.model}</option>)}
            </select>
          </Field>
          <Field label="Distance (km)">
            <input className="field" type="number" min={0} value={form.distance} onChange={(e) => set("distance", Number(e.target.value))} />
          </Field>
          <Field label="Revenue (€)">
            <input className="field" type="number" min={0} value={form.revenue} onChange={(e) => set("revenue", Number(e.target.value))} />
          </Field>
          <Field label="Cargo">
            <input className="field" value={form.cargo} onChange={(e) => set("cargo", e.target.value)} placeholder="Electronics" />
          </Field>
          <Field label="Status">
            <select className="field" value={form.status} onChange={(e) => set("status", e.target.value)}>
              {["Scheduled", "Ongoing", "Completed", "Cancelled"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Start Time">
            <input className="field" type="datetime-local" value={typeof form.start_time === "string" ? form.start_time.slice(0, 16) : ""} onChange={(e) => set("start_time", e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : initial ? "Save Changes" : "Add Trip"}</button>
        </div>
      </form>
    </Modal>
  );
}
