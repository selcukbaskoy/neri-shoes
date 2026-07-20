"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import RaporCard, { TableWrap, formatTL, formatPct, chartColors } from "./RaporCard";

interface ProductRow {
  product_id: string;
  product_name: string;
  total_sold: number;
  revenue: number;
  cost: number | null;
  profit_margin: number | null;
  by_channel: { store: number; online: number };
}

interface ProductPerformance {
  top_sellers: ProductRow[];
  slow_movers: ProductRow[];
  by_color: { color: string; count: number; revenue: number }[];
  avg_turnover_days: number | null;
  data_quality: { note: string | null };
}

interface Props {
  endpoint: string;
  isOpen: boolean;
  onToggle: () => void;
}

function ProductTable({ rows }: { rows: ProductRow[] }) {
  return (
    <TableWrap>
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-[#222] text-left text-xs uppercase tracking-[0.1em] text-muted">
            <th className="py-2 pr-3">Ürün</th>
            <th className="py-2 pr-3 text-right">Satılan</th>
            <th className="py-2 pr-3 text-right">Ciro</th>
            <th className="py-2 pr-3 text-right">Kâr Marjı</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.product_id} className="border-b border-[#191919]">
              <td className="py-2 pr-3 text-foreground">{r.product_name}</td>
              <td className="py-2 pr-3 text-right text-foreground">{r.total_sold}</td>
              <td className="py-2 pr-3 text-right text-accent">{formatTL(r.revenue)}</td>
              <td className="py-2 pr-3 text-right text-muted">{formatPct(r.profit_margin)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

export default function RaporUrunPerformans({ endpoint, isOpen, onToggle }: Props) {
  return (
    <RaporCard<ProductPerformance> title="Ürün Performansı" endpoint={endpoint} isOpen={isOpen} onToggle={onToggle}>
      {(data) => (
        <div className="space-y-6">
          {data.data_quality.note && (
            <p className="rounded border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-400">
              {data.data_quality.note}
            </p>
          )}

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">En Çok Satanlar</p>
            <ProductTable rows={data.top_sellers} />
          </div>

          {data.slow_movers.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Yavaş Hareket Edenler</p>
              <ProductTable rows={data.slow_movers} />
            </div>
          )}

          {data.by_color.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Renge Göre Dağılım</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.by_color}>
                    <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="color" tick={{ fill: chartColors.muted, fontSize: 11 }} />
                    <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", fontSize: 12 }} />
                    <Bar dataKey="revenue" fill={chartColors.accent} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </RaporCard>
  );
}
