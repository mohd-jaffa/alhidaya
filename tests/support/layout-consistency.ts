import type { Page } from "@playwright/test";

/** Geometry evidence excludes intentionally clipped/carousel copies and inline prose links. */
export async function inspectLayout(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  );
  return page.evaluate(() => {
    const visible = (el: HTMLElement) =>
      el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) &&
      el.getBoundingClientRect().width > 0 &&
      !el.closest('[aria-hidden="true"], [inert], .sr-only');
    const identify = (el: HTMLElement) =>
      `${el.tagName.toLowerCase()}${el.getAttribute("type") ? `[${el.getAttribute("type")}]` : ""}: ${(
        el.getAttribute("aria-label") ??
        el.textContent ??
        ""
      )
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 75)}`;
    const targets = [...document.querySelectorAll<HTMLElement>("button, a, input, select, textarea")].filter(visible);
    const smallTargets = targets.flatMap((el) => {
      const style = getComputedStyle(el);
      if (el.tagName === "A" && style.display === "inline" && el.closest("p, label, figcaption")) return [];
      if (el.matches('input[type="checkbox"], input[type="radio"]')) {
        const label = el.closest("label");
        if (label) el = label;
      }
      const after = getComputedStyle(el, "::after");
      // Stretched links make the full positioned card clickable, including the whitespace.
      const stretched =
        after.content !== "none" &&
        after.position === "absolute" &&
        [after.top, after.right, after.bottom, after.left].every((edge) => edge === "0px");
      const box = (stretched && el.offsetParent ? el.offsetParent : el).getBoundingClientRect();
      return box.width < 43.5 || box.height < 43.5
        ? [{ target: identify(el), width: box.width, height: box.height }]
        : [];
    });
    const smallInputs = targets
      .filter((el) => el.matches('input:not([type="checkbox"]):not([type="radio"]), textarea, select'))
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
      .map(identify);
    const clippedText = [...document.querySelectorAll<HTMLElement>("h1, h2, h3, h4, label, p, button")]
      .filter(visible)
      .filter((el) => !el.closest(".home-services-pyramid, .logo-track, [class*='line-clamp'], .truncate"))
      .filter((el) => el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0)
      .map(identify);
    const distortedLogos = [...document.querySelectorAll<HTMLImageElement>("img")]
      .filter(visible)
      .filter((el) => /\/logo(?:-white)?\./.test(el.src) && el.naturalWidth > 0)
      .filter((el) => {
        const box = el.getBoundingClientRect();
        const ratio = box.width / box.height / (el.naturalWidth / el.naturalHeight);
        return Math.abs(ratio - 1) > 0.03 && getComputedStyle(el).objectFit !== "contain";
      })
      .map((el) => ({ where: el.closest("footer") ? "footer" : "header", box: el.getBoundingClientRect().toJSON() }));
    const main = document.querySelector("main")!;
    const headings = [...main.querySelectorAll<HTMLElement>("h1, h2, h3")]
      .filter(visible)
      .map((el) => `${el.tagName}:${el.textContent?.replace(/\s+/g, " ").trim()}`);
    const links = [...main.querySelectorAll<HTMLElement>("a[href]")]
      .filter(visible)
      .filter((el) => !el.closest(".home-services-pyramid, .logo-track"))
      .map((el) => el.getAttribute("href"))
      .sort();
    const header = document.querySelector<HTMLElement>(".site-header");
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      headerHeight: header?.getBoundingClientRect().height ?? null,
      headerBackground: header ? getComputedStyle(header).backgroundColor : null,
      smallTargets,
      smallInputs,
      clippedText,
      distortedLogos,
      headings,
      links,
    };
  });
}
