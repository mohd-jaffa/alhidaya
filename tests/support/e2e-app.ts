/**
 * Where the journeys' app runs (playwright.config.ts): its own port, beside a
 * dev server on 3000. It is told this address, so a write the journeys send
 * names it as its origin, as the site's own pages do (plan §26.4). `E2E_PORT` moves it when
 * another server already holds 3100.
 */
export const E2E_PORT = Number(process.env.E2E_PORT ?? 3100);
export const E2E_ORIGIN = `http://localhost:${E2E_PORT}`;
