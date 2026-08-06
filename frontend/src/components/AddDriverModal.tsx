"use client";
import React, { useState } from "react";
import { Users } from "lucide-react";
import { Modal, Field } from "./ui";
import type { Driver } from "@/lib/types";

export type NewDriver = Omit<Driver, "id" | "createdAt">;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddDriver: (d: NewDriver) => void;
  initial?: Driver;
}

export default function AddDriverModal({ isOpen, onClose, onAddDriver, initial }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NewDriver>(
    initial ?? {
      full_name: "",
      mobile: "",
      email: "",
      license_no: "",
      vehicle_type: "Truck",
      plate_number: "",
      status: "Active",
      rating: 4.5,
      total_trips: 0,
      joined_at: new Date().toISOString(),
    }
  );

  const set = (k: keyof NewDriver, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    onAddDriver(form);
    setSaving(false);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={initial ? "Edit Driver" : "Add Driver"} subtitle="Add a driver to your team" icon={Users} gradient="from-indigo-500 to-blue-600" maxWidth="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" required>
            <input className="field" required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Amir Rezaei" />
          </Field>
          <Field label="Mobile" required>
            <input className="field" required value={form.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="+49 151 000 000" />
          </Field>
          <Field label="Email">
            <input className="field" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="driver@company.com" />
          </Field>
          <Field label="License No.">
            <input className="field" value={form.license_no} onChange={(e) => set("license_no", e.target.value)} placeholder="DL-100000" />
          </Field>
          <Field label="Vehicle Type">
            <select className="field" value={form.vehicle_type} onChange={(e) => set("vehicle_type", e.target.value)}>
              {["Truck", "Van", "Sedan", "Pickup"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Assigned Plate">
            <input className="field" value={form.plate_number} onChange={(e) => set("plate_number", e.target.value)} placeholder="12-A-345" />
          </Field>
          <Field label="Status">
            <select className="field" value={form.status} onChange={(e) => set("status", e.target.value)}>
              {["Active", "On Trip", "Inactive"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Rating (0–5)">
            <input className="field" type="number" step={0.1} min={0} max={5} value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : initial ? "Save Changes" : "Add Driver"}</button>
        </div>
      </form>
    </Modal>
  );
}
