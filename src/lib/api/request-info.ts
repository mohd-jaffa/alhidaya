/**
 * The visitor's IP, as the server in front of the app reports it (plan
 * §26.4). Apache adds the address it saw to the end of `X-Forwarded-For`; any
 * earlier entry came from the client and could be anything, so the last one
 * is used. Checked on the server at R8.2.
 */
export function clientIp(request: Request): string {
  const last = request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  return last || "unknown";
}
