"use client";
import { useT } from "@/i18n";
export default function ChartWidget() {
  const tr = useT();
  return (
    <div className="w-full h-48 bg-green-50 rounded-lg flex items-center justify-center text-green-300 text-2xl">
      {tr("ui.chart_placeholder")}
    </div>
  );
} 