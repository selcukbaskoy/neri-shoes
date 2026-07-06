"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "@/i18n/navigation";

const ITEMS = [
  { href: "/hesap", key: "orders" as const },
  { href: "/hesap/adresler", key: "addresses" as const },
  { href: "/hesap/bilgiler", key: "profile" as const },
] as const;

export default function AccountNav({ locale }: { locale: string }) {
  const t = useTranslations("account.nav");
  const tAuth = useTranslations("auth");
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="flex flex-row gap-1 lg:flex-col">
      {ITEMS.map(({ href, key }) => {
        const active = pathname === href || (href !== "/hesap" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`rounded px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-accent/10 text-accent"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            {t(key)}
          </Link>
        );
      })}
      <button
        onClick={handleSignOut}
        className="mt-4 rounded px-3 py-2.5 text-left text-sm text-white/30 transition-colors hover:bg-white/5 hover:text-white/60 lg:mt-8"
      >
        {tAuth("logout")}
      </button>
    </nav>
  );
}
