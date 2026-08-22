"use client";
import { useState, useMemo } from "react";
import { approveExpense, rejectExpense } from "@/lib/api-data";
import Link from "next/link";
import {
  Wallet, Search, Plus, Eye, Trash2, Fuel, Wrench, Receipt,
  Shield, Users, MoreHorizontal, TrendingDown,
} from "lucide-react";
import AddExpenseModal, { NewExpense } from "@/components/AddExpenseModal";
import { PageHeader, StatCard, Badge, EmptyState, PageLoading } from "@/components/ui";
import { useExpenses, createExpense, deleteExpense } from "@/lib/api-data";
import type { ExpenseCategory } from "@/lib/types";
import { useT, useTValue } from "@/i18n";
import { useUnits } from "@/lib/format";
import { toast } from "@/components/Toast";

const catIcon: Record<ExpenseCategory, typeof Fuel> = {
  Fuel, Maintenance: Wrench, Tolls: Receipt, Insurance: Shield, Salary: Users, Other: MoreHorizontal,
};
const catTone: Record<ExpenseCategory, string> = {
  Fuel: "blue", Maintenance: "orange", Tolls: "purple", Insurance: "teal", Salary: "purple", Other: "gray",
};
const catIconBg: Record<ExpenseCategory, string> = {
  Fuel: "bg-violet-100 text-violet-600",
  Maintenance: "bg-orange-100 text-orange-600",
  Tolls: "bg-purple-100 text-purple-600",
  Insurance: "bg-teal-100 text-teal-600",
  Salary: "bg-purple-100 text-purple-600",
  Other: "bg-slate-100 text-slate-600",
};

export default function ExpensesPage() {
  const tr = useT();
  const tv = useTValue();
  const { currency, distance } = useUnits();
  const { data: expenses, ready, refetch } = useExpenses();

  // Driver submissions awaiting a decision.
  const pending = useMemo(
    () => expenses.filter((e) => (e as unknown as { approval?: string }).approval === "PENDING"),
    [expenses]
  );

  const review = async (id: string, ok: boolean) => {
    try {
      await (ok ? approveExpense(id) : rejectExpense(id));
      await refetch();
      toast.success(tr(ok ? "ui.exp_approved" : "ui.exp_rejected"));
    } catch (err) {
      toast.fromError(err, tr("ui.something_went_wrong"));
    }
  };
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(
    () =>
      [...expenses]
        .filter(
          (x) =>
            (x.title.toLowerCase().includes(search.toLowerCase()) ||
              x.plate_number.toLowerCase().includes(search.toLowerCase())) &&
            (category === "all" || x.category === category)
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [expenses, search, category]
  );

  const stats = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const pending = expenses.filter((e) => e.status === "Pending").reduce((s, e) => s + e.amount, 0);
    const fuel = expenses.filter((e) => e.category === "Fuel").reduce((s, e) => s + e.amount, 0);
    return { total, pending, fuel, count: expenses.length };
  }, [expenses]);

  const addExpense = async (x: NewExpense) => {
    await createExpense(x as unknown as Record<string, unknown>);
    await refetch();
  };
  const handleDelete = async (id: string) => {
    if (typeof window !== "undefined" && !window.confirm(tr("ui.confirm_delete_expense"))) return;
    try {
      await deleteExpense(id);
      await refetch();
      toast.success(tr("ui.expense_deleted"));
    } catch (err) {
      toast.fromError(err, tr("ui.could_not_delete_the_expense"));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={Wallet}
        title={tr("ui.expenses")}
        subtitle={tr("ui.track_every_cost_across_your_fleet")}
        gradient="from-emerald-500 to-teal-600"
        actions={
          <button onClick={() => setShowAdd(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> {tr("ui.add_expense")}
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard icon={Wallet} label={tr("ui.total_spent")} value={currency(stats.total)} gradient="from-emerald-500 to-teal-600" />
        <StatCard icon={TrendingDown} label={tr("ui.pending")} value={currency(stats.pending)} gradient="from-amber-500 to-orange-600" />
        <StatCard icon={Fuel} label={tr("ui.fuel_costs")} value={currency(stats.fuel)} gradient="from-violet-500 to-purple-600" />
        <StatCard icon={Receipt} label={tr("ui.records")} value={stats.count} gradient="from-purple-500 to-fuchsia-600" />
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr("ui.search_title_or_vehicle")} className="field ps-10" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="field sm:w-48">
          <option value="all">{tr("ui.all_categories")}</option>
          {Object.keys(catIcon).map((c) => <option key={c} value={c}>{tv(c)}</option>)}
        </select>
      </div>

      {/* Costs drivers logged on the road wait here for a decision — they are
          not counted as real spend until the owner approves them. */}
      {pending.length > 0 && (
        <div className="card p-5 border-l-4 border-amber-400">
          <h2 className="font-bold text-slate-800">{tr("ui.exp_pending_title")}</h2>
          <p className="text-sm text-slate-500 mb-4">{tr("ui.exp_pending_hint")}</p>
          <div className="space-y-2">
            {pending.map((x) => (
              <div key={x.id} className="flex items-center justify-between gap-3 flex-wrap rounded-xl bg-amber-50/60 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">
                    {tv(x.category)} · {currency(Number(x.amount))}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {x.driver || "—"}{x.plate_number ? ` · ${x.plate_number}` : ""}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => review(x.id, true)} className="btn btn-primary text-sm">
                    {tr("ui.exp_approve")}
                  </button>
                  <button onClick={() => review(x.id, false)} className="btn btn-ghost text-sm">
                    {tr("ui.exp_reject")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!ready ? (
        <PageLoading />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={Wallet} title={tr("ui.no_expenses_found")} description={tr("ui.record_your_first_fleet_expense")}
            action={<button onClick={() => setShowAdd(true)} className="btn btn-primary mx-auto"><Plus className="w-4 h-4" /> {tr("ui.add_expense")}</button>} />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto scroll-slim">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="py-3.5 px-6 font-semibold">{tr("ui.expense")}</th>
                  <th className="py-3.5 px-4 font-semibold">{tr("ui.category")}</th>
                  <th className="py-3.5 px-4 font-semibold hidden sm:table-cell">{tr("ui.date")}</th>
                  <th className="py-3.5 px-4 font-semibold hidden md:table-cell">{tr("ui.vehicle")}</th>
                  <th className="py-3.5 px-4 font-semibold">{tr("ui.amount")}</th>
                  <th className="py-3.5 px-4 font-semibold">{tr("ui.status")}</th>
                  <th className="py-3.5 px-6 font-semibold text-right">{tr("ui.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((x) => {
                  const Icon = (catIcon[x.category] || catIcon["Other"]);
                  return (
                    <tr key={x.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${(catIconBg[x.category] || catIconBg["Other"])}`}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="font-semibold text-slate-800">{x.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4"><Badge tone={(catTone[x.category] || "gray")}>{tv(x.category)}</Badge></td>
                      <td className="py-3.5 px-4 text-slate-500 hidden sm:table-cell whitespace-nowrap">{new Date(x.date).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono hidden md:table-cell">{x.plate_number || "—"}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{currency(x.amount)}</td>
                      <td className="py-3.5 px-4"><Badge tone={x.status === "Paid" ? "green" : "amber"}>{tv(x.status)}</Badge></td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/expenses/${x.id}`} className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-violet-50 hover:text-violet-600 transition" aria-label={tr("ui.view")}>
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(x.id)} className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition" aria-label={tr("ui.delete")}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddExpenseModal isOpen={showAdd} onClose={() => setShowAdd(false)} onAddExpense={addExpense} />
    </div>
  );
}
