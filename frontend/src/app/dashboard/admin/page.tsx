"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Users, Search, Trash2, Shield, User as UserIcon,
  Mail, Phone, Truck, Route, Wallet, Activity,
} from "lucide-react";
import { PageHeader, StatCard, Badge, EmptyState } from "@/components/ui";
import { useCollection, update, remove } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export default function AdminPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  // Platform-admin only — company owners cannot reach this even by deep link.
  useEffect(() => {
    if (ready && user && !user.is_staff) router.replace("/dashboard");
  }, [ready, user, router]);
  const [users] = useCollection("users");
  const [vehicles] = useCollection("vehicles");
  const [trips] = useCollection("trips");
  const [expenses] = useCollection("expenses");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.company_name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.manager_full_name.toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  );

  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

  const toggleRole = (id: string, current: string) => {
    const isAdmin = current === "Admin";
    update("users", id, { role: isAdmin ? "Manager" : "Admin", is_staff: !isAdmin });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader icon={ShieldCheck} title="Admin Console" subtitle="Manage accounts and monitor the platform" gradient="from-rose-500 to-red-600" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard icon={Users} label="Accounts" value={users.length} gradient="from-rose-500 to-red-600" />
        <StatCard icon={Truck} label="Vehicles" value={vehicles.length} gradient="from-orange-500 to-amber-600" />
        <StatCard icon={Route} label="Trips" value={trips.length} gradient="from-purple-500 to-fuchsia-600" />
        <StatCard icon={Wallet} label="Total Spend" value={"€" + totalExpense.toLocaleString()} gradient="from-emerald-500 to-teal-600" />
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5 text-rose-500" /> User accounts</h2>
          <div className="relative sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="field pl-10" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No users found" />
        ) : (
          <div className="overflow-x-auto scroll-slim">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="py-3.5 px-6 font-semibold">Account</th>
                  <th className="py-3.5 px-4 font-semibold hidden md:table-cell">Contact</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold hidden sm:table-cell">Joined</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold flex items-center justify-center">
                          {u.company_name.charAt(0)}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800">{u.company_name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1"><UserIcon className="w-3 h-3" />{u.manager_full_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <div className="text-slate-600 flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" />{u.email}</div>
                      <div className="text-slate-400 text-xs flex items-center gap-1"><Phone className="w-3 h-3" />{u.phone || "—"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge tone={u.role === "Admin" ? "rose" : "blue"} icon={u.role === "Admin" ? Shield : UserIcon}>{u.role}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 hidden sm:table-cell whitespace-nowrap">{new Date(u.date_joined).toLocaleDateString()}</td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleRole(u.id, u.role)} className="btn btn-ghost text-xs py-1.5 px-3">
                          {u.role === "Admin" ? "Make Manager" : "Make Admin"}
                        </button>
                        <button
                          onClick={() => remove("users", u.id)}
                          disabled={u.id === user?.id}
                          className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          title={u.id === user?.id ? "You can't delete yourself" : "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Activity className="w-5 h-5 text-emerald-500" /> System status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["API", "Operational", "bg-emerald-500"],
            ["Database", "Operational", "bg-emerald-500"],
            ["Live tracking", "Operational", "bg-emerald-500"],
            ["Notifications", "Operational", "bg-emerald-500"],
          ].map(([name, status, dot]) => (
            <div key={name} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${dot} animate-pulse`} />
                <span className="font-semibold text-slate-700">{name}</span>
              </div>
              <div className="text-sm text-slate-400 mt-1">{status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
