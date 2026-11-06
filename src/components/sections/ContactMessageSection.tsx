import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { RiseWords } from "@/components/motion/RiseWords";
import { ArrowLink } from "@/components/ui/arrow-link";
import { GoogleMap } from "@/components/ui/google-map";
import { UI_TEXT } from "@/constants/messages";
import type { Section, SiteDocument } from "@/lib/validation";

import { headingId } from "./SectionFrame";

type FormContent = Extract<Section, { type: "FORM" }>["content"];

/** The reference layout on green: heading/map/office left, white message form right (D152). */
export function ContactMessageSection({
  anchor,
  content,
  form,
  site,
}: {
  anchor: string;
  content: FormContent;
  form: ReactNode;
  site: SiteDocument | null;
}) {
  return (
    <section id={anchor} aria-labelledby={headingId(anchor)} className="contact-message scroll-mt-8 bg-deep px-4 pb-4">
      <div className="contact-message-panel rounded-card bg-leaf-pale py-section">
        <div className="contact-message-container mx-auto w-full max-w-site px-gutter">
          <div className="contact-message-layout grid items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
            <Reveal className="grid min-w-0 gap-7">
              <h2 id={headingId(anchor)} className="text-display font-semibold text-balance">
                <RiseWords text={content.heading.en} />
              </h2>
              {content.text.en ? <p className="text-lead whitespace-pre-line text-ink-2">{content.text.en}</p> : null}
              {site ? (
                <>
                  <GoogleMap pin={site.contact.mapPin} query={`${site.name.en}, ${site.contact.address.at(-1)!.en}`} />
                  <div className="grid justify-items-start gap-4">
                    <h3 className="text-section font-semibold">{UI_TEXT.visitOffice}</h3>
                    <address className="grid not-italic text-ink-2">
                      {site.contact.address.map((line) => (
                        <span key={line.en}>{line.en}</span>
                      ))}
                    </address>
                    <ArrowLink href={site.contact.mapUrl}>{UI_TEXT.openInMaps}</ArrowLink>
                  </div>
                </>
              ) : null}
            </Reveal>
            <Reveal order={1} className="form-card min-w-0 rounded-card bg-card p-6 shadow-float sm:p-8">
              {form}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
