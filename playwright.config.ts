import { defineConfig, devices } from "@playwright/test";
import path from "path";

// .env.local'dan çevre değişkenlerini yükle
import { config as loadEnv } from "dotenv";
loadEnv({ path: path.resolve(__dirname, ".env.local") });

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // E2E DB testleri sıralı çalışmalı
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
  ],

  // Dev sunucusu zaten çalışıyorsa yeniden kullan, yoksa başlat
  webServer: {
    command: "npx next dev",
    url: `${BASE_URL}/tr`,
    reuseExistingServer: true,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
