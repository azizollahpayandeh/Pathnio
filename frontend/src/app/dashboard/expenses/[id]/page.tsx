"use client";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, Calendar, User, Truck, Tag, Receipt, FileText,
} from "lucide-react";
import { useCollection } from "@/lib/store";
import { Badge, EmptyState } from "@/components/ui";

const currency = (n: number) => "€" + n.toLocaleString(undefined, { minimumFractionDigits: 2 });

export default function ExpenseDetail() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [expenses] = useCollection("expenses");
  const expense = useMemo(() => expenses.find((e) => e.id === id), [expenses, id]);

  if (!expense) {
    return <div className="card"><EmptyState icon={Receipt} title="Expense not found" action={<Link href="/dashboard/expenses" className="btn btn-primary mx-auto">Back to expenses</Link>} /></div>;
  }

  const specs = [
    { icon: Tag, label: "Category", value: expense.category },
    { icon: Calendar, label: "Date", value: new Date(expense.date).toLocaleDateString() },
    { icon: Truck, label: "Vehicle", value: expense.plate_number || "—" },
    { icon: User, label: "Driver", value: expense.driver || "—" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => router.back()} className="btn btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</button>

      <div className="card p-6 sm:p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-brand">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{expense.title}</h1>
              <Badge tone={expense.status === "Paid" ? "green" : "amber"}>{expense.status}</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-slate-900">{currency(expense.amount)}</div>
            <div className="text-sm text-slate-500">Total amount</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {specs.map((s) => (
            <div key={s.label} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <s.icon className="w-5 h-5 text-slate-400 mb-2" />
              <div className="text-xs text-slate-500">{s.label}</div>
              <div className="font-semibold text-slate-800 truncate">{s.value}</div>
            </div>
          ))}
        </div>

        {expense.description && (
          <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1"><FileText className="w-4 h-4" /> Description</div>
            <p className="text-slate-700">{expense.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
