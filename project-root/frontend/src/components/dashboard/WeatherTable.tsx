// src/components/dashboard/WeatherTable.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useWeatherLogs } from "@/hooks/useWeatherLogs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Weather } from "@/services/weather/types/weather";

const filterSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).optional(),
});

type Filter = z.infer<typeof filterSchema>;

export default function WeatherTable() {
  const { data, total, fetchLogs } = useWeatherLogs();
  const [page, setPage] = useState(1);
  const limit = 10;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  const { register, handleSubmit } = useForm<Filter>({
    resolver: zodResolver(filterSchema),
    defaultValues: { page: 1, limit },
  });

  useEffect(() => {
    fetchLogs({ page, limit }).catch(() => toast.error("Error loading logs"));
  }, [page, limit, fetchLogs]);

  const onSubmit = handleSubmit(async (vals) => {
    try {
      await fetchLogs({
        from: vals.from,
        to: vals.to,
        page: 1,
        limit,
      });
      setPage(1);
    } catch {
      toast.error("Failed to filter");
    }
  });

  return (
    <div className="mt-6">

      <form onSubmit={onSubmit} className="flex gap-2 items-end mb-4">
        <div>
          <label className="block text-sm">De</label>
          <input type="datetime-local" {...register("from")} className="input" />
        </div>
        <div>
          <label className="block text-sm">Até</label>
          <input type="datetime-local" {...register("to")} className="input" />
        </div>
        <Button type="submit">Filtro</Button>
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data e Hora</TableHead>
            <TableHead>Temperatura (°C)</TableHead>
            <TableHead>Umidade (%)</TableHead>
            <TableHead>Vento (m/s)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r: Weather) => (
            <TableRow key={r._id}>
              <TableCell>{format(new Date(r.timestamp), "yyyy-MM-dd HH:mm")}</TableCell>
              <TableCell>{r.temperature}°C</TableCell>
              <TableCell>{r.humidity}%</TableCell>
              <TableCell>{r.wind_speed} m/s</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <div>{`Total: ${total}`}</div>
        <div className="flex gap-2 items-center">
          <Button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="px-3 py-2 bg-muted rounded">
            Página {page} de {totalPages}
          </span>
          <Button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
