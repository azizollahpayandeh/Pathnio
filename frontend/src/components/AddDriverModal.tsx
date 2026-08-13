"use client";
import React, { useState } from "react";
import { Users } from "lucide-react";
import { Modal, Field } from "./ui";
import { toast } from "./Toast";
import type { Driver } from "@/lib/types";
import { useT } from "@/i18n";

// The fields a company owner actually enters. Status is NOT here — it is
// system-derived by the backend (activation + active trip + telemetry).
export type DriverInput = {
  full_name: string;
  mobile: string;
  email: string;
  license_no: string;
  vehicle_type: string;
  plate_number: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddDriver: (d: DriverInput) => Promise<void>;
  initial?: Driver;
}

export default function AddDriverModal({ isOpen, onClose, onAddDriver, initial }: Props) {
  const tr = useT();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DriverInput>({
    full_name: initial?.full_name ?? "",
    mobile: initial?.mobile ?? "",
    email: initial?.email ?? "",
    license_no: initial?.license_no ?? "",
    vehicle_type: initial?.vehicle_type || "Truck",
    plate_number: initial?.plate_number ?? "",
  });

  const set = (k: keyof DriverInput, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onAddDriver(form);
      toast.success(initial ? "Driver updated." : `Driver ${form.full_name} added.`);
      onClose();
    } catch (err) {
      toast.fromError(err, "Could not save the driver. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={initial ? "Edit Driver" : "Add Driver"} subtitle={tr("ui.add_a_driver_to_your_team")} icon={Users} gradient="from-purple-500 to-violet-600" maxWidth="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={tr("ui.full_name")} required>
            <input className="field" required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder={tr("ui.e_g_arsalan_ahmadi")} />
          </Field>
          <Field label={tr("ui.mobile")} required>
            <input className="field" required value={form.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="+49 151 000 000" />
          </Field>
          <Field label={tr("ui.email")}>
            <input className="field" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="driver@company.com" />
          </Field>
          <Field label={tr("ui.license_no")}>
            <input className="field" value={form.license_no} onChange={(e) => set("license_no", e.target.value)} placeholder={tr("ui.e_g_dl_100000")} />
          </Field>
          <Field label={tr("ui.vehicle_type")}>
            <select className="field" value={form.vehicle_type} onChange={(e) => set("vehicle_type", e.target.value)}>
              {["Truck", "Van", "Sedan", "Pickup"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label={tr("ui.assigned_plate")}>
            <input className="field" value={form.plate_number} onChange={(e) => set("plate_number", e.target.value)} placeholder={tr("ui.e_g_21_b_984")} />
          </Field>
        </div>
        <p className="text-xs text-slate-400">
          Status (Active · On Trip · Offline · Inactive) is set automatically from the driver’s activation and live telemetry — it isn’t chosen here.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">{tr("ui.cancel")}</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : initial ? "Save Changes" : "Add Driver"}</button>
        </div>
      </form>
    </Modal>
  );
}
