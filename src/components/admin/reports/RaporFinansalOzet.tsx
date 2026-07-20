"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import RaporCard, { StatCard, TableWrap, formatTL, formatPct, chartColors } from "./RaporCard";

interface FinancialSummary {
  revenue: { gross: number; cost: number | null; gross_profit: number | null; margin_pct: number | null };
  collection: { cash_collected: number; pos_collected: number; credit_given: number; credit_collected_in_period: number };
  receivables: {
    total_outstanding: number;
    aging: { current: number; overdue_30: number; overdue_60: number; overdue_90_plus: number };
  };
  daily_breakdown: { date: string; revenue: number; cost: number | null; profit: number | null }[];
  data_quality: { note: string | null };
}

interface Props {
  endpoint: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function RaporFinansalOzet({ endpoint, isOpen, onToggle }: Props) {
  return (
    <RaporCard<FinancialSummary> title="Finansal Özet" endpoint={endpoint} isOpen={isOpen} onToggle={onToggle}>
      {(data) => (
        <div className="space-y-6">
          {data.data_quality.note && (
            <p className="rounded border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-400">
              {data.data_quality.note}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Brüt Ciro" value={formatTL(data.revenue.gross)} big />
            <StatCard label="Maliyet" value={formatTL(data.revenue.cost)} />
            <StatCard label="Brüt Kâr" value={formatTL(data.revenue.gross_profit)} />
            <StatCard label="Kâr Marjı" value={formatPct(data.revenue.margin_pct)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded border border-[#222] bg-[#0f0f0f] p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.1em] text-accent">Tahsilat</p>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Nakit" value={formatTL(data.collection.cash_collected)} />
                <StatCard label="POS" value={formatTL(data.collection.pos_collected)} />
                <StatCard label="Verilen Veresiye" value={formatTL(data.collection.credit_given)} />
                <StatCard label="Tahsil Edilen Veresiye" value={formatTL(data.collection.credit_collected_in_period)} />
              </div>
            </div>
            <div className="rounded border border-[#222] bg-[#0f0f0f] p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.1em] text-accent">
                Alacaklar — Toplam: {formatTL(data.receivables.total_outstanding)}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Güncel" value={formatTL(data.receivables.aging.current)} />
                <StatCard label="30+ gün" value={formatTL(data.receivables.aging.overdue_30)} />
                <StatCard label="60+ gün" value={formatTL(data.receivables.aging.overdue_60)} />
                <StatCard label="90+ gün" value={formatTL(data.receivables.aging.overdue_90_plus)} />
              </div>
            </div>
          </div>

          {data.daily_breakdown.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Günlük Ciro / Kâr</p>
              <TableWrap>
                <div className="h-64 min-w-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.daily_breakdown}>
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fill: chartColors.muted, fontSize: 11 }} />
                      <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="revenue" name="Ciro" stroke={chartColors.accent} strokeWidth={2} dot={false} />
                      {data.daily_breakdown.some((d) => d.profit != null) && (
                        <Line type="monotone" dataKey="profit" name="Kâr" stroke={chartColors.green} strokeWidth={2} dot={false} connectNulls />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TableWrap>
            </div>
          )}
        </div>
      )}
    </RaporCard>
  );
}
