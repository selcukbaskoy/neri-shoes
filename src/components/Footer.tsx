import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import WhatsAppIcon from "./icons/WhatsAppIcon";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import InstagramIcon from "./icons/InstagramIcon";
import TiktokIcon from "./icons/TiktokIcon";

const INSTAGRAM_URL = "https://www.instagram.com/nerishoess/";
const TIKTOK_URL = "https://www.tiktok.com/@nerishoes.outlet";

export default function Footer({ whatsappNumber }: { whatsappNumber: string }) {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const ta = useTranslations("about");
  const tWa = useTranslations("whatsapp");
  const whatsappLink = buildWhatsAppLink(whatsappNumber, tWa("generalContact"));

  const links = [
    { href: "/", label: nav("home") },
    { href: "/urunler", label: nav("products") },
    { href: "/hakkimizda", label: nav("about") },
    { href: "/toptan", label: nav("wholesale") },
    { href: "/iletisim", label: nav("contact") },
  ];

  return (
    <footer className="relative bg-surface">
      {/* Gold gradient top border */}
      <div className="gold-divider" />

      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.jpeg"
                alt="Neri Shoes"
                width={44}
                height={44}
                className="h-11 w-11 rounded-md object-cover shadow-[0_0_12px_rgba(255,208,0,0.3)]"
              />
              <span className="font-serif text-lg font-bold tracking-[0.08em] text-accent">
                NERI SHOES
              </span>
            </Link>
            <p className="font-serif italic max-w-[240px] text-sm leading-relaxed text-accent/60">
              {t("tagline")}
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-fit"
            >
              <span className="btn-whatsapp-content">
                <WhatsAppIcon className="h-4 w-4" />
                {t("whatsapp")}
              </span>
            </a>
            <div className="flex items-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 text-accent/70 transition-all duration-300 hover:border-accent hover:text-accent hover:shadow-[0_0_12px_rgba(255,208,0,0.35)]"
              >
                <InstagramIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 text-accent/70 transition-all duration-300 hover:border-accent hover:text-accent hover:shadow-[0_0_12px_rgba(255,208,0,0.35)]"
              >
                <TiktokIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-normal uppercase tracking-[0.15em] text-accent/60">
              {t("navTitle")}
            </h3>
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted transition-colors duration-200 hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-normal uppercase tracking-[0.15em] text-accent/60">
              {t("legalTitle")}
            </h3>
            <nav className="flex flex-col gap-2">
              <Link href="/gizlilik-politikasi" className="text-sm text-muted transition-colors duration-200 hover:text-accent">
                {t("privacy")}
              </Link>
              <Link href="/kullanim-sartlari" className="text-sm text-muted transition-colors duration-200 hover:text-accent">
                {t("terms")}
              </Link>
              <Link href="/teslimat-ve-iade-sartlari" className="text-sm text-muted transition-colors duration-200 hover:text-accent">
                {t("delivery")}
              </Link>
              <Link href="/mesafeli-satis-sozlesmesi" className="text-sm text-muted transition-colors duration-200 hover:text-accent">
                {t("distanceSales")}
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-normal uppercase tracking-[0.15em] text-accent/60">
              {t("contactTitle")}
            </h3>
            <p className="text-xs uppercase tracking-wider text-accent/50">{ta("productionAddress")}</p>
            <p className="text-sm leading-relaxed text-muted">{ta("productionAddressText")}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-accent/50">{ta("salesAddress")}</p>
            <p className="text-sm leading-relaxed text-muted">{ta("salesAddressText")}</p>
          </div>
        </div>

        <div className="gold-divider mt-12" />

        {/* Ödeme logoları */}
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
          <span className="text-xs uppercase tracking-[0.12em] text-accent/40">{t("securePayment")}</span>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Image
              src="/payment-logos/logo_band_colored.svg"
              alt="Visa Mastercard"
              width={120}
              height={28}
              className="h-7 w-auto opacity-70"
            />
            <Image
              src="/payment-logos/iyzico_ile_ode_colored.svg"
              alt="iyzico ile öde"
              width={100}
              height={28}
              className="h-7 w-auto opacity-70"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted md:flex-row">
          <span>© {new Date().getFullYear()} Neri Shoes. {t("rights")}</span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/gizlilik-politikasi" className="transition-colors duration-200 hover:text-accent">
              {t("privacy")}
            </Link>
            <span className="text-muted/30">·</span>
            <Link href="/kullanim-sartlari" className="transition-colors duration-200 hover:text-accent">
              {t("terms")}
            </Link>
            <span className="text-muted/30">·</span>
            <Link href="/teslimat-ve-iade-sartlari" className="transition-colors duration-200 hover:text-accent">
              {t("delivery")}
            </Link>
            <span className="text-muted/30">·</span>
            <Link href="/mesafeli-satis-sozlesmesi" className="transition-colors duration-200 hover:text-accent">
              {t("distanceSales")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
