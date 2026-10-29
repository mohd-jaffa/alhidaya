/**
 * The links that reach the company (plan §6.7, D9): a WhatsApp chat with its
 * first line written (Q14), a call, an email. Numbers are E.164
 * ("+97431306555"), as the site content stores them.
 */
export function whatsappHref(e164: string, firstLine: string): string {
  return `https://wa.me/${e164.replace(/^\+/, "")}?text=${encodeURIComponent(firstLine)}`;
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
