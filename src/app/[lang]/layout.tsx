import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingContact from "@/components/FloatingContact";
import RevealObserver from "@/components/RevealObserver";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Runs before paint to set the theme class and avoid a flash of the wrong theme.
const themeScript = `(function(){var d=document.documentElement;d.classList.add('reveal-on');try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}if(t==='dark'){d.classList.add('dark');}}catch(e){d.classList.add('dark');}})();`;

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    verification: {
      google: "50VvJrm5dY0swNbaU9AFqBRW2GjyyAChK_5JuF4PwhU",
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-page font-sans text-fg antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ScrollProgress />
        <RevealObserver />
        <SiteHeader lang={lang} nav={dict.nav} themeLabel={dict.common.theme} />
        <main className="flex-1">{children}</main>
        <SiteFooter lang={lang} dict={dict} />
        <FloatingContact label={dict.common.whatsapp} />
        <BackToTop label={dict.common.backToTop} />
      </body>
    </html>
  );
}
