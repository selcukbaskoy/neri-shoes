"use client";

import RaporCard, { StatCard, TableWrap, formatTL } from "./RaporCard";

interface CriticalStockRow {
  product_id: string;
  product_name: string;
  size: number;
  quantity: number;
}

interface DeadStockRow {
  product: string;
  size: number;
  quantity: number;
  days_since_last_sale: number | null;
  value: number;
}

interface StockMatrixRow {
  product_id: string;
  product_name: string;
  sizes: Record<string, number>;
  total: number;
  value: number;
}

interface StockStatus {
  overview: { total_products: number; total_stock_units: number; total_stock_value: number; zero_stock_variants: number };
  stock_matrix: StockMatrixRow[];
  critical_stock: CriticalStockRow[];
  dead_stock: DeadStockRow[];
  data_quality: { note: string };
}

interface Props {
  endpoint: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function RaporStokDurumu({ endpoint, isOpen, onToggle }: Props) {
  return (
    <RaporCard<StockStatus> title="Stok Durumu" endpoint={endpoint} isOpen={isOpen} onToggle={onToggle}>
      {(data) => (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Ürün Sayısı" value={String(data.overview.total_products)} big />
            <StatCard label="Toplam Adet" value={String(data.overview.total_stock_units)} />
            <StatCard label="Stok Değeri" value={formatTL(data.overview.total_stock_value)} />
            <StatCard label="Sıfır Stok Varyant" value={String(data.overview.zero_stock_variants)} />
          </div>

          {data.critical_stock.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Kritik Stok</p>
              <TableWrap>
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-[#222] text-left text-xs uppercase tracking-[0.1em] text-muted">
                      <th className="py-2 pr-3">Ürün</th>
                      <th className="py-2 pr-3 text-right">Beden</th>
                      <th className="py-2 pr-3 text-right">Adet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.critical_stock.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-b border-[#191919]">
                        <td className="py-2 pr-3 text-foreground">{r.product_name}</td>
                        <td className="py-2 pr-3 text-right text-muted">{r.size}</td>
                        <td className={`py-2 pr-3 text-right ${r.quantity === 0 ? "text-red-500" : "text-yellow-500"}`}>{r.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            </div>
          )}

          {data.dead_stock.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Durgun Stok (90+ gün satılmamış)</p>
              <TableWrap>
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-[#222] text-left text-xs uppercase tracking-[0.1em] text-muted">
                      <th className="py-2 pr-3">Ürün</th>
                      <th className="py-2 pr-3 text-right">Beden</th>
                      <th className="py-2 pr-3 text-right">Adet</th>
                      <th className="py-2 pr-3 text-right">Gün</th>
                      <th className="py-2 pr-3 text-right">Değer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.dead_stock.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-b border-[#191919]">
                        <td className="py-2 pr-3 text-foreground">{r.product}</td>
                        <td className="py-2 pr-3 text-right text-muted">{r.size}</td>
                        <td className="py-2 pr-3 text-right text-muted">{r.quantity}</td>
                        <td className="py-2 pr-3 text-right text-muted">{r.days_since_last_sale ?? "—"}</td>
                        <td className="py-2 pr-3 text-right text-accent">{formatTL(r.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Ürün Bazlı Stok Değeri</p>
            <TableWrap>
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-[#222] text-left text-xs uppercase tracking-[0.1em] text-muted">
                    <th className="py-2 pr-3">Ürün</th>
                    <th className="py-2 pr-3 text-right">Toplam Adet</th>
                    <th className="py-2 pr-3 text-right">Değer</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stock_matrix.map((r) => (
                    <tr key={r.product_id} className="border-b border-[#191919]">
                      <td className="py-2 pr-3 text-foreground">{r.product_name}</td>
                      <td className="py-2 pr-3 text-right text-muted">{r.total}</td>
                      <td className="py-2 pr-3 text-right text-accent">{formatTL(r.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </div>

          <p className="text-xs text-muted">{data.data_quality.note}</p>
        </div>
      )}
    </RaporCard>
  );
}
