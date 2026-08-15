"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Users, Search, Trash2, Shield, User as UserIcon,
  Mail, Phone, Activity,
} from "lucide-react";
import { PageHeader, StatCard, Badge, EmptyState } from "@/components/ui";
import api from "@/app/api";
import { useAuth } from "@/lib/auth";
import { useT } from "@/i18n";

type PlatformUser = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  company_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
};

export default function AdminPage() {
  const tr = useT();
  const { user, ready } = useAuth();
  const router = useRouter();
  // Platform-admin only — company owners cannot reach this even by deep link.
  useEffect(() => {
    if (ready && user && !user.is_staff) router.replace("/dashboard");
  }, [ready, user, router]);

  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("accounts/users/all/");
      setUsers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      // Never fall back to demo data — surface the failure honestly.
      setUsers([]);
      setError(e?.response?.data?.detail || tr("ui.could_not_load_accounts"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready && user?.is_staff) refresh();
  }, [ready, user, refresh]);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          (u.company_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
          (u.full_name || "").toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  );

  const toggleRole = async (id: number, isAdmin: boolean) => {
    try {
      await api.post(`accounts/users/${id}/role/`, { role: isAdmin ? "Manager" : "Admin" });
      await refresh();
    } catch (e: any) {
      setError(e?.response?.data?.detail || tr("ui.could_not_update_role"));
    }
  };

  const removeUser = async (id: number) => {
    try {
      await api.delete(`accounts/users/${id}/delete/`);
      await refresh();
    } catch (e: any) {
      setError(e?.response?.data?.detail || tr("ui.could_not_delete_account"));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader icon={ShieldCheck} title={tr("ui.admin_console")} subtitle={tr("ui.manage_accounts_and_monitor_the_platform")} gradient="from-rose-500 to-red-600" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard icon={Users} label={tr("ui.accounts")} value={users.length} gradient="from-rose-500 to-red-600" />
        <StatCard icon={Shield} label={tr("ui.admins")} value={users.filter((u) => u.is_staff).length} gradient="from-violet-500 to-purple-600" />
        <StatCard icon={UserIcon} label={tr("ui.company_owners")} value={users.filter((u) => u.company_name).length} gradient="from-blue-500 to-indigo-600" />
        <StatCard icon={Activity} label={tr("ui.status")} value="Operational" gradient="from-emerald-500 to-teal-600" />
      </div>

      {error && (
        <div className="card p-4 border-rose-200 bg-rose-50 text-rose-700 text-sm">{error}</div>
      )}

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5 text-rose-500" /> {tr("ui.user_accounts")}</h2>
          <div className="relative sm:w-72">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr("ui.search_users")} className="field ps-10" />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">{tr("ui.loading_accounts")}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title={tr("ui.no_users_found")} />
        ) : (
          <div className="overflow-x-auto scroll-slim">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="py-3.5 px-6 font-semibold">{tr("ui.account")}</th>
                  <th className="py-3.5 px-4 font-semibold hidden md:table-cell">{tr("ui.contact")}</th>
                  <th className="py-3.5 px-4 font-semibold">{tr("ui.role")}</th>
                  <th className="py-3.5 px-4 font-semibold hidden sm:table-cell">{tr("ui.joined")}</th>
                  <th className="py-3.5 px-6 font-semibold text-right">{tr("ui.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const label = u.company_name || u.full_name || u.username;
                  return (
                    <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold flex items-center justify-center">
                            {label.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-800">{label}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1"><UserIcon className="w-3 h-3" />{u.full_name || u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <div className="text-slate-600 flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" />{u.email || "—"}</div>
                        <div className="text-slate-400 text-xs flex items-center gap-1"><Phone className="w-3 h-3" />{u.phone || "—"}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge tone={u.is_staff ? "rose" : "blue"} icon={u.is_staff ? Shield : UserIcon}>{u.is_staff ? "Admin" : "Manager"}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 hidden sm:table-cell whitespace-nowrap">{u.date_joined ? new Date(u.date_joined).toLocaleDateString() : "—"}</td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => toggleRole(u.id, u.is_staff)} disabled={String(u.id) === String(user?.id)} className="btn btn-ghost text-xs py-1.5 px-3 disabled:opacity-40">
                            {u.is_staff ? "Make Manager" : "Make Admin"}
                          </button>
                          <button
                            onClick={() => removeUser(u.id)}
                            disabled={String(u.id) === String(user?.id)}
                            className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            title={String(u.id) === String(user?.id) ? "You can't delete yourself" : tr("ui.delete")}
                          >
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
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Activity className="w-5 h-5 text-emerald-500" /> {tr("ui.system_status")}</h2>
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
