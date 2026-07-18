import { DatabaseSync } from "node:sqlite";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const SERVICE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const sb = createClient(SUPABASE_URL, SERVICE_KEY);
const db = new DatabaseSync("C:/Nerishoes/database.sqlite", { readOnly: true });

async function main() {
  const { data: sqliteSales, error: sse } = await sb.from("store_sales").select("id, sqlite_id").not("sqlite_id", "is", null);
  if (sse) throw sse;
  const saleMap = new Map(sqliteSales.map((s) => [s.sqlite_id, s.id]));

  const { data: idMap, error: ie } = await sb.from("sqlite_id_map").select("sqlite_product_id, supabase_product_id");
  if (ie) throw ie;
  const productIdMap = new Map(idMap.map((r) => [r.sqlite_product_id, r.supabase_product_id]));

  const sqliteProducts = db.prepare("select id, size from products").all();
  const sizeById = new Map(sqliteProducts.map((p) => [p.id, p.size]));

  const sales = db.prepare("select * from sales").all();

  const { data: existingItems, error: ee } = await sb.from("store_sale_items").select("sale_id");
  if (ee) throw ee;
  const existingSaleIds = new Set(existingItems.map((r) => r.sale_id));

  const rows = [];
  const skippedNoSale = [];
  for (const s of sales) {
    const saleId = saleMap.get(s.id);
    if (!saleId) {
      skippedNoSale.push(s.id);
      continue;
    }
    if (existingSaleIds.has(saleId)) continue;
    rows.push({
      sale_id: saleId,
      product_id: productIdMap.get(s.product_id) ?? null,
      size: sizeById.get(s.product_id) ?? null,
      quantity: s.quantity,
      unit_price: s.unit_price,
      returned_quantity: s.returned_quantity,
    });
  }

  console.log("SQLite toplam sales (kalem kaynağı):", sales.length);
  console.log("store_sales eşleşmedi (atlandı):", skippedNoSale.length, skippedNoSale);
  console.log("Eklenecek yeni kalem satırı:", rows.length);

  if (rows.length) {
    const { error: insErr } = await sb.from("store_sale_items").insert(rows);
    if (insErr) throw insErr;
  }

  const { count } = await sb.from("store_sale_items").select("*", { count: "exact", head: true });
  console.log("store_sale_items toplam satır (sonrası):", count);

  db.close();
}

main().catch((e) => {
  console.error("HATA:", e);
  process.exit(1);
});
