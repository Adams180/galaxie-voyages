import Link from "next/link";
import Logo from "./Logo";
import { contact, imageCredit } from "@/lib/data";
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
    <footer className="mt-auto border-t border-line bg-band text-muted">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <span className="text-fg">
            <Logo />
          </span>
          <p className="mt-4 max-w-xs text-sm">{f.tagline}</p>
          <p className="mt-4 text-xs">
            {f.parent}{" "}
            <span className="font-semibold text-fg">GHF SARL</span> · Yaoundé,
            Cameroun
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-fg">
            {f.quickLinks}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-accent" href={`/${lang}`}>{nav.home}</Link></li>
            <li><Link className="hover:text-accent" href={`/${lang}/destinations`}>{nav.destinations}</Link></li>
            <li><Link className="hover:text-accent" href={`/${lang}/fleet`}>{nav.fleet}</Link></li>
            <li><Link className="hover:text-accent" href={`/${lang}/about`}>{nav.about}</Link></li>
            <li><Link className="hover:text-accent" href={`/${lang}/contact`}>{nav.contact}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-fg">
            {f.contactTitle}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a className="hover:text-accent" href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                {contact.phone}
              </a>
            </li>
            <li>
              <a className="hover:text-accent" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </li>
            <li>{contact.addressLine}, {contact.city}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            © {new Date().getFullYear()} Galaxie Voyages. {f.rights}
          </span>
          <span className="flex flex-wrap items-center gap-x-2">
            <a
              href={imageCredit.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              {imageCredit.label}
            </a>
            <span aria-hidden>·</span>
            <span>{f.placeholderNote}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
