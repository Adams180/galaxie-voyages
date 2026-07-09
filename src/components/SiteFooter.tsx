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
            <li><Link className="hover:text-accent" href={`/${lang}/gallery`}>{nav.gallery}</Link></li>
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

          <div className="mt-5 flex gap-2.5">
            <a
              href={`tel:${contact.phone.replace(/\s/g, "")}`}
              aria-label="Téléphone"
              className="gv-press flex h-9 w-9 items-center justify-center rounded-full border border-line text-fg transition hover:border-gold-400/50 hover:text-highlight"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.6 9.6a16 16 0 0 0 6 6l1.2-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.9 2.3z" />
              </svg>
            </a>
            <a
              href={`https://wa.me/${contact.whatsapp.replace(/[\s+]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="gv-press flex h-9 w-9 items-center justify-center rounded-full border border-line text-fg transition hover:border-emerald-500/50 hover:text-emerald-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 0 1 6.9 12.6l-.2.3.8 2.9-3-.8-.3.2A8.2 8.2 0 1 1 12 3.8zm-2.6 4.3c-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.66 0 .98.72 1.93.82 2.06.1.13 1.4 2.2 3.42 3 .48.2.85.32 1.14.42.48.15.92.13 1.26.08.39-.06 1.2-.49 1.36-.96.17-.47.17-.87.12-.96-.05-.08-.18-.13-.38-.23s-1.2-.59-1.38-.66c-.19-.07-.32-.1-.46.1-.13.2-.52.66-.64.8-.12.13-.23.15-.43.05-.2-.1-.85-.31-1.62-1-.6-.53-1-1.19-1.12-1.39-.12-.2-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.12.13-.2.2-.34.07-.13.03-.25-.02-.35-.05-.1-.45-1.1-.62-1.5-.16-.38-.33-.33-.45-.34z" />
              </svg>
            </a>
            <a
              href={`mailto:${contact.email}`}
              aria-label="E-mail"
              className="gv-press flex h-9 w-9 items-center justify-center rounded-full border border-line text-fg transition hover:border-teal-500/50 hover:text-accent"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-5 text-xs text-faint sm:px-6">
          <span>
            © {new Date().getFullYear()} Galaxie Voyages. {f.rights}
          </span>
        </div>
      </div>
    </footer>
  );
}
