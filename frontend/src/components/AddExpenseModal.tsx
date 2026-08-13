"use client";
import React, { useState } from "react";
import { Wallet } from "lucide-react";
import { Modal, Field } from "./ui";
import { useVehicles } from "@/lib/api-data";
import { toast } from "./Toast";
import type { Expense } from "@/lib/types";

export type NewExpense = Omit<Expense, "id" | "createdAt">;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Must reject on failure so the modal can show a real error. */
  onAddExpense: (x: NewExpense) => Promise<void>;
  initial?: Expense;
}

const CATS = ["Fuel", "Maintenance", "Tolls", "Parking", "Insurance", "Salary", "Repair", "Other"];

export default function AddExpenseModal({ isOpen, onClose, onAddExpense, initial }: Props) {
  const { data: vehicles } = useVehicles();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<NewExpense>(
    initial ?? {
      title: "",
      category: "Fuel",
      amount: 100,
      date: new Date().toISOString().slice(0, 10),
      plate_number: "",
      driver: "",
      status: "Paid",
      description: "",
    }
  );

  const set = (k: keyof NewExpense, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    // The API field is a DATE (YYYY-MM-DD). Sending a full ISO datetime was
    // rejected with "Date has wrong format" — that is why saving failed.
    const date = String(form.date ?? "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError("Choose a valid date.");
      return;
    }

    setSaving(true);
    try {
      const title =
        form.title || `${form.category}${form.plate_number ? " — " + form.plate_number : ""}`;
      await onAddExpense({ ...form, title, amount, date });
      toast.success(initial ? "Expense updated." : `Expense “${title}” saved.`);
      onClose(); // only close on real success
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      const first =
        detail && typeof detail === "object"
          ? Object.values(detail).flat()[0]
          : undefined;
      const msg = (first as string) || "Could not save the expense. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={initial ? "Edit Expense" : "Add Expense"} subtitle="Record a fleet cost" icon={Wallet} gradient="from-emerald-500 to-teal-600" maxWidth="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title">
            <input className="field" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Fuel top-up" />
          </Field>
          <Field label="Category">
            <select className="field" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Amount (€)" required>
            <input className="field" type="number" min={0} step="0.01" required value={form.amount} onChange={(e) => set("amount", Number(e.target.value))} />
          </Field>
          <Field label="Date">
            <input className="field" type="date" value={typeof form.date === "string" ? form.date.slice(0, 10) : ""} onChange={(e) => set("date", e.target.value)} />
          </Field>
          <Field label="Vehicle">
            <select className="field" value={form.plate_number} onChange={(e) => set("plate_number", e.target.value)}>
              <option value="">—</option>
              {vehicles.map((v) => <option key={v.id} value={v.plate_number}>{v.plate_number}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className="field" value={form.status} onChange={(e) => set("status", e.target.value)}>
              {["Paid", "Pending"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea className="field min-h-[80px]" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional notes…" />
        </Field>
        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : initial ? "Save Changes" : "Add Expense"}</button>
        </div>
      </form>
    </Modal>
  );
}
