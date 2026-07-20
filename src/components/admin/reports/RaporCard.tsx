"use client";

import { useEffect, useState, type ReactNode } from "react";

interface RaporCardProps<T> {
  title: string;
  endpoint: string;
  isOpen: boolean;
  onToggle: () => void;
  isEmpty?: (data: T) => boolean;
  children: (data: T, reload: () => void) => ReactNode;
}

interface CardState<T> {
  status: "idle" | "loading" | "error" | "done";
  data: T | null;
  error: string | null;
}

export default function RaporCard<T>({ title, endpoint, isOpen, onToggle, isEmpty, children }: RaporCardProps<T>) {
  const [state, setState] = useState<CardState<T>>({ status: "idle", data: null, error: null });

  function load() {
    setState((s) => ({ ...s, status: "loading", error: null }));
    fetch(endpoint)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "unknown_error");
        setState({ status: "done", data: json as T, error: null });
      })
      .catch((err) => {
        setState({ status: "error", data: null, error: err instanceof Error ? err.message : "unknown_error" });
      });
  }

  useEffect(() => {
    if (isOpen) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, endpoint]);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">{title}</h3>
        <span className={`text-accent transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▾</span>
      </button>

      {isOpen && (
        <div className="border-t border-[#222] p-5">
          {state.status === "loading" || state.status === "idle" ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-1/3 rounded bg-[#1a1a1a]" />
              <div className="h-24 rounded bg-[#1a1a1a]" />
              <div className="h-4 w-1/2 rounded bg-[#1a1a1a]" />
            </div>
          ) : state.status === "error" ? (
            <div className="rounded border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400">
              <p className="mb-3">Hata: {state.error}</p>
              <button
                type="button"
                onClick={load}
                className="rounded border border-red-500/40 px-3 py-1 text-xs uppercase tracking-wide hover:bg-red-500/20"
              >
                Tekrar Dene
              </button>
            </div>
          ) : state.data && (!isEmpty || !isEmpty(state.data)) ? (
            children(state.data, load)
          ) : (
            <p className="rounded border border-[#222] bg-[#0f0f0f] p-4 text-center text-sm text-muted">
              Bu aralıkta veri yok.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function StatCard({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.1em] text-muted">{label}</p>
      <p className={big ? "text-2xl font-bold text-accent" : "text-lg font-semibold text-foreground"}>{value}</p>
    </div>
  );
}

export function formatTL(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${n.toLocaleString("tr-TR")} TL`;
}

export function formatPct(n: number | null | undefined): string {
  if (n == null) return "—";
  return `%${n.toLocaleString("tr-TR")}`;
}

export const chartColors = {
  accent: "#FFD000",
  secondary: "#B8960B",
  muted: "#A8A8A8",
  grid: "#222222",
  red: "#EF4444",
  green: "#22C55E",
};

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}
