import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { contact } from "@/lib/data";
import ContactForm from "@/components/ContactForm";

export default async function ContactPage({
  params,
}: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const ct = dict.contact;
  const c = dict.common;
  const tel = contact.phone.replace(/\s/g, "");
  const wa = contact.whatsapp.replace(/[\s+]/g, "");

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
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {ct.title}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">{ct.subtitle}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2">
        {/* Left: contact details */}
        <div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${tel}`}
              className="rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-400"
            >
              {c.callUs}
            </a>
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              {c.whatsapp}
            </a>
          </div>

          <dl className="mt-8 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-fg">{ct.headOffice}</dt>
              <dd className="text-muted">
                {contact.addressLine}, {contact.city}
                <br />
                {contact.poBox}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-fg">{c.phone}</dt>
              <dd>
                <a className="text-accent hover:underline" href={`tel:${tel}`}>
                  {contact.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-fg">{c.email}</dt>
              <dd>
                <a
                  className="text-accent hover:underline"
                  href={`mailto:${contact.email}`}
                >
                  {contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-fg">{ct.hours}</dt>
            </div>
          </dl>

          <h2 className="mt-10 text-lg font-bold text-fg">
            {ct.agenciesTitle}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {contact.agencies.map((ag) => (
              <li
                key={ag.city}
                className="rounded-xl border border-line bg-surface p-4"
              >
                <div className="font-semibold text-fg">{ag.city}</div>
                <div className="text-sm text-muted">{ag.area}</div>
                <ul className="mt-2 space-y-1">
                  {ag.phones.map((p) => (
                    <li key={p.number} className="text-sm">
                      {p.toCity && (
                        <span className="text-faint">
                          {ct.line} {p.toCity} ·{" "}
                        </span>
                      )}
                      <a
                        className="text-accent hover:underline"
                        href={`tel:${p.number.replace(/\s/g, "")}`}
                      >
                        {p.number}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form */}
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-bold text-fg">{ct.formTitle}</h2>
          <div className="mt-4">
            <ContactForm labels={ct} />
          </div>
        </div>
      </section>
    </>
  );
}
