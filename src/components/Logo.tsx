import Image from "next/image";

/** Galaxie Voyages logo: real emblem on a white chip + wordmark.
 *  The "Galaxie" wordmark inherits the parent text color (currentColor),
 *  so the header can flip it white over the hero and dark when scrolled. */
export default function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <span className="flex items-center rounded-lg bg-white px-1.5 py-1 shadow-sm">
        <Image
          src="/img/logo.png"
          alt="Galaxie Voyages"
          width={219}
          height={103}
          priority
          className="h-7 w-auto"
        />
      </span>
      <span className="leading-none">
        <span className="block text-lg font-extrabold tracking-tight">
          Galaxie
        </span>
        <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-teal-500 dark:text-teal-300">
          Voyages
        </span>
      </span>
    </span>
  );
}
