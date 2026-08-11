"use client";
import React, { useState } from "react";
import { Truck } from "lucide-react";
import { Modal, Field } from "./ui";
import { useDrivers } from "@/lib/api-data";
import { toast } from "./Toast";
import type { Vehicle } from "@/lib/types";

// A clean create/edit payload — only the fields a company owner actually sets.
// System-derived data (position, fuel, odometer, live status) is never invented here.
export type VehicleInput = {
  plate_number: string;
  model: string;
  vehicle_type: string;
  driver: string;
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
  const { data: drivers } = useDrivers();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<VehicleInput>({
    plate_number: initial?.plate_number ?? "",
    model: initial?.model ?? "",
    vehicle_type: initial?.vehicle_type ?? "Truck",
    driver: initial?.driver ?? "",
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
    <Modal open={isOpen} onClose={onClose} title={initial ? "Edit Vehicle" : "Add Vehicle"} subtitle="Register a vehicle to your fleet" icon={Truck} gradient="from-orange-500 to-amber-600" maxWidth="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Plate Number" required>
            <input className="field" required value={form.plate_number} onChange={(e) => set("plate_number", e.target.value)} placeholder="e.g. 21-B-984" />
          </Field>
          <Field label="Model" required>
            <input className="field" required value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="e.g. Volvo FH" />
          </Field>
          <Field label="Type">
            <select className="field" value={form.vehicle_type} onChange={(e) => set("vehicle_type", e.target.value)}>
              {["Truck", "Van", "Sedan", "Pickup"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Driver">
            <select className="field" value={form.driver} onChange={(e) => set("driver", e.target.value)}>
              <option value="">Unassigned</option>
              {drivers.map((d) => <option key={d.id} value={d.full_name}>{d.full_name}</option>)}
            </select>
          </Field>
          <Field label="Capacity">
            <input className="field" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="e.g. 10 t" />
          </Field>
          <Field label="Color">
            <select className="field" value={form.color} onChange={(e) => set("color", e.target.value)}>
              {COLORS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className="field" value={form.status} onChange={(e) => set("status", e.target.value)}>
              {["Active", "Inactive", "Maintenance"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : initial ? "Save Changes" : "Add Vehicle"}</button>
        </div>
      </form>
    </Modal>
  );
}
