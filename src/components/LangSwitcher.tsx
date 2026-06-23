"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const locales = ["fr", "en"] as const;

export default function LangSwitcher({ current }: { current: string }) {
  const pathname = usePathname();

  const swap = (locale: string) => {
    const segments = pathname.split("/");
    segments[1] = locale; // replace the leading locale segment
    return segments.join("/") || `/${locale}`;
  };

  return (
    <div className="flex items-center rounded-full border border-white/15 bg-white/5 p-0.5 text-xs font-semibold">
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={swap(locale)}
            aria-current={active ? "true" : undefined}
            className={`rounded-full px-2.5 py-1 uppercase transition ${
              active
                ? "bg-teal-500 text-white"
                : "text-slate-200 hover:bg-white/10"
            }`}
          >
            {locale}
          </Link>
        );
      })}
    </div>
  );
}
