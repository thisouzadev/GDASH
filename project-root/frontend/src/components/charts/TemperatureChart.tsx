// src/components/charts/TemperatureChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Props = {
  data: {
    timestamp: string | null;
    temperature: number;
  }[];
};

function normalizeTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

export function TemperatureChart({ data }: Props) {
  const formattedData = data
    .filter((d) => d.timestamp)
    .map((d) => {
      const safe = normalizeTimestamp(d.timestamp!);

      return {
        ...d,
        time: new Date(safe).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Temperatura ao longo do tempo</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: "300px", minHeight: "300px" }}>
          <ResponsiveContainer>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-40" />

              <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="currentColor" />

              <YAxis
                tick={{ fontSize: 12 }}
                stroke="currentColor"
                domain={["dataMin - 1", "dataMax + 1"]}
              />

              <Tooltip
                labelFormatter={(value) => `Horário: ${value}`}
                formatter={(value) => [`${value}°C`, "Temperatura"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />

              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>

  );
}
