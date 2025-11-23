// src/components/dashboard/Charts.tsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { Weather } from "@/services/weather/types/weather";
import { format } from "date-fns";

type Props = { records: Weather[] };

export default function Charts({ records }: Props) {
  const data = records
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(r => ({
      tempo: format(new Date(r.timestamp), "HH:mm"),
      temperatura: r.temperature,
      Umidade: r.humidity,
    }));

  return (
    <div className="w-full h-64 bg-card p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Temperatura ao longo do tempo</h3>

      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" label={{ value: "Horário", position: "insideBottom", offset: -5 }} />
          <YAxis yAxisId="left" orientation="left" label={{ value: "°C", angle: -90, position: "insideLeft" }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: "% Umidade", angle: -90, position: "insideRight" }} />

          <Tooltip
            formatter={(value, name) =>
              name === "temperature"
                ? [`${value}°C`, "Temperatura"]
                : [`${value}%`, "Umidade"]
            }
            labelFormatter={(label) => `Horário: ${label}`}
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temperature"
            stroke="var(--tw-color-primary, #3b82f6)"
            dot={false}
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="humidity"
            stroke="var(--tw-color-accent, #f59e0b)"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
