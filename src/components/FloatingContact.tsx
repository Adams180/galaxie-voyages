import { contact } from "@/lib/data";

export default function FloatingContact({ label }: { label: string }) {
  const wa = contact.whatsapp.replace(/[\s+]/g, "");
  return (
    <a
      href={`https://wa.me/${wa}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition hover:scale-105 hover:bg-emerald-400"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.8c2.17 0 4.2.84 5.74 2.38a8.06 8.06 0 0 1 2.38 5.73c0 4.48-3.65 8.12-8.12 8.12a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.12.82.83-3.04-.19-.31a8.07 8.07 0 0 1-1.24-4.3c0-4.47 3.64-8.11 8.13-8.11zm-2.6 4.34c-.14 0-.36.05-.55.26-.19.21-.73.71-.73 1.74 0 1.03.75 2.02.85 2.16.1.14 1.45 2.32 3.58 3.16 1.77.7 2.13.56 2.52.52.39-.04 1.24-.5 1.42-.99.18-.49.18-.9.12-.99-.05-.09-.19-.14-.4-.24-.21-.1-1.24-.61-1.43-.68-.19-.07-.33-.1-.47.1-.14.21-.54.68-.66.82-.12.14-.24.16-.45.05-.21-.1-.88-.32-1.68-1.03-.62-.55-1.04-1.24-1.16-1.45-.12-.21-.01-.32.09-.42.09-.09.21-.24.31-.36.1-.12.14-.21.21-.35.07-.14.03-.26-.02-.36-.05-.1-.46-1.13-.64-1.55-.17-.41-.34-.35-.47-.36h-.4z" />
      </svg>
    </a>
  );
}
