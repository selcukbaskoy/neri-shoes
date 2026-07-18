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
  const { data: sales, error: se } = await sb.from("store_sales").select("id, sqlite_id");
  if (se) throw se;
  const saleMap = new Map(sales.map((s) => [s.sqlite_id, s.id]));

  const returns = db.prepare("select * from returns").all();

  const { data: existing, error: ee } = await sb
    .from("store_audit_log")
    .select("payload")
    .eq("action", "return_migrated_from_sqlite");
  if (ee) throw ee;
  const existingSaleIds = new Set(existing.map((r) => r.payload?.sqlite_sale_id));

  const rows = [];
  const skipped = [];
  for (const r of returns) {
    if (existingSaleIds.has(r.sale_id)) continue;
    const saleId = saleMap.get(r.sale_id);
    if (!saleId) {
      skipped.push(r.id);
      continue;
    }
    rows.push({
      actor: "migration:sqlite",
      action: "return_migrated_from_sqlite",
      payload: {
        sale_id: saleId,
        sqlite_sale_id: r.sale_id,
        sqlite_product_id: r.product_id,
        quantity: r.quantity,
        unit_price: r.unit_price,
        refund_amount: r.refund_amount,
        reason: r.reason,
        note: r.note,
        returned_at: ts(r.returned_at),
      },
    });
  }

  console.log("SQLite toplam returns:", returns.length);
  console.log("Satış eşleşmedi (atlandı):", skipped.length, skipped);
  console.log("Eklenecek yeni satır:", rows.length);

  if (rows.length) {
    const { error: insErr } = await sb.from("store_audit_log").insert(rows);
    if (insErr) throw insErr;
  }

  const { count } = await sb
    .from("store_audit_log")
    .select("*", { count: "exact", head: true })
    .eq("action", "return_migrated_from_sqlite");
  console.log("store_audit_log (return_migrated_from_sqlite) toplam satır (sonrası):", count);

  db.close();
}

main().catch((e) => {
  console.error("HATA:", e);
  process.exit(1);
});
