// src/components/dashboard/Cards.tsx
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Weather } from "@/services/weather/types/weather";
import { format } from "date-fns";

type Props = {
  latest?: Weather | null;
  onExportCsv?: () => void;
  onExportXlsx?: () => void;
};

export default function DashboardCards({ latest, onExportCsv, onExportXlsx }: Props) {
  const ts = latest?.timestamp ? format(new Date(latest.timestamp), "PPPp") : "—";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Temperatura</CardTitle>
          <CardDescription>Atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {latest ? `${latest.temperature.toFixed(1)}°C` : "—"}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Atualizado às {ts}
          </div>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardHeader>
          <CardTitle>Umidade</CardTitle>
          <CardDescription>Atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">
            {latest ? `${latest.humidity}%` : "—"}
          </div>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardHeader>
          <CardTitle>Velocidade do Vento</CardTitle>
          <CardDescription>Atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">
            {latest ? `${latest.wind_speed} m/s` : "—"}
          </div>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardHeader>
          <CardTitle>Exportar Dados</CardTitle>
          <CardDescription>Baixar registros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={onExportCsv} size="sm">Exportar CSV</Button>
            <Button onClick={onExportXlsx} size="sm" variant="secondary">
              Exportar XLSX
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
