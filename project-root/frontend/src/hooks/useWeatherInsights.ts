// src/hooks/useWeatherInsights.ts
import { useCallback, useState } from "react";
import axios from "axios";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useWeatherInsights() {
  const [loading, setLoading] = useState(false);

  const getInsights = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/weather/insights`, { headers: { ...authHeaders() } });
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateInsights = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/weather/insights`, null, { headers: { ...authHeaders() } });
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, getInsights, generateInsights };
}
