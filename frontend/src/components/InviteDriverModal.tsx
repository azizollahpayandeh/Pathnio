"use client";
import { useEffect, useState } from "react";
import { X, Copy, Check, RefreshCw, Ban, KeyRound } from "lucide-react";
import { useT } from "@/i18n";
import {
  createInvitation,
  regenerateInvitation,
  getInvitation,
  revokeInvitation,
  type InvitationInfo,
} from "@/lib/api-data";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  driverId: string;
  driverName: string;
  /** Freshly-minted token (e.g. right after "Add Driver"). */
  initialToken?: string;
  /** Called after any change so the parent can refresh the driver list. */
  onChanged?: () => void;
}

export default function InviteDriverModal({
  isOpen, onClose, driverId, driverName, initialToken, onChanged,
}: Props) {
  const tr = useT();
  const [token, setToken] = useState<string | undefined>(initialToken);
  const [info, setInfo] = useState<InvitationInfo>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setToken(initialToken);
    setCopied(false);
    setError(null);
    if (!initialToken) {
      // No fresh token handed in -> show current status.
      getInvitation(driverId).then(setInfo).catch(() => setInfo(null));
    }
  }, [isOpen, driverId, initialToken]);

  if (!isOpen) return null;

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await fn();
      onChanged?.();
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || tr("ui.something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  const generate = () =>
    run(async () => {
      const { token: t, invitation } = await createInvitation(driverId);
      setToken(t);
      setInfo(invitation);
    });

  const regenerate = () =>
    run(async () => {
      const { token: t, invitation } = await regenerateInvitation(driverId);
      setToken(t);
      setInfo(invitation);
      setCopied(false);
    });

  const revoke = () =>
    run(async () => {
      await revokeInvitation(driverId);
      setToken(undefined);
      setInfo(null);
    });

  const copy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — user can select manually */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 animate-fade-in">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-white" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 leading-tight">{tr("ui.driver_activation")}</h3>
              <p className="text-sm text-slate-500">{driverName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-500 mt-3">
          {tr("ui.share_this_one_time_code_with")} <span className="font-semibold">{driverName}</span>.
          {tr("ui.invite_enter_hint")}
        </p>

        {token ? (
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 font-mono text-sm text-violet-800 break-all select-all">
                {token}
              </code>
              <button
                onClick={copy}
                className="w-11 h-11 shrink-0 rounded-xl bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center"
                title={tr("ui.copy_code")}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copied && <p className="text-xs text-emerald-600 mt-1.5">{tr("ui.copied_to_clipboard")}</p>}
            <p className="text-xs text-slate-400 mt-2">{tr("ui.invite_shown_once")}</p>
          </div>
        ) : (
          <div className="mt-4">
            {info?.status === "USED" ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-emerald-700 text-sm font-medium">
                ✓ {tr("ui.invite_already_active")}
              </div>
            ) : info?.is_active ? (
              <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-amber-700 text-sm">{tr("ui.invite_hidden")}</div>
            ) : (
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-slate-500 text-sm">
                {tr("ui.no_active_invitation_generate_a_code_to_invite_t")}
              </div>
            )}
          </div>
        )}

        {error && <p className="text-rose-600 text-sm mt-3">{error}</p>}

        <div className="flex flex-wrap gap-2 mt-5">
          {!token && info?.status !== "USED" && (
            <button onClick={generate} disabled={loading} className="btn btn-primary flex-1 min-w-[130px]">
              <KeyRound className="w-4 h-4" /> {tr("ui.generate_code")}
            </button>
          )}
          {(token || info?.is_active) && info?.status !== "USED" && (
            <button onClick={regenerate} disabled={loading} className="btn btn-ghost flex-1 min-w-[130px]">
              <RefreshCw className="w-4 h-4" /> {tr("ui.regenerate")}
            </button>
          )}
          {info?.is_active && (
            <button onClick={revoke} disabled={loading} className="btn flex-1 min-w-[110px] bg-rose-50 text-rose-600 hover:bg-rose-100">
              <Ban className="w-4 h-4" /> {tr("ui.revoke")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
