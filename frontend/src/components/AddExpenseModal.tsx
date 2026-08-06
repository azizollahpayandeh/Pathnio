"use client";
import React, { useState } from "react";
import { Wallet } from "lucide-react";
import { Modal, Field } from "./ui";
import { useCollection } from "@/lib/store";
import type { Expense } from "@/lib/types";

export type NewExpense = Omit<Expense, "id" | "createdAt">;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (x: NewExpense) => void;
  initial?: Expense;
}

const CATS = ["Fuel", "Maintenance", "Tolls", "Insurance", "Salary", "Other"];

export default function AddExpenseModal({ isOpen, onClose, onAddExpense, initial }: Props) {
  const [vehicles] = useCollection("vehicles");
  const [saving, setSaving] = useState(false);
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
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    const title = form.title || `${form.category}${form.plate_number ? " — " + form.plate_number : ""}`;
    onAddExpense({ ...form, title, date: new Date(form.date).toISOString() });
    setSaving(false);
    onClose();
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
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : initial ? "Save Changes" : "Add Expense"}</button>
        </div>
      </form>
    </Modal>
  );
}
