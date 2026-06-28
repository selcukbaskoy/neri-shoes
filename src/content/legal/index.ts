import type { LegalDocument } from "./tr";

type DocumentKey = "privacy" | "terms" | "delivery" | "distance-sales";

type LocaleContent = {
  privacyPolicy: LegalDocument;
  termsOfService: LegalDocument;
  deliveryPolicy?: LegalDocument;
  distanceSalesContract?: LegalDocument;
};

async function loadLocaleContent(locale: string): Promise<LocaleContent | null> {
  try {
    const mod = await import(`./${locale}`);
    if (mod.privacyPolicy && mod.termsOfService) return mod as LocaleContent;
    return null;
  } catch {
    return null;
  }
}

export async function getLegalContent(
  locale: string,
  document: DocumentKey
): Promise<LegalDocument> {
  const [content, tr] = await Promise.all([
    loadLocaleContent(locale),
    import("./tr"),
  ]);
  const source = content ?? tr;

  switch (document) {
    case "privacy": return source.privacyPolicy;
    case "terms": return source.termsOfService;
    case "delivery": return (source.deliveryPolicy ?? tr.deliveryPolicy) as LegalDocument;
    case "distance-sales": return (source.distanceSalesContract ?? tr.distanceSalesContract) as LegalDocument;
  }
}
