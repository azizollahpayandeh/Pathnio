"use client";
import React, { useState } from "react";
import { Truck } from "lucide-react";
import { Modal, Field } from "./ui";
import { useDrivers } from "@/lib/api-data";
import { toast } from "./Toast";
import type { Vehicle } from "@/lib/types";
import { useT } from "@/i18n";

// A clean create/edit payload — only the fields a company owner actually sets.
// System-derived data (position, fuel, odometer, live status) is never invented here.
export type VehicleInput = {
  plate_number: string;
  model: string;
  vehicle_type: string;
  /** Real Driver PK — the backend creates an actual assignment from this.
   *  ("" = unassigned.) The old name-string alone never assigned anyone. */
  driver_id: string;
  capacity: string;
  color: string;
  status: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (v: VehicleInput) => Promise<void>;
  initial?: Vehicle;
}

const COLORS = ["White", "Black", "Blue", "Red", "Green", "Gray", "Yellow", "Silver"];

export default function AddVehicleModal({ isOpen, onClose, onAddVehicle, initial }: Props) {
  const tr = useT();
  const { data: drivers } = useDrivers();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<VehicleInput>({
    plate_number: initial?.plate_number ?? "",
    model: initial?.model ?? "",
    vehicle_type: initial?.vehicle_type ?? "Truck",
    driver_id: initial?.assignedDriverId ?? "",
    capacity: initial?.capacity ?? "",
    color: initial?.color ?? "White",
    status: initial?.status ?? "Active",
  });

  const set = (k: keyof VehicleInput, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onAddVehicle(form);
      toast.success(initial ? "Vehicle updated." : `Vehicle ${form.plate_number} added.`);
      onClose();
    } catch (err) {
      // Never fail silently and never expose a stack trace — a friendly message.
      toast.fromError(err, "Could not save the vehicle. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={initial ? "Edit Vehicle" : "Add Vehicle"} subtitle={tr("ui.register_a_vehicle_to_your_fleet")} icon={Truck} gradient="from-orange-500 to-amber-600" maxWidth="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={tr("ui.plate_number")} required>
            <input className="field" required value={form.plate_number} onChange={(e) => set("plate_number", e.target.value)} placeholder={tr("ui.e_g_21_b_984")} />
          </Field>
          <Field label={tr("ui.model")} required>
            <input className="field" required value={form.model} onChange={(e) => set("model", e.target.value)} placeholder={tr("ui.e_g_volvo_fh")} />
          </Field>
          <Field label={tr("ui.type")}>
            <select className="field" value={form.vehicle_type} onChange={(e) => set("vehicle_type", e.target.value)}>
              {["Truck", "Van", "Sedan", "Pickup"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label={tr("ui.driver")}>
            <select className="field" value={form.driver_id} onChange={(e) => set("driver_id", e.target.value)}>
              <option value="">{tr("ui.unassigned")}</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
            </select>
          </Field>
          <Field label={tr("ui.capacity")}>
            <input className="field" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder={tr("ui.e_g_10_t")} />
          </Field>
          <Field label={tr("ui.color")}>
            <select className="field" value={form.color} onChange={(e) => set("color", e.target.value)}>
              {COLORS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label={tr("ui.status")}>
            <select className="field" value={form.status} onChange={(e) => set("status", e.target.value)}>
              {["Active", "Inactive", "Maintenance"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">{tr("ui.cancel")}</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : initial ? "Save Changes" : "Add Vehicle"}</button>
        </div>
      </form>
    </Modal>
  );
}
