// src/hooks/useWeatherLogs.ts
import { useCallback, useState } from "react";
import axios, { type AxiosResponse } from "axios";
import type { Weather } from "@/services/weather/types/weather";


type LogsResponse = {
  data: Weather[];
  total: number;
};

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useWeatherLogs() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Weather[]>([]);
  const [total, setTotal] = useState<number>(0);

  const fetchLogs = useCallback(
    async (params: { page?: number; limit?: number; from?: string; to?: string } = {}) => {
      setLoading(true);
      try {
        const res: AxiosResponse<LogsResponse> = await axios.get(`${import.meta.env.VITE_API_URL}/weather/logs`, {
          params,
          headers: { ...authHeaders() },
        });

        setData(
          res.data.data.filter(
            (item) =>
              item.timestamp && !isNaN(new Date(item.timestamp).getTime())
          )
        );
        setTotal(res.data.total ?? res.data.data.length);
        return res.data;
      } catch (err) {
        setData([]);
        setTotal(0);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const exportCsv = useCallback(
    async (params: { from?: string; to?: string } = {}) => {
      const url = `${import.meta.env.VITE_API_URL}/weather/export.csv`;
      const res = await axios.get(url, {
        params,
        headers: { ...authHeaders() },
        responseType: "blob",
      });
      console.log('csv', res.data);

      return res.data;
    },
    []
  );

  const exportXlsx = useCallback(
    async (params: { from?: string; to?: string } = {}) => {
      const url = `${import.meta.env.VITE_API_URL}/weather/export.xlsx`;
      const res = await axios.get(url, {
        params,
        headers: { ...authHeaders() },
        responseType: "blob",
      });
      return res.data;
    },
    []
  );

  return {
    loading,
    data,
    total,
    fetchLogs,
    exportCsv,
    exportXlsx,
  };
}
