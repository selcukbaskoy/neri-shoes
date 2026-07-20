"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import RaporCard, { TableWrap, chartColors } from "./RaporCard";

interface SizeAnalysis {
  size_distribution: { size: string; sold: number; percentage: number; current_stock: number }[];
  size_by_product: { product_name: string; sizes: Record<string, number> }[];
  restock_suggestion: { size: string; reason: string }[];
}

interface Props {
  endpoint: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function RaporBedenAnalizi({ endpoint, isOpen, onToggle }: Props) {
  return (
    <RaporCard<SizeAnalysis> title="Beden Analizi" endpoint={endpoint} isOpen={isOpen} onToggle={onToggle}>
      {(data) => (
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Beden Dağılımı (satılan vs. stok)</p>
            <TableWrap>
              <div className="h-64 min-w-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.size_distribution}>
                    <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="size" tick={{ fill: chartColors.muted, fontSize: 11 }} />
                    <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", fontSize: 12 }} />
                    <Bar dataKey="sold" name="Satılan" fill={chartColors.accent} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="current_stock" name="Stok" fill={chartColors.secondary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TableWrap>
          </div>

          {data.restock_suggestion.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Yeniden Stoklama Önerisi</p>
              <ul className="space-y-1">
                {data.restock_suggestion.map((r, i) => (
                  <li key={i} className="rounded border border-[#222] bg-[#0f0f0f] px-3 py-2 text-sm text-foreground">
                    {r.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.size_by_product.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Ürüne Göre Beden Dağılımı</p>
              <TableWrap>
                <table className="w-full min-w-[500px] text-sm">
                  <thead>
                    <tr className="border-b border-[#222] text-left text-xs uppercase tracking-[0.1em] text-muted">
                      <th className="py-2 pr-3">Ürün</th>
                      <th className="py-2 pr-3">Bedenler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.size_by_product.map((p, i) => (
                      <tr key={i} className="border-b border-[#191919]">
                        <td className="py-2 pr-3 text-foreground">{p.product_name}</td>
                        <td className="py-2 pr-3 text-muted">
                          {Object.entries(p.sizes)
                            .map(([size, qty]) => `${size}: ${qty}`)
                            .join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            </div>
          )}
        </div>
      )}
    </RaporCard>
  );
}
