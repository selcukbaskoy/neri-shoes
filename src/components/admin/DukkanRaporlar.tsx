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

const inputClass =
  "rounded border border-[#2a2a2a] bg-[#111] px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60";

export default function DukkanRaporlar() {
  const initial = defaultRange();
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [channel, setChannel] = useState<Channel>("all");
  const [openSection, setOpenSection] = useState<SectionKey | null>("sales-summary");

  const rangeQuery = `from=${from}T00:00:00.000Z&to=${to}T23:59:59.999Z`;
  const salesSummaryEndpoint = `/api/admin/dukkan/reports/sales-summary?${rangeQuery}&channel=${channel}`;

  function toggle(key: SectionKey) {
    setOpenSection((cur) => (cur === key ? null : key));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Başlangıç</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Bitiş</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Kanal</label>
          <div className="flex gap-2">
            {(["all", "store", "online"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={`rounded border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
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
