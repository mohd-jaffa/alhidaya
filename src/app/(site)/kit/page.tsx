import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PICTOGRAMS, type PictogramName } from "@/assets/brand/pictograms";
import { Reveal } from "@/components/motion/Reveal";
import { TheLine } from "@/components/motion/TheLine";
import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import { SEED_SERVICES } from "@/db/seed/content";
import { getServerEnv } from "@/lib/env/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: UI_TEXT.kitPreview, robots: { index: false, follow: false } };

/** The kit and the motion system on a long page of real content, local and test only (plan D64). */
export default function KitPage() {
  if (!getServerEnv().KIT_PREVIEW) notFound();
  const stations = SEED_SERVICES.map((service) => ({ id: service.slug, label: service.name.en }));

  return (
    <main className="mx-auto max-w-site px-gutter pt-16 pb-section">
      <TheLine stations={stations} tone="deep" />
      <h1 className="text-sign font-bold">{UI_TEXT.kitPreview}</h1>
      <div className="mt-8 flex flex-wrap gap-6 text-navy">
        {(Object.keys(PICTOGRAMS) as PictogramName[]).map((name) => (
          <Pictogram key={name} name={name} size="lg" label={name} />
        ))}
      </div>
      {SEED_SERVICES.map((service) => (
        <section key={service.slug} id={service.slug} className="grid gap-4 py-section">
          <h2 className="text-page font-bold">{service.name.en}</h2>
          <Reveal className="max-w-measure text-lead text-ink-2">
            <p>{service.summary.en}</p>
          </Reveal>
          <Reveal className="max-w-measure">
            {service.description.map((block) =>
              block.type === "paragraph" ? <p key={block.text.en}>{block.text.en}</p> : null,
            )}
          </Reveal>
        </section>
      ))}
    </main>
  );
}
