"use client";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import RaporCard, { StatCard, TableWrap, formatTL, chartColors } from "./RaporCard";

interface SalesSummary {
  totals: { revenue: number; sale_count: number; avg_basket: number; item_count: number };
  by_payment_type: { type: string; count: number; total: number }[];
  by_channel: { channel: string; count: number; total: number }[];
  daily_trend: { date: string; revenue: number; count: number }[];
}

interface Props {
  endpoint: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function RaporSatisOzeti({ endpoint, isOpen, onToggle }: Props) {
  return (
    <RaporCard<SalesSummary> title="Satış Özeti" endpoint={endpoint} isOpen={isOpen} onToggle={onToggle}>
      {(data) => (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Ciro" value={formatTL(data.totals.revenue)} big />
            <StatCard label="Satış Sayısı" value={String(data.totals.sale_count)} />
            <StatCard label="Ortalama Sepet" value={formatTL(data.totals.avg_basket)} />
            <StatCard label="Ürün Adedi" value={String(data.totals.item_count)} />
          </div>

          {data.daily_trend.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Günlük Ciro Trendi</p>
              <TableWrap>
                <div className="h-64 min-w-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.daily_trend}>
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fill: chartColors.muted, fontSize: 11 }} />
                      <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", fontSize: 12 }} />
                      <Line type="monotone" dataKey="revenue" stroke={chartColors.accent} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TableWrap>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {data.by_payment_type.length > 0 && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Ödeme Tipine Göre</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.by_payment_type}>
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="type" tick={{ fill: chartColors.muted, fontSize: 11 }} />
                      <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", fontSize: 12 }} />
                      <Bar dataKey="total" fill={chartColors.accent} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            {data.by_channel.length > 0 && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Kanala Göre</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.by_channel}>
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                      <XAxis dataKey="channel" tick={{ fill: chartColors.muted, fontSize: 11 }} />
                      <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", fontSize: 12 }} />
                      <Bar dataKey="total" fill={chartColors.secondary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </RaporCard>
  );
}
