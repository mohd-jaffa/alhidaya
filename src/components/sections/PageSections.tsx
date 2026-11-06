import type { ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import type { PageKey } from "@/constants/sections";
import type { SectionForm } from "@/constants/statuses";
import type { SectionData } from "@/features/content/types";
import type { Section } from "@/lib/validation";

import { sectionAnchors } from "./anchors";
import { CareersBandSection } from "./CareersBandSection";
import { ClientsSection } from "./ClientsSection";
import { ContactBandSection } from "./ContactBandSection";
import { ContactDetailsSection } from "./ContactDetailsSection";
import { FormSection } from "./FormSection";
import { HeroSection } from "./HeroSection";
import { InstitutionsSection } from "./InstitutionsSection";
import { IntroSection } from "./IntroSection";
import { JobsListSection } from "./JobsListSection";
import { MissionSection } from "./MissionSection";
import { RichTextSection } from "./RichTextSection";
import { ServicesIndexSection } from "./ServicesIndexSection";
import { ServicesRowSection } from "./ServicesRowSection";
import { KEEPS_HERO, SignSection } from "./SignSection";
import { ValuesSection } from "./ValuesSection";

/** Whether a section is drawn on a band of colour edge to edge (D130, D131, D135). */
function onBand(page: PageKey, section: Section): boolean {
  switch (section.type) {
    case "SERVICES_ROW":
    case "MISSION":
    case "CONTACT_BAND":
    case "CONTACT_DETAILS":
      return true;
    case "FORM":
      return section.content.form === "SHORT_QUOTE" || page === "CONTACT";
    case "JOBS_LIST":
    case "RICH_TEXT":
      return page === "CAREERS";
    case "SERVICES_INDEX":
      return page === "SERVICES";
    default:
      return false;
  }
}

function SectionFor({
  page,
  section,
  anchor,
  data,
  forms,
  hasSign,
}: {
  page: PageKey;
  section: Section;
  anchor: string;
  data: SectionData;
  forms: Partial<Record<SectionForm, ReactNode>>;
  hasSign: boolean;
}) {
  const image = (ref: { mediaId: string } | null) => (ref ? (data.images.get(ref.mediaId) ?? null) : null);
  switch (section.type) {
    case "SIGN":
      // Home opens with its slides (D128); every other page with its sign (D109).
      return page === "HOME" ? (
        <HeroSection anchor={anchor} content={section.content} image={image} />
      ) : (
        <SignSection
          page={page}
          anchor={anchor}
          content={section.content}
          image={image(section.content.image)}
          site={data.site}
        />
      );
    case "INTRO":
      return (
        <IntroSection
          anchor={anchor}
          content={section.content}
          image={image(section.content.image)}
          more={page === "HOME" ? ROUTES.about : null}
          alignToPhoto={page === "ABOUT"}
          pointCards={page === "HOME"}
        />
      );
    case "SERVICES_INDEX":
      return (
        <ServicesIndexSection
          unified={page === "SERVICES"}
          anchor={anchor}
          content={section.content}
          services={data.services}
          site={data.site}
          image={image}
        />
      );
    case "VALUES":
      return <ValuesSection anchor={anchor} content={section.content} panels={page === "ABOUT"} />;
    case "MISSION":
      return <MissionSection anchor={anchor} content={section.content} />;
    case "INSTITUTIONS":
      return <InstitutionsSection anchor={anchor} content={section.content} image={image(section.content.image)} />;
    case "CLIENTS":
      return <ClientsSection anchor={anchor} content={section.content} clients={data.clients} images={data.images} />;
    case "CAREERS_BAND":
      return <CareersBandSection anchor={anchor} content={section.content} jobs={data.jobs} />;
    case "JOBS_LIST":
      return (
        <JobsListSection
          anchor={anchor}
          content={section.content}
          jobs={data.jobs}
          image={image(section.content.image ?? null)}
          band={page === "CAREERS"}
          primary={!hasSign}
        />
      );
    case "CONTACT_BAND":
      return (
        <ContactBandSection
          anchor={anchor}
          content={section.content}
          site={data.site}
          tone={page === "SERVICES" ? "mist" : "leaf"}
          cards={page === "ABOUT" || page === "SERVICES"}
        />
      );
    case "CONTACT_DETAILS":
      return <ContactDetailsSection anchor={anchor} content={section.content} site={data.site} />;
    case "FORM":
      return (
        <FormSection
          anchor={anchor}
          content={section.content}
          form={forms[section.content.form]}
          kind={section.content.form}
          site={data.site}
          band={page === "CONTACT"}
        />
      );
    case "RICH_TEXT":
      return <RichTextSection anchor={anchor} content={section.content} band={page === "CAREERS"} />;
    case "SERVICES_ROW":
      return (
        <ServicesRowSection
          pyramid={page === "HOME"}
          anchor={anchor}
          content={section.content}
          services={data.services}
          image={image}
        />
      );
  }
}

/**
 * A page's visible sections in the admin's order (plan §7), each drawn by
 * its type's component from the published content. The forms are fixed in
 * code and handed in by the page that holds them. A page opening in straight
 * lines starts under the header (D128, D135); one ending on a band meets the
 * footer; two bands in a row meet.
 */
export function PageSections({
  page,
  sections,
  data,
  forms = {},
}: {
  page: PageKey;
  sections: readonly Section[];
  data: SectionData;
  forms?: Partial<Record<SectionForm, ReactNode>>;
}) {
  const anchors = sectionAnchors(sections);
  const bands = sections.map((section) => onBand(page, section));
  const top = KEEPS_HERO.includes(page) && sections[0]?.type === "SIGN" ? "pt-16 xl:pt-12" : "";
  const bottom = bands.at(-1) ? "" : "pb-section";
  return (
    <div
      data-page={page}
      className={`page-sections grid grid-cols-[minmax(0,1fr)] ${page === "CONTACT" ? "contact-page" : "gap-section"} ${top} ${bottom}`}
    >
      {sections.map((section, index) => {
        const drawn = (
          <SectionFor
            key={section.id}
            page={page}
            section={section}
            anchor={anchors[index]}
            data={data}
            forms={forms}
            hasSign={sections.some((item) => item.type === "SIGN")}
          />
        );
        const joinsOpening =
          page === "SERVICES" && section.type === "SERVICES_INDEX" && sections[index - 1]?.type === "SIGN";
        return page !== "CONTACT" && ((bands[index] && bands[index - 1]) || joinsOpening) ? (
          <div key={section.id} className="-mt-section">
            {drawn}
          </div>
        ) : (
          drawn
        );
      })}
    </div>
  );
}
