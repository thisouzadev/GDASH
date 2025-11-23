// src/pages/Dashboard.tsx
import React, { useEffect, useMemo } from "react";
import DashboardCards from "@/components/dashboard/Cards";
import Charts from "@/components/dashboard/Charts";
import WeatherTable from "@/components/dashboard/WeatherTable";
import Insights from "@/components/dashboard/Insights";
import { useWeatherLogs } from "@/hooks/useWeatherLogs";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { TemperatureChart } from "@/components/charts/TemperatureChart";

export default function DashboardPage() {
  const { data, fetchLogs, exportCsv, exportXlsx } = useWeatherLogs();

  useEffect(() => {
    fetchLogs({ page: 1, limit: 20 }).catch(() => toast.error("Failed to load logs"));
  }, [fetchLogs]);

  const latest = useMemo(() => (data && data.length ? data[0] : null), [data]);

  const onExportCsv = async () => {
    try {
      const blob = await exportCsv();
      saveAs(blob, "weather_logs.csv");
      toast.success("CSV downloaded");
    } catch {
      toast.error("CSV export failed");
    }
  };

  const onExportXlsx = async () => {
    try {
      const blob = await exportXlsx();
      saveAs(blob, "weather_logs.xlsx");
      toast.success("XLSX downloaded");
    } catch {
      toast.error("XLSX export failed");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard de Clima</h1>
      <div className="grid gap-6">

        <div className="w-full h-[350px] min-h-[300px]">
          <TemperatureChart data={data} />
        </div>
      </div>
      <DashboardCards latest={latest} onExportCsv={onExportCsv} onExportXlsx={onExportXlsx} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Charts records={data} />
          <WeatherTable />
        </div>

        <div className="lg:col-span-1">
          <Insights />
        </div>
      </div>
    </div>
  );
}
