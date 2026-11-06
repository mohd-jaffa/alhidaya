import { GOOGLE_MAPS } from "@/constants/site";

/**
 * The links that reach the company (plan §6.7, D9): a WhatsApp chat with its
 * first line written (Q14), a call, an email; and the admin's way back to a
 * visitor (a chat with nothing written). Numbers are E.164
 * ("+97431306555"), as the site content stores them.
 */
export function whatsappHref(e164: string, firstLine?: string): string {
  const chat = `https://wa.me/${e164.replace(/^\+/, "")}`;
  return firstLine ? `${chat}?text=${encodeURIComponent(firstLine)}` : chat;
}

export function telHref(e164: string): string {
  return `tel:${e164}`;
}

export function mailtoHref(email: string): string {
  return `mailto:${email}`;
}

/** How a number reads in Qatar: "+974 3130 6555"; any other country's stays as stored. */
export function displayPhone(e164: string): string {
  const qatar = e164.match(/^\+974(\d{4})(\d{4})$/);
  return qatar ? `+974 ${qatar[1]} ${qatar[2]}` : e164;
}

/** Confirmed coordinates win; otherwise Google resolves the published business and area. */
export function googleSatelliteEmbed(query: string, pin: { lat: number; lon: number } | null): string {
  const parameters = new URLSearchParams({
    q: pin ? `${pin.lat},${pin.lon}` : query,
    hl: "en",
    z: "18",
    t: "k",
    output: "embed",
  });
  return `${GOOGLE_MAPS.embed}?${parameters}`;
}
