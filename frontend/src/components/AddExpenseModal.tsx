"use client";
import React, { useState } from "react";
import { Wallet } from "lucide-react";
import { Modal, Field } from "./ui";
import { useVehicles } from "@/lib/api-data";
import { toast } from "./Toast";
import type { Expense } from "@/lib/types";
import { useT, useTValue } from "@/i18n";

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
  const tr = useT();
  const tv = useTValue();
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
      setError(tr("ui.enter_an_amount_greater_than_zero"));
      return;
    }
    // The API field is a DATE (YYYY-MM-DD). Sending a full ISO datetime was
    // rejected with "Date has wrong format" — that is why saving failed.
    const date = String(form.date ?? "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError(tr("ui.choose_a_valid_date"));
      return;
    }

    setSaving(true);
    try {
      const title =
        form.title || `${form.category}${form.plate_number ? " — " + form.plate_number : ""}`;
      await onAddExpense({ ...form, title, amount, date });
      toast.success(initial ? tr("ui.expense_updated") : `Expense “${title}” saved.`);
      onClose(); // only close on real success
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      const first =
        detail && typeof detail === "object"
          ? Object.values(detail).flat()[0]
          : undefined;
      const msg = (first as string) || tr("ui.could_not_save_the_expense_please_try_again");
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={initial ? tr("ui.edit_expense") : tr("ui.add_expense")} subtitle={tr("ui.record_a_fleet_cost")} icon={Wallet} gradient="from-emerald-500 to-teal-600" maxWidth="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={tr("ui.title")}>
            <input className="field" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder={tr("ui.fuel_top_up")} />
          </Field>
          <Field label={tr("ui.category")}>
            <select className="field" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATS.map((c) => <option key={c} value={c}>{tv(c)}</option>)}
            </select>
          </Field>
          <Field label={tr("ui.amount_currency")} required>
            <input className="field" type="number" min={0} step="0.01" required value={form.amount} onChange={(e) => set("amount", Number(e.target.value))} />
          </Field>
          <Field label={tr("ui.date")}>
            <input className="field" type="date" value={typeof form.date === "string" ? form.date.slice(0, 10) : ""} onChange={(e) => set("date", e.target.value)} />
          </Field>
          <Field label={tr("ui.vehicle")}>
            <select className="field" value={form.plate_number} onChange={(e) => set("plate_number", e.target.value)}>
              <option value="">—</option>
              {vehicles.map((v) => <option key={v.id} value={v.plate_number}>{v.plate_number}</option>)}
            </select>
          </Field>
          <Field label={tr("ui.status")}>
            <select className="field" value={form.status} onChange={(e) => set("status", e.target.value)}>
              {["Paid", "Pending"].map((s) => <option key={s} value={s}>{tv(s)}</option>)}
            </select>
          </Field>
        </div>
        <Field label={tr("ui.description")}>
          <textarea className="field min-h-[80px]" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder={tr("ui.optional_notes")} />
        </Field>
        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">{tr("ui.cancel")}</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? tr("ui.saving") : initial ? tr("ui.save_changes") : tr("ui.add_expense")}</button>
        </div>
      </form>
    </Modal>
  );
}
