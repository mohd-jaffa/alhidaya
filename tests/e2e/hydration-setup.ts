import { closeDb } from "@/db/client";
import { publishDocument, readDocumentDraft, saveDocumentDraft } from "@/lib/content/documents";
import { pageDocumentSchema, siteDocumentSchema, type PageDocument, type SiteDocument } from "@/lib/validation";

import globalSetup from "@tests/e2e/global-setup";

/** Development React diagnostics exercise formatted SSR copy as well as the ordinary production journeys. */
export default async function prepareFormattedHydration(): Promise<void> {
  // Includes the local-only database guard, fresh published seed and cache reset.
  await globalSetup();
  const actor = { adminId: null, requestId: "hydration-inline-seed" };
  try {
    for (const page of ["HOME", "ABOUT", "CONTACT"] as const) {
      const key = `PAGE:${page}` as const;
      const draft = (await readDocumentDraft<PageDocument>(key))!.draft;
      for (const section of draft.sections) {
        if (section.type === "SIGN") {
          section.content.headline.en = `***${section.content.headline.en}***`;
          for (const slide of section.content.slides ?? []) slide.headline.en = `**${slide.headline.en}**`;
        }
        if (section.type === "INTRO") {
          section.content.heading.en = `*${section.content.heading.en}*`;
          for (const block of section.content.body)
            if (block.type === "paragraph") block.text.en = `**${block.text.en}**`;
        }
        if (section.type === "MISSION") section.content.mission.en = `*${section.content.mission.en}*`;
      }
      await saveDocumentDraft(key, pageDocumentSchema(page).parse(draft), actor);
      await publishDocument(key, actor);
    }
    const site = (await readDocumentDraft<SiteDocument>("SITE"))!.draft;
    site.navigation[0].label.en = `**${site.navigation[0].label.en}**`;
    site.footer[0].heading.en = `*${site.footer[0].heading.en}*`;
    await saveDocumentDraft("SITE", siteDocumentSchema.parse(site), actor);
    await publishDocument("SITE", actor);
  } finally {
    await closeDb();
  }
}
