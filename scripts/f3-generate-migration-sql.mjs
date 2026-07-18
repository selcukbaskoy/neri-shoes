// F3 — SQLite finansal/işlemsel geçmişini Supabase'e taşıyacak SQL üretir.
// Yazma YAPMAZ — sadece C:\Nerishoes\database.sqlite'ı okur, 9 ayrı .sql dosyası yazar
// (her biri bağımsız, idempotent, tek başına çalıştırılabilir — temp table/tek-transaction
// YOK çünkü execute_sql her çağrıda ayrı bağlantı açıyor, oturum durumu paylaşılmıyor).
import { DatabaseSync } from "node:sqlite";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";

const OUT_DIR =
  "C:/Users/selcu/AppData/Local/Temp/claude/C--Users-selcu-Desktop-NeriSohes-com/ac25d054-87cf-489a-9fa3-a62c5362831f/scratchpad";

const db = new DatabaseSync("C:/Nerishoes/database.sqlite", { readOnly: true });

async function all(sql) {
  return db.prepare(sql).all();
}

function esc(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return `'${String(v).replace(/'/g, "''")}'`;
}

// SQLite datetime -> Postgres timestamptz literal (Turkey = UTC+3, no DST)
function ts(v) {
  if (!v) return "NULL";
  const norm = v.includes("T") ? v : v.replace(" ", "T");
  return `'${norm}+03:00'`;
}

function dateOnly(v) {
  if (!v) return "NULL";
  return `'${v.slice(0, 10)}'`;
}

function bool(v) {
  return v ? "true" : "false";
}

function writeSection(n, name, sql) {
  const path = `${OUT_DIR}/f3-${String(n).padStart(2, "0")}-${name}.sql`;
  writeFileSync(path, sql, "utf-8");
  console.error(`yazıldı: ${path} (${sql.length} byte)`);
}

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const SERVICE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  const [sqliteProducts, sbProducts] = await Promise.all([
    all(
      "select id, model_name, color, size, image_path from products where model_name not like '[ARSIV]%'"
    ),
    sb.from("products").select("id, slug, image, images").then((r) => {
      if (r.error) throw r.error;
      return r.data;
    }),
  ]);

  const byPath = new Map();
  for (const p of sbProducts) {
    const imgs = [p.image, ...(p.images || [])].filter(Boolean);
    for (const img of imgs) byPath.set(img, p.id);
    byPath.set(`/products/${p.slug}/img1.png`, p.id);
  }

  const idMapRows = [];
  const unmatchedGroups = new Set();
  for (const row of sqliteProducts) {
    const supaId = byPath.get(row.image_path);
    if (supaId) {
      idMapRows.push({ sqlite_product_id: row.id, supabase_product_id: supaId, size: row.size });
    } else {
      unmatchedGroups.add(`${row.model_name}||${row.color}||${row.image_path}`);
    }
  }
  if (unmatchedGroups.size) {
    console.error("UYARI — eşleşmeyen (non-archived) ürün grupları:", [...unmatchedGroups]);
  }

  const productIdMap = new Map(idMapRows.map((r) => [r.sqlite_product_id, r]));

  const [customers, sales, collections, allocations, manualSales, sqliteProductsAll, returns] =
    await Promise.all([
      all("select * from customers"),
      all("select * from sales"),
      all("select * from credit_collections"),
      all("select * from payment_allocations"),
      all("select * from manual_report_sales"),
      all("select id, model_name, color, size from products"),
      all("select * from returns"),
    ]);

  const productNameById = new Map(sqliteProductsAll.map((p) => [p.id, p]));

  // ── 1. sqlite_id_map ──────────────────────────────────────────────────
  {
    const lines = [];
    lines.push("insert into public.sqlite_id_map (sqlite_product_id, supabase_product_id, size) values");
    lines.push(
      idMapRows
        .map((r) => `(${r.sqlite_product_id}, ${esc(r.supabase_product_id)}, ${r.size})`)
        .join(",\n") + "\non conflict (sqlite_product_id) do nothing;"
    );
    writeSection(1, "id_map", lines.join("\n") + "\n");
  }

  // ── 2. store_customers ───────────────────────────────────────────────
  {
    const lines = [];
    lines.push("insert into public.store_customers (name, phone, credit_limit, sqlite_id, created_at) values");
    lines.push(
      customers
        .map(
          (c) =>
            `(${esc(c.name)}, ${esc(c.phone)}, ${c.credit_limit}, ${c.id}, ${ts(c.created_at)})`
        )
        .join(",\n")
    );
    lines.push("on conflict (sqlite_id) where sqlite_id is not null do update set name = excluded.name;");
    writeSection(2, "customers", lines.join("\n") + "\n");
  }

  // ── 3. store_sales ───────────────────────────────────────────────────
  {
    const lines = [];
    lines.push(
      "with v(sqlite_id, sqlite_customer_id, payment_method, discount_amount, total_price, note, is_paid, amount_paid, paid_at, promised_pay_at, sale_unreachable, is_reversed, reversed_at, correction_note, sold_at) as ("
    );
    lines.push("values");
    lines.push(
      sales
        .map((s) => {
          const prod = productNameById.get(s.product_id);
          const mapped = productIdMap.get(s.product_id);
          let note = s.note || "";
          if (!mapped) {
            const tag = prod
              ? `[Ürün-SQLite: ${prod.model_name} / ${prod.color} / no ${prod.size}]`
              : `[Ürün-SQLite kaydı silinmiş: product_id ${s.product_id}]`;
            note = note ? `${note} ${tag}` : tag;
          }
          return `(${s.id}, ${s.customer_id}, ${esc(s.payment_method)}, ${s.discount_amount}, ${s.total_price}, ${esc(note || null)}, ${bool(s.is_paid)}, ${s.amount_paid}, ${ts(s.paid_at)}, ${dateOnly(s.promised_pay_at)}, ${bool(s.sale_unreachable)}, ${bool(s.is_reversed)}, ${ts(s.reversed_at)}, ${esc(s.correction_note)}, ${ts(s.sold_at)})`;
        })
        .join(",\n")
    );
    lines.push(")");
    lines.push(
      "insert into public.store_sales (customer_id, payment_method, discount_amount, total_price, note, is_paid, amount_paid, paid_at, promised_pay_at, sale_unreachable, is_reversed, reversed_at, correction_note, is_legacy, sold_at, sqlite_id)"
    );
    lines.push(
      "select cm.id, v.payment_method, v.discount_amount, v.total_price, v.note, v.is_paid, v.amount_paid, v.paid_at, v.promised_pay_at, v.sale_unreachable, v.is_reversed, v.reversed_at, v.correction_note, true, v.sold_at, v.sqlite_id"
    );
    lines.push("from v join public.store_customers cm on cm.sqlite_id = v.sqlite_customer_id");
    lines.push(
      "on conflict (sqlite_id) where sqlite_id is not null do update set note = excluded.note;"
    );
    writeSection(3, "sales", lines.join("\n") + "\n");
  }

  // ── 4. store_sale_items ──────────────────────────────────────────────
  {
    const lines = [];
    lines.push("with v(sqlite_id, sqlite_product_id, size, quantity, unit_price, returned_quantity) as (");
    lines.push("values");
    lines.push(
      sales
        .map(
          (s) =>
            `(${s.id}, ${s.product_id}, ${productNameById.get(s.product_id)?.size ?? "NULL"}, ${s.quantity}, ${s.unit_price}, ${s.returned_quantity})`
        )
        .join(",\n")
    );
    lines.push(")");
    lines.push(
      "insert into public.store_sale_items (sale_id, product_id, size, quantity, unit_price, returned_quantity)"
    );
    lines.push(
      "select ss.id, sim.supabase_product_id, v.size, v.quantity, v.unit_price, v.returned_quantity"
    );
    lines.push("from v");
    lines.push("join public.store_sales ss on ss.sqlite_id = v.sqlite_id");
    lines.push("left join public.sqlite_id_map sim on sim.sqlite_product_id = v.sqlite_product_id");
    lines.push(
      "where not exists (select 1 from public.store_sale_items existing where existing.sale_id = ss.id);"
    );
    writeSection(4, "sale_items", lines.join("\n") + "\n");
  }

  // ── 5. credit_collections ────────────────────────────────────────────
  {
    const lines = [];
    lines.push("with v(sqlite_id, sqlite_customer_id, amount, payment_method, collected_at, note) as (");
    lines.push("values");
    lines.push(
      collections
        .map(
          (c) =>
            `(${c.id}, ${c.customer_id}, ${c.amount}, ${esc(c.payment_method)}, ${ts(c.collected_at)}, ${esc(c.note)})`
        )
        .join(",\n")
    );
    lines.push(")");
    lines.push(
      "insert into public.credit_collections (customer_id, amount, payment_method, collected_at, note, sqlite_id)"
    );
    lines.push("select cm.id, v.amount, v.payment_method, v.collected_at, v.note, v.sqlite_id");
    lines.push("from v join public.store_customers cm on cm.sqlite_id = v.sqlite_customer_id");
    lines.push(
      "on conflict (sqlite_id) where sqlite_id is not null do update set note = excluded.note;"
    );
    writeSection(5, "collections", lines.join("\n") + "\n");
  }

  // ── 6. payment_allocations ───────────────────────────────────────────
  {
    const lines = [];
    lines.push("with v(sqlite_collection_id, sqlite_sale_id, amount) as (");
    lines.push("values");
    lines.push(allocations.map((a) => `(${a.collection_id}, ${a.sale_id}, ${a.amount})`).join(",\n"));
    lines.push(")");
    lines.push("insert into public.payment_allocations (collection_id, sale_id, amount)");
    lines.push("select cm.id, sm.id, v.amount");
    lines.push("from v");
    lines.push("join public.credit_collections cm on cm.sqlite_id = v.sqlite_collection_id");
    lines.push("join public.store_sales sm on sm.sqlite_id = v.sqlite_sale_id");
    lines.push(
      "where not exists (select 1 from public.payment_allocations pa2 where pa2.collection_id = cm.id and pa2.sale_id = sm.id and pa2.amount = v.amount);"
    );
    writeSection(6, "allocations", lines.join("\n") + "\n");
  }

  // ── 7. manual_store_sales ────────────────────────────────────────────
  {
    const lines = [];
    lines.push(
      "with v(sqlite_id, sqlite_customer_id, sale_date, product_description, quantity, payment_method, discount_amount, total_amount, note, created_at) as ("
    );
    lines.push("values");
    lines.push(
      manualSales
        .map(
          (m) =>
            `(${m.id}, ${m.customer_id ?? "NULL"}, ${dateOnly(m.sale_date)}, ${esc(m.product_description)}, ${m.quantity}, ${esc(m.payment_method)}, ${m.discount_amount}, ${m.total_amount}, ${esc(m.note)}, ${ts(m.created_at)})`
        )
        .join(",\n")
    );
    lines.push(")");
    lines.push(
      "insert into public.manual_store_sales (customer_id, sale_date, product_description, quantity, payment_method, discount_amount, total_amount, note, created_by, created_at, sqlite_id)"
    );
    lines.push(
      "select cm.id, v.sale_date, v.product_description, v.quantity, v.payment_method, v.discount_amount, v.total_amount, v.note, 'migration:sqlite', v.created_at, v.sqlite_id"
    );
    lines.push("from v left join public.store_customers cm on cm.sqlite_id = v.sqlite_customer_id");
    lines.push(
      "on conflict (sqlite_id) where sqlite_id is not null do update set note = excluded.note;"
    );
    writeSection(7, "manual_sales", lines.join("\n") + "\n");
  }

  // ── 8. returns → store_audit_log ─────────────────────────────────────
  if (returns.length) {
    const lines = [];
    lines.push(
      "with v(sqlite_sale_id, sqlite_product_id, quantity, unit_price, refund_amount, reason, note, returned_at) as ("
    );
    lines.push("values");
    lines.push(
      returns
        .map(
          (r) =>
            `(${r.sale_id}, ${r.product_id}, ${r.quantity}, ${r.unit_price}, ${r.refund_amount}, ${esc(r.reason)}, ${esc(r.note)}, ${ts(r.returned_at)})`
        )
        .join(",\n")
    );
    lines.push(")");
    lines.push("insert into public.store_audit_log (actor, action, payload)");
    lines.push("select 'migration:sqlite', 'return_migrated_from_sqlite', jsonb_build_object(");
    lines.push("  'sale_id', sm.id,");
    lines.push("  'sqlite_sale_id', v.sqlite_sale_id,");
    lines.push("  'sqlite_product_id', v.sqlite_product_id,");
    lines.push("  'quantity', v.quantity,");
    lines.push("  'unit_price', v.unit_price,");
    lines.push("  'refund_amount', v.refund_amount,");
    lines.push("  'reason', v.reason,");
    lines.push("  'note', v.note,");
    lines.push("  'returned_at', v.returned_at");
    lines.push(")");
    lines.push("from v join public.store_sales sm on sm.sqlite_id = v.sqlite_sale_id");
    lines.push(
      "where not exists (select 1 from public.store_audit_log existing where existing.action = 'return_migrated_from_sqlite' and (existing.payload->>'sqlite_sale_id')::int = v.sqlite_sale_id);"
    );
    writeSection(8, "returns", lines.join("\n") + "\n");
  }

  // Dry-run özet raporu (stderr)
  const nonReversedSales = sales.filter((s) => !s.is_reversed);
  console.error("\n=== KAYNAK (SQLite) ÖZET ===");
  console.error("customers:", customers.length);
  console.error("sales (toplam):", sales.length, "| reversed:", sales.length - nonReversedSales.length);
  console.error(
    "sales toplam ciro (non-reversed sum total_price):",
    nonReversedSales.reduce((a, s) => a + s.total_price, 0).toFixed(2)
  );
  console.error("credit_collections:", collections.length, "| sum:", collections.reduce((a, c) => a + c.amount, 0).toFixed(2));
  console.error("payment_allocations:", allocations.length, "| sum:", allocations.reduce((a, c) => a + c.amount, 0).toFixed(2));
  console.error("manual_report_sales:", manualSales.length, "| sum total_amount:", manualSales.reduce((a, m) => a + m.total_amount, 0).toFixed(2));
  console.error("returns:", returns.length);
  console.error("sqlite_id_map satır (eşleşen):", idMapRows.length, "| eşleşmeyen grup:", unmatchedGroups.size);
  const mappedSales = sales.filter((s) => productIdMap.has(s.product_id)).length;
  console.error("product_id eşleşen satış satırı:", mappedSales, "/", sales.length);

  db.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
