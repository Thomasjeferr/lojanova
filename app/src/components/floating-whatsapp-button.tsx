"use client";

import type { ContactSettingsPublic } from "@/lib/contact-settings";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 fill-current">
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.08 2a9.86 9.86 0 0 0-8.53 14.8L2 22l5.35-1.4a9.86 9.86 0 0 0 4.72 1.2h.01A9.92 9.92 0 0 0 22 11.9a9.84 9.84 0 0 0-2.95-7zm-6.97 15.2h-.01a8.25 8.25 0 0 1-4.2-1.15l-.3-.18-3.18.83.85-3.1-.2-.32a8.2 8.2 0 0 1 7.04-12.5c2.2 0 4.27.86 5.83 2.42a8.17 8.17 0 0 1 2.43 5.83 8.3 8.3 0 0 1-8.26 8.17zm4.53-6.17c-.25-.13-1.47-.72-1.7-.8s-.4-.12-.57.12-.65.8-.8.97-.28.2-.53.07a6.72 6.72 0 0 1-1.98-1.22 7.44 7.44 0 0 1-1.38-1.72c-.15-.25-.02-.39.11-.52.11-.11.25-.28.37-.42.13-.14.17-.24.25-.4.08-.17.04-.31-.02-.44-.06-.13-.57-1.37-.77-1.87-.2-.5-.41-.43-.57-.44h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.6c.13.17 1.76 2.68 4.25 3.76.59.26 1.06.41 1.42.52.6.2 1.14.17 1.57.1.48-.07 1.47-.6 1.67-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.47-.28z" />
    </svg>
  );
}

export function FloatingWhatsAppButton({
  settings,
}: {
  settings: ContactSettingsPublic;
}) {
  if (!settings.whatsappEnabled || !settings.whatsappLink) return null;

  const label = settings.whatsappLabel || "Fale conosco";
  return (
    <a
      href={settings.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group fixed bottom-4 right-4 z-[70] inline-flex items-center gap-2 rounded-full bg-[#25D366] px-3 py-3 text-white shadow-[0_14px_30px_-10px_rgba(37,211,102,0.65)] transition-all duration-300 hover:scale-[1.04] hover:bg-[#22c55e] hover:shadow-[0_20px_42px_-12px_rgba(37,211,102,0.72)] sm:bottom-6 sm:right-6 sm:px-4"
      title={label}
    >
      <WhatsAppIcon />
      <span className="hidden text-sm font-semibold tracking-tight sm:inline">{label}</span>
    </a>
  );
}

