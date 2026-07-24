"use client";

import { useState } from "react";
import RaporSatisOzeti from "./reports/RaporSatisOzeti";
import RaporUrunPerformans from "./reports/RaporUrunPerformans";
import RaporBedenAnalizi from "./reports/RaporBedenAnalizi";
import RaporKanalKarsilastirma from "./reports/RaporKanalKarsilastirma";
import RaporMusteriRaporu from "./reports/RaporMusteriRaporu";
import RaporStokDurumu from "./reports/RaporStokDurumu";
import RaporFinansalOzet from "./reports/RaporFinansalOzet";

type Channel = "all" | "store" | "online";
type SectionKey =
  | "sales-summary"
  | "product-performance"
  | "size-analysis"
  | "channel-comparison"
  | "customer-report"
  | "stock-status"
  | "financial-summary";

function defaultRange() {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

const RANGE_PRESETS: { key: string; label: string; range: () => { from: string; to: string } }[] = [
  {
    key: "7d",
    label: "Son 7 Gün",
    range: () => {
      const to = new Date();
      const from = new Date(to.getTime() - 6 * 24 * 60 * 60 * 1000);
      return { from: toISODate(from), to: toISODate(to) };
    },
  },
  {
    key: "30d",
    label: "Son 30 Gün",
    range: () => {
      const to = new Date();
      const from = new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000);
      return { from: toISODate(from), to: toISODate(to) };
    },
  },
  {
    key: "month",
    label: "Bu Ay",
    range: () => {
      const to = new Date();
      const from = new Date(to.getFullYear(), to.getMonth(), 1);
      return { from: toISODate(from), to: toISODate(to) };
    },
  },
];

const inputClass =
  "min-h-11 rounded border border-[#2a2a2a] bg-[#111] px-3 py-2 text-base text-foreground outline-none focus:border-accent/60 sm:text-sm";

export default function DukkanRaporlar() {
  const initial = defaultRange();
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [activePreset, setActivePreset] = useState<string | null>("30d");
  const [channel, setChannel] = useState<Channel>("all");
  const [openSection, setOpenSection] = useState<SectionKey | null>("sales-summary");

  function applyPreset(preset: (typeof RANGE_PRESETS)[number]) {
    const r = preset.range();
    setFrom(r.from);
    setTo(r.to);
    setActivePreset(preset.key);
  }

  const rangeQuery = `from=${from}T00:00:00.000Z&to=${to}T23:59:59.999Z`;
  const salesSummaryEndpoint = `/api/admin/dukkan/reports/sales-summary?${rangeQuery}&channel=${channel}`;

  function toggle(key: SectionKey) {
    setOpenSection((cur) => (cur === key ? null : key));
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {RANGE_PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => applyPreset(preset)}
            className={`min-h-11 rounded border px-3 text-xs font-semibold uppercase tracking-wide transition-colors ${
              activePreset === preset.key ? "border-accent bg-accent/10 text-accent" : "border-[#2a2a2a] text-muted hover:border-accent/40"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Başlangıç</label>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setActivePreset(null);
            }}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Bitiş</label>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setActivePreset(null);
            }}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Kanal</label>
          <div className="flex gap-2">
            {(["all", "store", "online"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={`min-h-11 rounded border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  channel === c ? "border-accent bg-accent/10 text-accent" : "border-[#2a2a2a] text-muted hover:border-accent/40"
                }`}
              >
                {c === "all" ? "Tümü" : c === "store" ? "Mağaza" : "Online"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <RaporSatisOzeti endpoint={salesSummaryEndpoint} isOpen={openSection === "sales-summary"} onToggle={() => toggle("sales-summary")} />
        <RaporUrunPerformans
          endpoint={`/api/admin/dukkan/reports/product-performance?${rangeQuery}`}
          isOpen={openSection === "product-performance"}
          onToggle={() => toggle("product-performance")}
        />
        <RaporBedenAnalizi
          endpoint={`/api/admin/dukkan/reports/size-analysis?${rangeQuery}`}
          isOpen={openSection === "size-analysis"}
          onToggle={() => toggle("size-analysis")}
        />
        <RaporKanalKarsilastirma
          endpoint={`/api/admin/dukkan/reports/channel-comparison?${rangeQuery}`}
          isOpen={openSection === "channel-comparison"}
          onToggle={() => toggle("channel-comparison")}
        />
        <RaporMusteriRaporu
          endpoint={`/api/admin/dukkan/reports/customer-report?${rangeQuery}`}
          isOpen={openSection === "customer-report"}
          onToggle={() => toggle("customer-report")}
        />
        <RaporStokDurumu
          endpoint="/api/admin/dukkan/reports/stock-status"
          isOpen={openSection === "stock-status"}
          onToggle={() => toggle("stock-status")}
        />
        <RaporFinansalOzet
          endpoint={`/api/admin/dukkan/reports/financial-summary?${rangeQuery}`}
          isOpen={openSection === "financial-summary"}
          onToggle={() => toggle("financial-summary")}
        />
      </div>
    </div>
  );
}
