"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Shield, Building2, Users as UsersIcon, User as UserIcon,
  Truck, Route, Wallet, Bell, Mail, Search, Ban, CheckCircle2, Trash2,
  TrendingUp, MessageSquare,
} from "lucide-react";
import { PageHeader, StatCard, Badge, EmptyState, Modal, Field } from "@/components/ui";
import api from "@/app/api";
import { useAuth } from "@/lib/auth";
import { useT } from "@/i18n";
import { useUnits } from "@/lib/format";
import { toast } from "@/components/Toast";
import {
  fetchAdminOverview, fetchAdminCompanies, setCompanyActive,
  fetchAdminMessages, replyToMessage,
  type AdminOverview, type AdminCompany, type AdminMessage,
} from "@/lib/api-data";

type PlatformUser = {
  id: number; username: string; email: string; full_name: string;
  phone: string; company_name: string; is_staff: boolean;
  is_superuser: boolean; date_joined: string;
};

type Tab = "overview" | "companies" | "users" | "messages";

export default function AdminPage() {
  const tr = useT();
  const { number, currency } = useUnits();
  const { user, ready } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");

  // Platform-admin only — company owners cannot reach this even by deep link.
  useEffect(() => {
    if (ready && user && !user.is_staff) router.replace("/dashboard");
  }, [ready, user, router]);

  if (!ready || !user) {
    return <div className="card p-10 text-center text-slate-400">{tr("common.loading")}</div>;
  }
  if (!user.is_staff) return null;

  const TABS: { key: Tab; label: string; icon: typeof ShieldCheck }[] = [
    { key: "overview", label: tr("ui.adm_overview"), icon: TrendingUp },
    { key: "companies", label: tr("ui.adm_companies"), icon: Building2 },
    { key: "users", label: tr("ui.adm_users"), icon: UsersIcon },
    { key: "messages", label: tr("ui.adm_messages"), icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={ShieldCheck}
        title={tr("ui.admin_console")}
        subtitle={tr("ui.manage_accounts_and_monitor_the_platform")}
        gradient="from-rose-500 to-red-600"
      />

      <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-2xl w-full overflow-x-auto scroll-slim">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                tab === t.key ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && <OverviewTab number={number} currency={currency} />}
      {tab === "companies" && <CompaniesTab number={number} />}
      {tab === "users" && <UsersTab meId={user.id} />}
      {tab === "messages" && <MessagesTab />}
    </div>
  );
}

/* ------------------------------------------------------------------ Overview */
function OverviewTab({
  number, currency,
}: { number: (n: number) => string; currency: (n: number, d?: number) => string }) {
  const tr = useT();
  const [d, setD] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchAdminOverview().then(setD).catch(() => setD(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <StatGridSkeleton />;
  if (!d) return <div className="card p-8 text-center text-slate-400">{tr("ui.something_went_wrong")}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard icon={Building2} label={tr("ui.adm_companies")} value={number(d.companies)} gradient="from-rose-500 to-red-600" />
        <StatCard icon={UsersIcon} label={tr("ui.adm_users")} value={number(d.users)} gradient="from-violet-500 to-purple-600" />
        <StatCard icon={UserIcon} label={tr("ui.drivers")} value={number(d.drivers)} gradient="from-purple-500 to-fuchsia-600" />
        <StatCard icon={Truck} label={tr("ui.vehicles")} value={number(d.vehicles)} gradient="from-orange-500 to-amber-600" />
        <StatCard icon={Route} label={tr("ui.trips")} value={number(d.trips)} gradient="from-sky-500 to-cyan-600" />
        <StatCard icon={Wallet} label={tr("ui.adm_mrr")} value={currency(Number(d.mrr))} gradient="from-emerald-500 to-teal-600" />
        <StatCard icon={Bell} label={tr("ui.adm_open_alerts")} value={number(d.open_alerts)} gradient="from-amber-500 to-orange-600" />
        <StatCard icon={Mail} label={tr("ui.adm_open_messages")} value={number(d.open_messages)} gradient="from-teal-500 to-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-bold text-slate-800 mb-4">{tr("ui.adm_plan_distribution")}</h2>
          {d.plan_distribution.length === 0 ? (
            <p className="text-sm text-slate-400">{tr("ui.none")}</p>
          ) : (
            <div className="space-y-3">
              {d.plan_distribution.map((p) => {
                const pct = d.companies ? Math.round((p.count / d.companies) * 100) : 0;
                return (
                  <div key={p.code}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-700">{p.name}</span>
                      <span className="text-slate-500">{number(p.count)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-slate-800 mb-4">{tr("ui.adm_subscriptions")}</h2>
          <div className="grid grid-cols-3 gap-3">
            <SubStat label={tr("ui.adm_active")} value={number(d.subscriptions.active)} tone="text-emerald-600" />
            <SubStat label={tr("ui.adm_trial")} value={number(d.subscriptions.trial)} tone="text-amber-600" />
            <SubStat label={tr("ui.adm_cancelled")} value={number(d.subscriptions.cancelled)} tone="text-rose-600" />
          </div>
          <p className="text-sm text-slate-400 mt-4">
            {tr("ui.adm_new_companies", { count: d.companies_new_30d })}
          </p>
        </div>
      </div>
    </div>
  );
}

function SubStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
      <div className={`text-2xl font-bold ${tone}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

/* ----------------------------------------------------------------- Companies */
function CompaniesTab({ number }: { number: (n: number) => string }) {
  const tr = useT();
  const [rows, setRows] = useState<AdminCompany[] | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(() => {
    fetchAdminCompanies().then(setRows).catch(() => setRows([]));
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(
    () => (rows ?? []).filter((c) =>
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  const toggle = async (c: AdminCompany) => {
    setBusy(c.id);
    try {
      await setCompanyActive(c.id, !c.is_active);
      await load();
      toast.success(c.is_active ? tr("ui.adm_suspended") : tr("ui.adm_activated"));
    } catch (e: unknown) {
      toast.fromError(e, tr("ui.something_went_wrong"));
    } finally {
      setBusy(null);
    }
  };

  if (rows === null) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      <div className="card p-4 relative">
        <Search className="absolute start-7 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={tr("ui.adm_search_company")} className="field ps-10" />
      </div>
      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={Building2} title={tr("ui.adm_no_companies")} description={tr("ui.none")} /></div>
      ) : (
        <div className="space-y-3 stagger">
          {filtered.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900">{c.company_name}</h3>
                    {c.plan_name && <Badge tone="violet">{c.plan_name}</Badge>}
                    {c.is_active
                      ? <Badge tone="green" icon={CheckCircle2}>{tr("ui.adm_active_status")}</Badge>
                      : <Badge tone="rose" icon={Ban}>{tr("ui.adm_suspended_status")}</Badge>}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {c.manager_full_name} · <span className="ltr-inline">{c.email}</span>
                  </p>
                  <div className="flex gap-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1"><UserIcon className="w-4 h-4 text-slate-400" />{number(c.driver_count)}</span>
                    <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-slate-400" />{number(c.vehicle_count)}</span>
                    <span className="text-slate-400">{new Date(c.date_joined).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggle(c)}
                  disabled={busy === c.id}
                  className={`btn text-sm shrink-0 ${c.is_active ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "btn-primary"}`}
                >
                  {c.is_active ? <><Ban className="w-4 h-4" /> {tr("ui.adm_suspend")}</> : <><CheckCircle2 className="w-4 h-4" /> {tr("ui.adm_activate")}</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------- Users */
function UsersTab({ meId }: { meId: number | string }) {
  const tr = useT();
  const [users, setUsers] = useState<PlatformUser[] | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    api.get("accounts/users/all/").then(({ data }) => setUsers(data)).catch(() => setUsers([]));
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(
    () => (users ?? []).filter((u) =>
      (u.full_name || u.username).toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.company_name || "").toLowerCase().includes(search.toLowerCase())),
    [users, search]
  );

  const toggleRole = async (id: number, isAdmin: boolean) => {
    try {
      await api.post(`accounts/users/${id}/role/`, { role: isAdmin ? "user" : "admin" });
      await load();
      toast.success(tr("ui.adm_role_updated"));
    } catch (e: unknown) {
      toast.fromError(e, tr("ui.could_not_update_role"));
    }
  };
  const remove = async (id: number, name: string) => {
    if (typeof window !== "undefined" && !window.confirm(tr("ui.adm_confirm_delete_user", { name }))) return;
    try {
      await api.delete(`accounts/users/${id}/delete/`);
      await load();
      toast.success(tr("ui.adm_user_deleted"));
    } catch (e: unknown) {
      toast.fromError(e, tr("ui.something_went_wrong"));
    }
  };

  if (users === null) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      <div className="card p-4 relative">
        <Search className="absolute start-7 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={tr("ui.search_users")} className="field ps-10" />
      </div>
      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={UsersIcon} title={tr("ui.no_users_found")} description={tr("ui.none")} /></div>
      ) : (
        <div className="space-y-2 stagger">
          {filtered.map((u) => (
            <div key={u.id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 truncate">{u.full_name || u.username}</span>
                  <Badge tone={u.is_staff ? "rose" : "blue"} icon={u.is_staff ? Shield : UserIcon}>
                    {u.is_staff ? tr("ui.admin") : tr("ui.manager")}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 truncate">
                  <span className="ltr-inline">{u.email}</span>{u.company_name ? ` · ${u.company_name}` : ""}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => toggleRole(u.id, u.is_staff)}
                  disabled={String(u.id) === String(meId)}
                  className="btn btn-ghost text-xs py-1.5 px-3 disabled:opacity-40">
                  {u.is_staff ? tr("ui.make_manager") : tr("ui.make_admin")}
                </button>
                <button onClick={() => remove(u.id, u.full_name || u.username)}
                  disabled={String(u.id) === String(meId)}
                  title={String(u.id) === String(meId) ? tr("ui.cannot_delete_self") : tr("ui.delete")}
                  className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-40">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Messages */
function MessagesTab() {
  const tr = useT();
  const [rows, setRows] = useState<AdminMessage[] | null>(null);
  const [reply, setReply] = useState<AdminMessage | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    fetchAdminMessages().then(setRows).catch(() => setRows([]));
  }, []);
  useEffect(() => { load(); }, [load]);

  const send = async () => {
    if (!reply || !text.trim()) return;
    setSending(true);
    try {
      await replyToMessage(reply.id, text.trim());
      setReply(null); setText("");
      await load();
      toast.success(tr("ui.adm_reply_sent"));
    } catch (e: unknown) {
      toast.fromError(e, tr("ui.something_went_wrong"));
    } finally {
      setSending(false);
    }
  };

  if (rows === null) return <TableSkeleton />;

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <div className="card"><EmptyState icon={Mail} title={tr("ui.adm_no_messages")} description={tr("ui.none")} /></div>
      ) : (
        rows.map((m) => (
          <div key={m.id} className="card p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800">{m.name}</span>
                  <span className="text-sm text-slate-400"><span className="ltr-inline">{m.email}</span></span>
                  {m.status === "open"
                    ? <Badge tone="amber">{tr("ui.adm_msg_open")}</Badge>
                    : <Badge tone="green" icon={CheckCircle2}>{tr("ui.adm_msg_answered")}</Badge>}
                </div>
                {m.subject && <p className="font-medium text-slate-700 mt-2">{m.subject}</p>}
                <p className="text-slate-600 mt-1">{m.message}</p>
                {m.reply && (
                  <div className="mt-3 rounded-xl bg-violet-50 border border-violet-100 px-4 py-2.5">
                    <p className="text-xs font-semibold text-violet-700 mb-0.5">{tr("ui.adm_your_reply")}</p>
                    <p className="text-sm text-slate-600">{m.reply}</p>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-2">{new Date(m.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => { setReply(m); setText(m.reply || ""); }} className="btn btn-ghost text-sm shrink-0">
                <MessageSquare className="w-4 h-4" /> {m.reply ? tr("ui.adm_edit_reply") : tr("ui.adm_reply")}
              </button>
            </div>
          </div>
        ))
      )}

      <Modal open={!!reply} onClose={() => setReply(null)} title={tr("ui.adm_reply")}
        subtitle={reply?.subject} icon={MessageSquare} gradient="from-violet-500 to-purple-600">
        <div className="space-y-4">
          <Field label={tr("ui.adm_reply")}>
            <textarea className="field min-h-[120px]" value={text} onChange={(e) => setText(e.target.value)}
              placeholder={tr("ui.adm_reply_placeholder")} />
          </Field>
          <div className="flex justify-end gap-3">
            <button onClick={() => setReply(null)} className="btn btn-ghost">{tr("ui.cancel")}</button>
            <button onClick={send} disabled={sending || !text.trim()} className="btn btn-primary">
              {sending ? tr("ui.saving") : tr("ui.adm_send_reply")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* --------------------------------------------------------------- Skeletons */
function StatGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card p-5 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-slate-100 mb-3" />
          <div className="h-6 w-16 bg-slate-100 rounded mb-2" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}
function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card p-4 animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100" />
          <div className="flex-1"><div className="h-4 w-40 bg-slate-100 rounded mb-2" /><div className="h-3 w-64 bg-slate-100 rounded" /></div>
        </div>
      ))}
    </div>
  );
}
