"use client";
import { useState } from "react";
import { X, UserCheck, Ban } from "lucide-react";
import { assignDriver, unassignVehicle } from "@/lib/api-data";
import type { Driver } from "@/lib/types";
import { useT } from "@/i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  vehiclePlate: string;
  currentDriverId?: string | null;
  drivers: Driver[];
  onChanged?: () => void;
}

export default function AssignVehicleModal({
  isOpen, onClose, vehicleId, vehiclePlate, currentDriverId, drivers, onChanged,
}: Props) {
  const tr = useT();
  const [driverId, setDriverId] = useState<string>(currentDriverId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await fn();
      onChanged?.();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || tr("ui.something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 animate-fade-in">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 leading-tight">{tr("ui.assign_driver")}</h3>
              <p className="text-sm text-slate-500 font-mono">{vehiclePlate}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500" aria-label={tr("ui.close")}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className="block text-sm text-slate-600 mt-4 mb-1.5">{tr("ui.driver")}</label>
        <select className="field w-full" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
          <option value="">{tr("ui.select_a_driver")}</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>{d.full_name}</option>
          ))}
        </select>

        {error && <p className="text-rose-600 text-sm mt-3">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button
            onClick={() => run(() => assignDriver(vehicleId, driverId))}
            disabled={loading || !driverId}
            className="btn btn-primary flex-1"
          >
            <UserCheck className="w-4 h-4" /> {tr("ui.assign")}
          </button>
          {currentDriverId && (
            <button
              onClick={() => run(() => unassignVehicle(vehicleId))}
              disabled={loading}
              className="btn bg-rose-50 text-rose-600 hover:bg-rose-100"
            >
              <Ban className="w-4 h-4" /> {tr("ui.unassign")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
