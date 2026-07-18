import { DatabaseSync } from "node:sqlite";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const SERVICE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const sb = createClient(SUPABASE_URL, SERVICE_KEY);
const db = new DatabaseSync("C:/Nerishoes/database.sqlite", { readOnly: true });

async function main() {
  const { data: collections, error: ce } = await sb.from("credit_collections").select("id, sqlite_id");
  if (ce) throw ce;
  const collectionMap = new Map(collections.map((c) => [c.sqlite_id, c.id]));

  const { data: sales, error: se } = await sb.from("store_sales").select("id, sqlite_id");
  if (se) throw se;
  const saleMap = new Map(sales.map((s) => [s.sqlite_id, s.id]));

  const allocations = db.prepare("select * from payment_allocations").all();

  const { data: existing, error: ee } = await sb.from("payment_allocations").select("collection_id, sale_id, amount");
  if (ee) throw ee;
  const existingKeys = new Set(existing.map((r) => `${r.collection_id}|${r.sale_id}|${r.amount}`));

  const rows = [];
  const skipped = [];
  for (const a of allocations) {
    const collectionId = collectionMap.get(a.collection_id);
    const saleId = saleMap.get(a.sale_id);
    if (!collectionId || !saleId) {
      skipped.push({ id: a.id, collection_id: a.collection_id, sale_id: a.sale_id, hasCollection: !!collectionId, hasSale: !!saleId });
      continue;
    }
    const key = `${collectionId}|${saleId}|${a.amount}`;
    if (existingKeys.has(key)) continue;
    rows.push({ collection_id: collectionId, sale_id: saleId, amount: a.amount });
  }

  console.log("SQLite toplam payment_allocations:", allocations.length);
  console.log("Eşleşmedi (atlandı):", skipped.length, skipped);
  console.log("Eklenecek yeni satır:", rows.length);

  if (rows.length) {
    const { error: insErr } = await sb.from("payment_allocations").insert(rows);
    if (insErr) throw insErr;
  }

  const { count } = await sb.from("payment_allocations").select("*", { count: "exact", head: true });
  console.log("payment_allocations toplam satır (sonrası):", count);

  const { data: sumRows, error: sme } = await sb.from("payment_allocations").select("amount");
  if (sme) throw sme;
  const sum = sumRows.reduce((a, r) => a + Number(r.amount), 0);
  console.log("Toplam allocation:", sum.toFixed(2));

  db.close();
}

main().catch((e) => {
  console.error("HATA:", e);
  process.exit(1);
});
