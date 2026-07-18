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

  const { data: idMap, error: ie } = await sb.from("sqlite_id_map").select("sqlite_product_id, supabase_product_id");
  if (ie) throw ie;
  const productIdMap = new Map(idMap.map((r) => [r.sqlite_product_id, r.supabase_product_id]));

  const sqliteProducts = db.prepare("select id, model_name, color, size from products").all();
  const productNameById = new Map(sqliteProducts.map((p) => [p.id, p]));

  const sales = db.prepare("select * from sales").all();

  const { data: existing, error: ee } = await sb.from("store_sales").select("sqlite_id");
  if (ee) throw ee;
  const existingIds = new Set(existing.map((r) => r.sqlite_id));

  const rows = [];
  const skippedNoCustomer = [];
  for (const s of sales) {
    if (existingIds.has(s.id)) continue;
    const customerId = customerMap.get(s.customer_id);
    if (!customerId) {
      skippedNoCustomer.push(s.id);
      continue;
    }
    const prod = productNameById.get(s.product_id);
    const mapped = productIdMap.has(s.product_id);
    let note = s.note || "";
    if (!mapped) {
      const tag = prod
        ? `[Ürün-SQLite: ${prod.model_name} / ${prod.color} / no ${prod.size}]`
        : `[Ürün-SQLite kaydı silinmiş: product_id ${s.product_id}]`;
      note = note ? `${note} ${tag}` : tag;
    }
    rows.push({
      customer_id: customerId,
      payment_method: s.payment_method,
      discount_amount: s.discount_amount,
      total_price: s.total_price,
      note: note || null,
      is_paid: !!s.is_paid,
      amount_paid: s.amount_paid,
      paid_at: ts(s.paid_at),
      promised_pay_at: dateOnly(s.promised_pay_at),
      sale_unreachable: !!s.sale_unreachable,
      is_reversed: !!s.is_reversed,
      reversed_at: ts(s.reversed_at),
      correction_note: s.correction_note,
      is_legacy: true,
      sold_at: ts(s.sold_at),
      sqlite_id: s.id,
    });
  }

  console.log("SQLite toplam sales:", sales.length);
  console.log("Zaten var (atlandı):", sales.length - rows.length - skippedNoCustomer.length);
  console.log("Müşteri eşleşmedi (atlandı):", skippedNoCustomer.length, skippedNoCustomer);
  console.log("Eklenecek yeni satır:", rows.length);

  if (rows.length) {
    const { error: insErr } = await sb.from("store_sales").insert(rows);
    if (insErr) throw insErr;
  }

  const { count } = await sb.from("store_sales").select("*", { count: "exact", head: true });
  console.log("store_sales toplam satır (sonrası):", count);

  const { data: sumRows, error: se } = await sb
    .from("store_sales")
    .select("total_price, is_reversed");
  if (se) throw se;
  const nonReversedSum = sumRows.filter((r) => !r.is_reversed).reduce((a, r) => a + Number(r.total_price), 0);
  console.log("Non-reversed ciro toplamı:", nonReversedSum.toFixed(2));

  db.close();
}

main().catch((e) => {
  console.error("HATA:", e);
  process.exit(1);
});
