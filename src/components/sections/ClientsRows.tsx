"use client";
"use no memo"; // Rarely redrawn: memoising it would only add to the page's JavaScript budget (plan §31).

import { type CSSProperties, Fragment, type ReactNode, useEffect, useRef, useState } from "react";

/** One client's logo, drawn on the server, and the site it opens when the admin gave one. */
export interface ClientLogo {
  id: string;
  name: string;
  url: string | null;
  logo: ReactNode;
}

/** At least this many logos in each half of a row, so a wide screen never sees its end. */
const PER_HALF = 10;
/** How long each logo takes to pass, in seconds: slow enough to read. */
const SECONDS_PER_LOGO = 4;

const ITEM =
  "logo-item relative h-20 w-36 shrink-0 rounded-inset transition-transform duration-(--duration-reveal) ease-out hover:scale-115 focus-visible:scale-115 aria-pressed:scale-115 sm:h-24 sm:w-48";

/**
 * The clients' two rows (D133, as nahrdev.com): the logos split between them,
 * each repeated until it outruns a wide screen, running in opposite
 * directions. A logo turns to its colours and grows under the pointer, and
 * its row stops. Clicking or tapping one does the same until it is clicked
 * again or the visitor clicks elsewhere; a logo with a site opens it instead.
 * Only the first copy of each row is read and reached by the keyboard.
 */
export function ClientsRows({ clients }: { clients: readonly ClientLogo[] }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const rows = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chosen) return;
    const release = (event: PointerEvent) => {
      if (!rows.current?.contains(event.target as Node)) setChosen(null);
    };
    document.addEventListener("pointerdown", release);
    return () => document.removeEventListener("pointerdown", release);
  }, [chosen]);

  const half = Math.ceil(clients.length / 2);
  const split = clients.length > 3 ? [clients.slice(0, half), clients.slice(half)] : [clients];

  return (
    <div
      ref={rows}
      className="grid gap-6 overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] motion-reduce:[mask-image:none] sm:gap-10"
    >
      {split.map((row, at) => {
        const repeats = Math.ceil(PER_HALF / row.length);
        const style = { "--loop-duration": `${row.length * repeats * SECONDS_PER_LOGO}s` } as CSSProperties;
        return (
          <div
            key={at}
            data-reverse={at === 1 || undefined}
            style={style}
            className="logo-track flex w-max items-center gap-8 motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:justify-center sm:gap-12"
          >
            {Array.from({ length: repeats * 2 }, (_, copy) => (
              <Fragment key={copy}>
                {row.map((client) => {
                  const hidden = copy > 0;
                  const look = hidden ? `${ITEM} logo-copy` : ITEM;
                  return client.url ? (
                    <a
                      key={client.id}
                      href={client.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-hidden={hidden || undefined}
                      tabIndex={hidden ? -1 : undefined}
                      aria-label={hidden ? undefined : client.name}
                      className={look}
                    >
                      {client.logo}
                    </a>
                  ) : (
                    <button
                      key={client.id}
                      type="button"
                      aria-hidden={hidden || undefined}
                      tabIndex={hidden ? -1 : undefined}
                      aria-label={hidden ? undefined : client.name}
                      aria-pressed={chosen === client.id}
                      onClick={() => setChosen((now) => (now === client.id ? null : client.id))}
                      className={look}
                    >
                      {client.logo}
                    </button>
                  );
                })}
              </Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );
}
