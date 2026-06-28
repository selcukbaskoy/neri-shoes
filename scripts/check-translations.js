const fs = require("fs");
const path = require("path");

const messagesDir = path.join("C:\\Users\\selcu\\Desktop\\NeriSohes.com", "messages");
const locales = ["tr", "en", "de", "it", "ar", "ru"];

// Flat-map tüm keyleri al (namespace.key formatında)
function flatKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null) {
      keys.push(...flatKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

// Nested objeye key set et
function setNestedKey(obj, keyPath, value) {
  const parts = keyPath.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== "object") {
      cur[parts[i]] = {};
    }
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

// Nested objedan key al
function getNestedKey(obj, keyPath) {
  const parts = keyPath.split(".");
  let cur = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

const base = JSON.parse(fs.readFileSync(path.join(messagesDir, "tr.json"), "utf-8"));
const baseKeys = flatKeys(base);

let totalMissing = 0;

for (const locale of locales) {
  if (locale === "tr") continue;
  const filePath = path.join(messagesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const dataKeys = flatKeys(data);

  const missing = baseKeys.filter((k) => !dataKeys.includes(k));
  if (missing.length === 0) {
    console.log(`✓ ${locale}.json — eksik key yok`);
    continue;
  }

  console.log(`⚠ ${locale}.json — ${missing.length} eksik key:`);
  for (const key of missing) {
    const trValue = getNestedKey(base, key);
    console.log(`  + ${key} = "${trValue}"`);
    setNestedKey(data, key, trValue); // TR değeriyle doldur (fallback)
    totalMissing++;
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  → ${locale}.json güncellendi\n`);
}

if (totalMissing === 0) {
  console.log("\n✅ Tüm dil dosyaları senkronize.");
} else {
  console.log(`\n✅ ${totalMissing} eksik key TR fallback değeriyle dolduruldu.`);
}
