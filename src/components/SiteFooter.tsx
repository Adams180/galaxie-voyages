import Link from "next/link";
import Logo from "./Logo";
import { contact } from "@/lib/data";
import type { Dictionary } from "@/lib/i18n";

export default function SiteFooter({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  const f = dict.footer;
  const nav = dict.nav;

  return (
    <footer className="mt-auto border-t border-white/10 bg-black text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Logo variant="light" />
          <p className="mt-4 max-w-xs text-sm text-slate-400">{f.tagline}</p>
          <p className="mt-4 text-xs text-slate-500">
            {f.parent}{" "}
            <span className="font-semibold text-slate-200">GHF SARL</span> ·
            Yaoundé, Cameroun
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {f.quickLinks}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-teal-300" href={`/${lang}`}>{nav.home}</Link></li>
            <li><Link className="hover:text-teal-300" href={`/${lang}/destinations`}>{nav.destinations}</Link></li>
            <li><Link className="hover:text-teal-300" href={`/${lang}/fleet`}>{nav.fleet}</Link></li>
            <li><Link className="hover:text-teal-300" href={`/${lang}/about`}>{nav.about}</Link></li>
            <li><Link className="hover:text-teal-300" href={`/${lang}/contact`}>{nav.contact}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {f.contactTitle}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a className="hover:text-teal-300" href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                {contact.phone}
              </a>
            </li>
            <li>
              <a className="hover:text-teal-300" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </li>
            <li className="text-slate-400">{contact.addressLine}, {contact.city}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            © {new Date().getFullYear()} Galaxie Voyages. {f.rights}
          </span>
          <span className="text-slate-600">{f.placeholderNote}</span>
        </div>
      </div>
    </footer>
  );
}
