import { DatabaseSync } from "node:sqlite";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const SERVICE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const sb = createClient(SUPABASE_URL, SERVICE_KEY);
const db = new DatabaseSync("C:/Nerishoes/database.sqlite", { readOnly: true });

function ts(v) {
  if (!v) return null;
  const norm = v.includes("T") ? v : v.replace(" ", "T");
  return `${norm}+03:00`;
}
function dateOnly(v) {
  if (!v) return null;
  return v.slice(0, 10);
}

async function main() {
  const { data: customers, error: ce } = await sb.from("store_customers").select("id, sqlite_id");
  if (ce) throw ce;
  const customerMap = new Map(customers.map((c) => [c.sqlite_id, c.id]));

  const manualSales = db.prepare("select * from manual_report_sales").all();

  const { data: existing, error: ee } = await sb.from("manual_store_sales").select("sqlite_id");
  if (ee) throw ee;
  const existingIds = new Set(existing.map((r) => r.sqlite_id));

  const rows = [];
  for (const m of manualSales) {
    if (existingIds.has(m.id)) continue;
    const customerId = m.customer_id ? customerMap.get(m.customer_id) ?? null : null;
    rows.push({
      customer_id: customerId,
      sale_date: dateOnly(m.sale_date),
      product_description: m.product_description,
      quantity: m.quantity,
      payment_method: m.payment_method,
      discount_amount: m.discount_amount,
      total_amount: m.total_amount,
      note: m.note,
      created_by: "migration:sqlite",
      created_at: ts(m.created_at),
      sqlite_id: m.id,
    });
  }

  console.log("SQLite toplam manual_report_sales:", manualSales.length);
  console.log("Zaten var (atlandı):", manualSales.length - rows.length);
  console.log("Eklenecek yeni satır:", rows.length);

  if (rows.length) {
    const { error: insErr } = await sb.from("manual_store_sales").insert(rows);
    if (insErr) throw insErr;
  }

  const { count } = await sb.from("manual_store_sales").select("*", { count: "exact", head: true });
  console.log("manual_store_sales toplam satır (sonrası):", count);

  const { data: sumRows, error: se } = await sb.from("manual_store_sales").select("total_amount");
  if (se) throw se;
  const sum = sumRows.reduce((a, r) => a + Number(r.total_amount), 0);
  console.log("Toplam manual satış:", sum.toFixed(2));

  db.close();
}

main().catch((e) => {
  console.error("HATA:", e);
  process.exit(1);
});
