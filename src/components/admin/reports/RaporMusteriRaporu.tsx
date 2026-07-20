"use client";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import RaporCard, { StatCard, TableWrap, formatTL, formatPct, chartColors } from "./RaporCard";

interface TopCustomer {
  id: number;
  name: string;
  phone: string | null;
  total_spent: number;
  purchase_count: number;
  last_purchase: string;
  favorite_size: number | null;
  credit_balance: number;
}

interface CustomerReport {
  overview: { total_customers: number; new_this_month: number; returning_rate: number; avg_spend_per_customer: number };
  top_customers: TopCustomer[];
  new_vs_returning_trend: { month: string; new: number; returning: number }[];
  credit_summary: {
    total_outstanding: number;
    customers_with_credit: number;
    aging: { "0_30_days": number; "31_60_days": number; "61_90_days": number; over_90_days: number };
  };
}

interface Props {
  endpoint: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function RaporMusteriRaporu({ endpoint, isOpen, onToggle }: Props) {
  return (
    <RaporCard<CustomerReport> title="Müşteri Raporu" endpoint={endpoint} isOpen={isOpen} onToggle={onToggle}>
      {(data) => {
        const agingChart = [
          { bucket: "0-30 gün", tutar: data.credit_summary.aging["0_30_days"] },
          { bucket: "31-60 gün", tutar: data.credit_summary.aging["31_60_days"] },
          { bucket: "61-90 gün", tutar: data.credit_summary.aging["61_90_days"] },
          { bucket: "90+ gün", tutar: data.credit_summary.aging.over_90_days },
        ];
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard label="Toplam Müşteri" value={String(data.overview.total_customers)} big />
              <StatCard label="Bu Ay Yeni" value={String(data.overview.new_this_month)} />
              <StatCard label="Tekrar Alım Oranı" value={formatPct(data.overview.returning_rate)} />
              <StatCard label="Ort. Harcama" value={formatTL(data.overview.avg_spend_per_customer)} />
            </div>

            {data.new_vs_returning_trend.length > 0 && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Yeni vs. Tekrar Eden Müşteri</p>
                <TableWrap>
                  <div className="h-56 min-w-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.new_vs_returning_trend}>
                        <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fill: chartColors.muted, fontSize: 11 }} />
                        <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="new" name="Yeni" stroke={chartColors.accent} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="returning" name="Tekrar Eden" stroke={chartColors.secondary} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TableWrap>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">En Değerli Müşteriler</p>
              <TableWrap>
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-[#222] text-left text-xs uppercase tracking-[0.1em] text-muted">
                      <th className="py-2 pr-3">Ad</th>
                      <th className="py-2 pr-3 text-right">Harcama</th>
                      <th className="py-2 pr-3 text-right">Alışveriş</th>
                      <th className="py-2 pr-3 text-right">Beden</th>
                      <th className="py-2 pr-3 text-right">Veresiye</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_customers.slice(0, 15).map((c) => (
                      <tr key={c.id} className="border-b border-[#191919]">
                        <td className="py-2 pr-3 text-foreground">{c.name}</td>
                        <td className="py-2 pr-3 text-right text-accent">{formatTL(c.total_spent)}</td>
                        <td className="py-2 pr-3 text-right text-muted">{c.purchase_count}</td>
                        <td className="py-2 pr-3 text-right text-muted">{c.favorite_size ?? "—"}</td>
                        <td className="py-2 pr-3 text-right text-muted">{formatTL(c.credit_balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">
                Veresiye Yaşlandırma (Toplam: {formatTL(data.credit_summary.total_outstanding)}, {data.credit_summary.customers_with_credit} müşteri)
              </p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agingChart}>
                    <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" tick={{ fill: chartColors.muted, fontSize: 11 }} />
                    <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", fontSize: 12 }} />
                    <Bar dataKey="tutar" fill={chartColors.red} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      }}
    </RaporCard>
  );
}
