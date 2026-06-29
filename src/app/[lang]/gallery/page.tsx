import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { galleryPageImages } from "@/lib/data";
import GalleryGrid from "@/components/GalleryGrid";

export default async function GalleryPage({
  params,
}: PageProps<"/[lang]/gallery">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const g = dict.gallery;

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 400px at 80% 0%, #1a3a6e, transparent), linear-gradient(180deg, #0a172d, #060b16)",
          }}
        />
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-32 sm:px-6">
          <h1
            data-reveal
            className="text-3xl font-black tracking-tight text-white sm:text-4xl"
          >
            {g.pageTitle}
          </h1>
          <p
            data-reveal
            style={{ "--reveal-delay": "90ms" } as React.CSSProperties}
            className="mt-3 max-w-2xl text-slate-300"
          >
            {g.pageSubtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <GalleryGrid images={galleryPageImages} />
      </section>
    </>
  );
}
