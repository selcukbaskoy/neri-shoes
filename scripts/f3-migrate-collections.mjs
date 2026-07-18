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

async function main() {
  const { data: customers, error: ce } = await sb.from("store_customers").select("id, sqlite_id");
  if (ce) throw ce;
  const customerMap = new Map(customers.map((c) => [c.sqlite_id, c.id]));

  const collections = db.prepare("select * from credit_collections").all();

  const { data: existing, error: ee } = await sb.from("credit_collections").select("sqlite_id");
  if (ee) throw ee;
  const existingIds = new Set(existing.map((r) => r.sqlite_id));

  const rows = [];
  const skippedNoCustomer = [];
  for (const c of collections) {
    if (existingIds.has(c.id)) continue;
    const customerId = customerMap.get(c.customer_id);
    if (!customerId) {
      skippedNoCustomer.push(c.id);
      continue;
    }
    rows.push({
      customer_id: customerId,
      amount: c.amount,
      payment_method: c.payment_method,
      collected_at: ts(c.collected_at),
      note: c.note,
      sqlite_id: c.id,
    });
  }

  console.log("SQLite toplam credit_collections:", collections.length);
  console.log("Zaten var (atlandı):", collections.length - rows.length - skippedNoCustomer.length);
  console.log("Müşteri eşleşmedi (atlandı):", skippedNoCustomer.length, skippedNoCustomer);
  console.log("Eklenecek yeni satır:", rows.length);

  if (rows.length) {
    const { error: insErr } = await sb.from("credit_collections").insert(rows);
    if (insErr) throw insErr;
  }

  const { count } = await sb.from("credit_collections").select("*", { count: "exact", head: true });
  console.log("credit_collections toplam satır (sonrası):", count);

  const { data: sumRows, error: se } = await sb.from("credit_collections").select("amount");
  if (se) throw se;
  const sum = sumRows.reduce((a, r) => a + Number(r.amount), 0);
  console.log("Toplam tahsilat:", sum.toFixed(2));

  db.close();
}

main().catch((e) => {
  console.error("HATA:", e);
  process.exit(1);
});
