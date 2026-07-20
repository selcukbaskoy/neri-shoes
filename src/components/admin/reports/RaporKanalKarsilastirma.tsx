"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import RaporCard, { StatCard, TableWrap, formatTL, chartColors } from "./RaporCard";

interface ChannelStats {
  revenue: number;
  count: number;
  avg_basket: number;
  unique_customers: number;
}

interface ProductComparisonRow {
  product_id: string;
  product_name: string;
  store_sold: number;
  store_revenue: number;
  online_sold: number;
  online_revenue: number;
}

interface ChannelComparison {
  store: ChannelStats;
  online: ChannelStats;
  product_comparison: ProductComparisonRow[];
  store_only_products: ProductComparisonRow[];
  online_only_products: ProductComparisonRow[];
  data_quality: { note: string };
}

interface Props {
  endpoint: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function RaporKanalKarsilastirma({ endpoint, isOpen, onToggle }: Props) {
  return (
    <RaporCard<ChannelComparison> title="Kanal Karşılaştırma" endpoint={endpoint} isOpen={isOpen} onToggle={onToggle}>
      {(data) => {
        const chartData = [
          { channel: "Mağaza", ciro: data.store.revenue },
          { channel: "Online", ciro: data.online.revenue },
        ];
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded border border-[#222] bg-[#0f0f0f] p-4">
                <p className="mb-3 text-xs uppercase tracking-[0.1em] text-accent">Mağaza</p>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Ciro" value={formatTL(data.store.revenue)} />
                  <StatCard label="Satış" value={String(data.store.count)} />
                  <StatCard label="Ort. Sepet" value={formatTL(data.store.avg_basket)} />
                  <StatCard label="Müşteri" value={String(data.store.unique_customers)} />
                </div>
              </div>
              <div className="rounded border border-[#222] bg-[#0f0f0f] p-4">
                <p className="mb-3 text-xs uppercase tracking-[0.1em] text-accent">Online</p>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Ciro" value={formatTL(data.online.revenue)} />
                  <StatCard label="Satış" value={String(data.online.count)} />
                  <StatCard label="Ort. Sepet" value={formatTL(data.online.avg_basket)} />
                  <StatCard label="Müşteri" value={String(data.online.unique_customers)} />
                </div>
              </div>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="channel" tick={{ fill: chartColors.muted, fontSize: 11 }} />
                  <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", fontSize: 12 }} />
                  <Bar dataKey="ciro" fill={chartColors.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="rounded border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-400">
              {data.data_quality.note}
            </p>

            {data.product_comparison.length > 0 && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Ürün Karşılaştırma</p>
                <TableWrap>
                  <table className="w-full min-w-[560px] text-sm">
                    <thead>
                      <tr className="border-b border-[#222] text-left text-xs uppercase tracking-[0.1em] text-muted">
                        <th className="py-2 pr-3">Ürün</th>
                        <th className="py-2 pr-3 text-right">Mağaza</th>
                        <th className="py-2 pr-3 text-right">Online</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.product_comparison.slice(0, 20).map((p) => (
                        <tr key={p.product_id} className="border-b border-[#191919]">
                          <td className="py-2 pr-3 text-foreground">{p.product_name}</td>
                          <td className="py-2 pr-3 text-right text-muted">
                            {p.store_sold} ({formatTL(p.store_revenue)})
                          </td>
                          <td className="py-2 pr-3 text-right text-muted">
                            {p.online_sold} ({formatTL(p.online_revenue)})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              </div>
            )}
          </div>
        );
      }}
    </RaporCard>
  );
}
