import { DatabaseSync } from "node:sqlite";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const SERVICE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const sb = createClient(SUPABASE_URL, SERVICE_KEY);
const db = new DatabaseSync("C:/Nerishoes/database.sqlite", { readOnly: true });

async function count(table, filterFn) {
  let q = sb.from(table).select("*", { count: "exact", head: true });
  if (filterFn) q = filterFn(q);
  const { count: c, error } = await q;
  if (error) throw error;
  return c;
}

async function main() {
  const out = {};

  out.sqlite_id_map = { sqlite: db.prepare("select count(*) c from products").get().c, supabase: await count("sqlite_id_map") };

  out.store_customers = { sqlite: db.prepare("select count(*) c from customers").get().c, supabase: await count("store_customers") };

  out.sales_total = { sqlite: db.prepare("select count(*) c from sales").get().c, supabase: await count("store_sales") };

  const sqliteNonReversed = db.prepare("select count(*) c from sales where is_reversed = 0 or is_reversed is null").get().c;
  const sbNonReversed = await count("store_sales", (q) => q.eq("is_reversed", false));
  out.sales_non_reversed = { sqlite: sqliteNonReversed, supabase: sbNonReversed };

  const sqliteCiro = db.prepare("select sum(total_price) s from sales where is_reversed = 0 or is_reversed is null").get().s;
  const { data: sbSalesAll, error: e2 } = await sb.from("store_sales").select("total_price, is_reversed");
  if (e2) throw e2;
  const sbCiro = sbSalesAll.filter((r) => !r.is_reversed).reduce((a, r) => a + Number(r.total_price || 0), 0);
  out.ciro = { sqlite: sqliteCiro, supabase: sbCiro };

  out.credit_collections_count = { sqlite: db.prepare("select count(*) c from credit_collections").get().c, supabase: await count("credit_collections") };
  const sqliteCCSum = db.prepare("select sum(amount) s from credit_collections").get().s;
  const { data: sbCC, error: e3 } = await sb.from("credit_collections").select("amount");
  if (e3) throw e3;
  const sbCCSum = sbCC.reduce((a, r) => a + Number(r.amount || 0), 0);
  out.credit_collections_sum = { sqlite: sqliteCCSum, supabase: sbCCSum };

  out.payment_allocations_count = { sqlite: db.prepare("select count(*) c from payment_allocations").get().c, supabase: await count("payment_allocations") };
  const sqlitePASum = db.prepare("select sum(amount) s from payment_allocations").get().s;
  const { data: sbPA, error: e4 } = await sb.from("payment_allocations").select("amount");
  if (e4) throw e4;
  const sbPASum = sbPA.reduce((a, r) => a + Number(r.amount || 0), 0);
  out.payment_allocations_sum = { sqlite: sqlitePASum, supabase: sbPASum };

  out.manual_report_sales_count = { sqlite: db.prepare("select count(*) c from manual_report_sales").get().c, supabase: await count("manual_store_sales") };
  const sqliteMRSSum = db.prepare("select sum(total_amount) s from manual_report_sales").get().s;
  const { data: sbMRS, error: e5 } = await sb.from("manual_store_sales").select("total_amount");
  if (e5) throw e5;
  const sbMRSSum = sbMRS.reduce((a, r) => a + Number(r.total_amount || 0), 0);
  out.manual_report_sales_sum = { sqlite: sqliteMRSSum, supabase: sbMRSSum };

  out.returns = {
    sqlite: db.prepare("select count(*) c from returns").get().c,
    supabase: await count("store_audit_log", (q) => q.eq("action", "return_migrated_from_sqlite")),
  };

  out.sale_items_count = { sqlite: db.prepare("select count(*) c from sales").get().c, supabase: await count("store_sale_items") };
  const sqliteQtySum = db.prepare("select sum(quantity) s from sales").get().s;
  const { data: sbItems, error: e6 } = await sb.from("store_sale_items").select("quantity");
  if (e6) throw e6;
  const sbQtySum = sbItems.reduce((a, r) => a + Number(r.quantity || 0), 0);
  out.sale_items_qty_sum = { sqlite: sqliteQtySum, supabase: sbQtySum };

  console.log(JSON.stringify(out, null, 2));
  db.close();
}

main().catch((e) => {
  console.error("HATA:", e.message || e);
  process.exit(1);
});
