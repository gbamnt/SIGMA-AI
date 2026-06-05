"use client";
import { useState, useEffect, useCallback } from "react";

export function useAPI<T>(url: string, deps: any[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setData(await r.json());
    } catch (e: any) {
      setError(e.message);
      setData([]);
    } finally { setLoading(false); }
  }, [url]);

  useEffect(() => { fetch_(); }, deps);
  return { data, loading, error, refetch: fetch_ };
}

export async function apiPost(url: string, body: any) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) { const e = await r.json(); throw new Error(e.error || "Erro"); }
  return r.json();
}

export async function apiPut(url: string, body: any) {
  const r = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) { const e = await r.json(); throw new Error(e.error || "Erro"); }
  return r.json();
}

export async function apiDelete(url: string, body?: any) {
  const r = await fetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) { const e = await r.json(); throw new Error(e.error || "Erro"); }
  return r.json();
}
