import { DatabaseSync } from "node:sqlite";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const SERVICE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const sb = createClient(SUPABASE_URL, SERVICE_KEY);
const db = new DatabaseSync("C:/Nerishoes/database.sqlite", { readOnly: true });

async function main() {
  // 1. row count comparison
  const sqliteCount = db.prepare("select count(*) as c from sales").get().c;
  const { count: sbCount, error: ce } = await sb.from("store_sale_items").select("*", { count: "exact", head: true });
  if (ce) throw ce;

  // 2. SUM(quantity) comparison
  const sqliteQtySum = db.prepare("select sum(quantity) as s from sales").get().s;
  const { data: sbItems, error: qe } = await sb.from("store_sale_items").select("quantity, sale_id");
  if (qe) throw qe;
  const sbQtySum = sbItems.reduce((acc, r) => acc + (r.quantity ?? 0), 0);

  console.log("=== ROW COUNT ===");
  console.log("SQLite sales:", sqliteCount, "| Supabase store_sale_items:", sbCount);

  console.log("=== SUM(quantity) ===");
  console.log("SQLite:", sqliteQtySum, "| Supabase:", sbQtySum);

  // 3. every store_sales row (413) has >=1 sale_item — spot check via full join count
  const { data: allSales, error: se } = await sb.from("store_sales").select("id, sqlite_id");
  if (se) throw se;
  const saleIdsWithItems = new Set(sbItems.map((r) => r.sale_id));
  const salesWithoutItems = allSales.filter((s) => !saleIdsWithItems.has(s.id));
  console.log("=== store_sales without any sale_item ===");
  console.log("count:", salesWithoutItems.length, salesWithoutItems.slice(0, 10));

  // 4. spot check: random 5 sale ids compare sqlite vs supabase item detail
  console.log("=== SPOT CHECK (5 random) ===");
  const sample = allSales.filter((s) => s.sqlite_id != null);
  const picks = [];
  for (let i = 0; i < 5; i++) {
    picks.push(sample[Math.floor(Math.random() * sample.length)]);
  }
  for (const p of picks) {
    const sqliteRow = db.prepare("select * from sales where id = ?").get(p.sqlite_id);
    const sbRow = sbItems.find((r) => r.sale_id === p.id);
    console.log(`sqlite_id=${p.sqlite_id} supabase_sale_id=${p.id}`);
    console.log("  sqlite:", sqliteRow ? { product_id: sqliteRow.product_id, quantity: sqliteRow.quantity, unit_price: sqliteRow.unit_price } : "NOT FOUND");
    console.log("  supabase:", sbRow ? { quantity: sbRow.quantity } : "NOT FOUND");
  }

  db.close();
}

main().catch((e) => {
  console.error("HATA:", e);
  process.exit(1);
});
