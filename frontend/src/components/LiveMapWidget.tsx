"use client";
import { useMemo } from "react";
import { FaCarSide, FaCheckCircle, FaRegClock, FaTimesCircle } from "react-icons/fa";
import { useLiveVehicles } from "@/lib/api-data";
import { useT } from "@/i18n";
import LiveTrackMap from "./LiveTrackMap";

interface LiveMapWidgetProps {
  fullscreen?: boolean;
}

export default function LiveMapWidget({ fullscreen = false }: LiveMapWidgetProps) {
  const tr = useT();
  const { data: vehicles } = useLiveVehicles();

  const counts = useMemo(() => {
    const c = { moving: 0, stopped: 0, offline: 0 };
    vehicles.forEach((v) => {
      if (v.live_status === "MOVING") c.moving += 1;
      else if (v.live_status === "STOPPED") c.stopped += 1;
      else c.offline += 1;
    });
    return c;
  }, [vehicles]);

  return (
    <div className="w-full h-full min-h-[320px] relative rounded-2xl overflow-hidden">
      {/* Counters overlay */}
      <div className="live-map-counters absolute top-3 right-3 z-[1000] card px-4 py-2.5 flex flex-wrap gap-x-5 gap-y-1 items-center text-sm shadow-soft">
        <span className="font-bold text-violet-700 flex items-center gap-1.5"><FaCarSide className="text-violet-400" />{tr("ui.cnt_total", { count: vehicles.length })}</span>
        <span className="font-semibold text-emerald-600 flex items-center gap-1"><FaCheckCircle />{tr("ui.cnt_moving", { count: counts.moving })}</span>
        <span className="font-semibold text-amber-600 flex items-center gap-1"><FaRegClock />{tr("ui.cnt_stopped", { count: counts.stopped })}</span>
        <span className="font-semibold text-rose-600 flex items-center gap-1"><FaTimesCircle />{tr("ui.cnt_offline", { count: counts.offline })}</span>
      </div>
      <LiveTrackMap vehicles={vehicles} />
    </div>
  );
}
