/** Reading what the site sent, from Mailpit's API (the local mail catcher). */
const MAILPIT = () => process.env.MAILPIT_URL ?? "";

export interface MailpitSummary {
  ID: string;
  Subject: string;
  From: { Address: string };
  To: { Address: string }[];
  ReplyTo: { Address: string }[];
  Attachments: number;
}

export async function searchMail(query: string): Promise<MailpitSummary[]> {
  const response = await fetch(`${MAILPIT()}/api/v1/search?query=${encodeURIComponent(query)}`);
  return ((await response.json()) as { messages: MailpitSummary[] }).messages;
}

/** Waits for the mail a query finds, up to about three seconds. */
export async function waitForMail(query: string, count = 1): Promise<MailpitSummary[]> {
  for (let tries = 0; tries < 20; tries++) {
    const found = await searchMail(query);
    if (found.length >= count) return found;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return searchMail(query);
}

export async function mailText(id: string): Promise<string> {
  const response = await fetch(`${MAILPIT()}/api/v1/message/${id}`);
  return ((await response.json()) as { Text: string }).Text;
}

export async function deleteMail(ids: string[]): Promise<void> {
  if (ids.length > 0)
    await fetch(`${MAILPIT()}/api/v1/messages`, { method: "DELETE", body: JSON.stringify({ IDs: ids }) });
}

export interface MailpitAttachment {
  PartID: string;
  FileName: string;
  ContentType: string;
  Size: number;
}

/** What an email carries attached, each with its bytes. */
export async function mailAttachments(id: string): Promise<(MailpitAttachment & { bytes: Uint8Array })[]> {
  const response = await fetch(`${MAILPIT()}/api/v1/message/${id}`);
  const { Attachments } = (await response.json()) as { Attachments: MailpitAttachment[] };
  return Promise.all(
    Attachments.map(async (attachment) => {
      const part = await fetch(`${MAILPIT()}/api/v1/message/${id}/part/${attachment.PartID}`);
      return { ...attachment, bytes: new Uint8Array(await part.arrayBuffer()) };
    }),
  );
}
