"use client";
import React, { useState } from "react";
import { Truck } from "lucide-react";
import { Modal, Field } from "./ui";
import { useDrivers } from "@/lib/api-data";
import type { Vehicle } from "@/lib/types";

export type NewVehicle = Omit<Vehicle, "id" | "createdAt">;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (v: NewVehicle) => void;
  initial?: Vehicle;
}

const COLORS = ["White", "Black", "Blue", "Red", "Green", "Gray", "Yellow", "Silver"];

export default function AddVehicleModal({ isOpen, onClose, onAddVehicle, initial }: Props) {
  const { data: drivers } = useDrivers();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NewVehicle>(
    initial ?? {
      plate_number: "",
      vehicle_type: "Truck",
      model: "",
      driver: "",
      company: "Pathnio Logistics",
      status: "Active",
      capacity: "",
      color: "White",
      fuel_level: 100,
      odometer: 0,
      efficiency: "8.0 L/100km",
      last_maintenance: new Date().toISOString(),
      total_trips: 0,
      lat: 52.52,
      lng: 13.405,
      speed: 0,
    }
  );

  const set = (k: keyof NewVehicle, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    onAddVehicle({ ...form, lat: 52.52 + (Math.random() - 0.5) * 0.1, lng: 13.405 + (Math.random() - 0.5) * 0.1 });
    setSaving(false);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={initial ? "Edit Vehicle" : "Add Vehicle"} subtitle="Register a vehicle to your fleet" icon={Truck} gradient="from-orange-500 to-amber-600" maxWidth="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Plate Number" required>
            <input className="field" required value={form.plate_number} onChange={(e) => set("plate_number", e.target.value)} placeholder="12-A-345" />
          </Field>
          <Field label="Model" required>
            <input className="field" required value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="Volvo FH16" />
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
            <input className="field" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="10 t" />
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
          <Field label="Fuel Level (%)">
            <input className="field" type="number" min={0} max={100} value={form.fuel_level} onChange={(e) => set("fuel_level", Number(e.target.value))} />
          </Field>
          <Field label="Efficiency">
            <input className="field" value={form.efficiency} onChange={(e) => set("efficiency", e.target.value)} placeholder="8.2 L/100km" />
          </Field>
          <Field label="Odometer (km)">
            <input className="field" type="number" min={0} value={form.odometer} onChange={(e) => set("odometer", Number(e.target.value))} />
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
