import Image from "next/image";

type Props = {
  className?: string;
  /** wordmark color context */
  variant?: "light" | "dark";
};

export default function Logo({ className, variant = "light" }: Props) {
  const text = variant === "light" ? "#ffffff" : "#142d56";
  const sub = variant === "light" ? "#5fd3e6" : "#0e7490";
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
        <span
          className="block text-lg font-extrabold tracking-tight"
          style={{ color: text }}
        >
          Galaxie
        </span>
        <span
          className="block text-[0.68rem] font-semibold uppercase tracking-[0.28em]"
          style={{ color: sub }}
        >
          Voyages
        </span>
      </span>
    </span>
  );
}
