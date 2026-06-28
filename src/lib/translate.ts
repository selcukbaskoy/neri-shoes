const LANGS = ["en", "de", "it", "ar", "ru"] as const;

export type ContentBlock = {
  shortDescription: string;
  description: string;
  features: string[];
  styling: string[];
};

// MyMemory free API — no key required, 5000 words/day
async function tr(text: string, to: string): Promise<string> {
  if (!text.trim()) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=tr|${to}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    return text;
  } catch {
    return text;
  }
}

export async function translateProductContent(
  trContent: ContentBlock
): Promise<Record<string, ContentBlock>> {
  const result: Record<string, ContentBlock> = { tr: trContent };

  await Promise.all(
    LANGS.map(async (lang) => {
      try {
        const [shortDescription, description] = await Promise.all([
          tr(trContent.shortDescription, lang),
          tr(trContent.description, lang),
        ]);
        const features = await Promise.all(trContent.features.map((f) => tr(f, lang)));
        const styling = await Promise.all(trContent.styling.map((s) => tr(s, lang)));
        result[lang] = { shortDescription, description, features, styling };
      } catch {
        result[lang] = { ...trContent };
      }
    })
  );

  return result;
}

export type BlogContentBlock = {
  title: string;
  body: string;
  excerpt: string;
};

export async function translateBlogContent(
  trContent: BlogContentBlock
): Promise<Record<string, BlogContentBlock>> {
  const result: Record<string, BlogContentBlock> = { tr: trContent };

  await Promise.all(
    LANGS.map(async (lang) => {
      try {
        const [title, excerpt] = await Promise.all([
          tr(trContent.title, lang),
          tr(trContent.excerpt, lang),
        ]);
        // Body may be long — translate in chunks of ~400 chars to stay under MyMemory limit
        const bodyChunks = splitIntoChunks(trContent.body, 400);
        const translatedChunks = await Promise.all(bodyChunks.map((c) => tr(c, lang)));
        result[lang] = { title, body: translatedChunks.join(" "), excerpt };
      } catch {
        result[lang] = { ...trContent };
      }
    })
  );

  return result;
}

function splitIntoChunks(text: string, maxLen: number): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + " " + s).length > maxLen && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current = current ? current + " " + s : s;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks.length ? chunks : [text];
}

export async function translateBlogMeta(
  trTitle: string,
  trExcerpt: string
): Promise<{ metaTitle: Record<string, string>; metaDescription: Record<string, string> }> {
  const metaTitle: Record<string, string> = { tr: `${trTitle} | Neri Shoes Blog` };
  const metaDescription: Record<string, string> = { tr: trExcerpt.slice(0, 155) };

  await Promise.all(
    LANGS.map(async (lang) => {
      try {
        const [tTitle, tExcerpt] = await Promise.all([tr(trTitle, lang), tr(trExcerpt, lang)]);
        metaTitle[lang] = `${tTitle} | Neri Shoes Blog`;
        metaDescription[lang] = tExcerpt.slice(0, 155);
      } catch {
        metaTitle[lang] = metaTitle["tr"];
        metaDescription[lang] = metaDescription["tr"];
      }
    })
  );

  return { metaTitle, metaDescription };
}

const META_SUFFIX: Record<string, string> = {
  en: "Men's Shoes | Neri Shoes",
  de: "Herrenschuhe | Neri Shoes",
  it: "Scarpe Uomo | Neri Shoes",
  ar: "أحذية رجالية | Neri Shoes",
  ru: "Мужская обувь | Neri Shoes",
};

export async function translateMeta(
  name: string,
  shortDescription: string
): Promise<{ metaTitle: Record<string, string>; metaDescription: Record<string, string> }> {
  const base = shortDescription || name;
  const metaTitle: Record<string, string> = { tr: `${name} Erkek Ayakkabı | Neri Shoes` };
  const metaDescription: Record<string, string> = {
    tr: `${base} | Neri Shoes erkek ayakkabı koleksiyonu.`.slice(0, 155),
  };

  await Promise.all(
    LANGS.map(async (lang) => {
      try {
        const [tName, tDesc] = await Promise.all([tr(name, lang), tr(base, lang)]);
        metaTitle[lang] = `${tName} ${META_SUFFIX[lang]}`;
        metaDescription[lang] = `${tDesc} | Neri Shoes.`.slice(0, 155);
      } catch {
        metaTitle[lang] = metaTitle["tr"];
        metaDescription[lang] = metaDescription["tr"];
      }
    })
  );

  return { metaTitle, metaDescription };
}
