import Image from "next/image";
import { galleryImages } from "@/lib/data";

export default function Gallery() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {galleryImages.map((src, i) => (
        <div
          key={src}
          className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-elevated"
        >
          <Image
            src={src}
            alt={`Galaxie Voyages — ${i + 1}`}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );
}
