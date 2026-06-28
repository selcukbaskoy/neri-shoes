import type { LegalDocument } from "@/content/legal/tr";

type Props = {
  document: LegalDocument;
  locale: string;
};

export default function LegalPageContent({ document: doc }: Props) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24 lg:flex lg:gap-12">
        {/* Sticky TOC — sadece lg+ ekranlarda görünür */}
        <aside className="hidden lg:block lg:w-56 xl:w-64 shrink-0">
          <div className="sticky top-24">
            <p className="mb-4 text-xs font-normal uppercase tracking-[0.15em] text-accent/50">
              İçindekiler
            </p>
            <nav className="flex flex-col gap-1.5">
              {doc.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-sm text-muted transition-colors duration-200 hover:text-accent leading-snug"
                >
                  {section.heading}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Ana içerik */}
        <article className="max-w-3xl flex-1">
          {/* Sayfa başlığı */}
          <h1 className="font-serif text-3xl font-bold tracking-tight text-accent md:text-4xl">
            {doc.pageTitle}
          </h1>

          <p className="mt-2 text-xs text-muted/60 uppercase tracking-wider">
            Son güncelleme: {doc.lastUpdated}
          </p>

          <div className="gold-divider mt-6 mb-10" />

          {/* Bölümler */}
          <div className="flex flex-col gap-10">
            {doc.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="font-serif text-lg font-semibold text-accent mb-4">
                  {section.heading}
                </h2>

                {Array.isArray(section.body) ? (
                  <div className="flex flex-col gap-2">
                    {section.body.map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-sm leading-relaxed text-muted"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-muted">{section.body}</p>
                )}
              </section>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="gold-divider mt-12 mb-6" />
          <p className="text-xs italic leading-relaxed text-muted/50">
            {doc.disclaimer}
          </p>
        </article>
      </div>
    </div>
  );
}
