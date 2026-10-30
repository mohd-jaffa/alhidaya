import type { ReactNode } from "react";

import type { PageKey } from "@/constants/sections";
import type { FormKind } from "@/constants/statuses";
import type { SectionData } from "@/features/content/types";
import type { Section } from "@/lib/validation";

import { sectionAnchors } from "./anchors";
import { CareersBandSection } from "./CareersBandSection";
import { ClientsSection } from "./ClientsSection";
import { ContactBandSection } from "./ContactBandSection";
import { ContactDetailsSection } from "./ContactDetailsSection";
import { FormSection } from "./FormSection";
import { ForFamiliesSection } from "./ForFamiliesSection";
import { ForInstitutionsSection } from "./ForInstitutionsSection";
import { HeroSection } from "./HeroSection";
import { HighlightsSection } from "./HighlightsSection";
import { InstitutionsSection } from "./InstitutionsSection";
import { IntroSection } from "./IntroSection";
import { JobsListSection } from "./JobsListSection";
import { MissionSection } from "./MissionSection";
import { ProcessSection } from "./ProcessSection";
import { RichTextSection } from "./RichTextSection";
import { ServicesIndexSection } from "./ServicesIndexSection";
import { SignSection } from "./SignSection";
import { StatementSection } from "./StatementSection";
import { ValuesSection } from "./ValuesSection";

function SectionFor({
  page,
  section,
  anchor,
  data,
  forms,
}: {
  page: PageKey;
  section: Section;
  anchor: string;
  data: SectionData;
  forms: Partial<Record<FormKind, ReactNode>>;
}) {
  const image = (ref: { mediaId: string } | null) => (ref ? (data.images.get(ref.mediaId) ?? null) : null);
  switch (section.type) {
    case "SIGN":
      // Home opens with its hero (D97); every other page with the hero's smaller sign (D109).
      return page === "HOME" ? (
        <HeroSection anchor={anchor} content={section.content} image={image} site={data.site} />
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
      return <IntroSection anchor={anchor} content={section.content} image={image(section.content.image)} />;
    case "SERVICES_INDEX":
      return (
        <ServicesIndexSection
          anchor={anchor}
          content={section.content}
          services={data.services}
          site={data.site}
          image={image}
        />
      );
    case "VALUES":
      return <ValuesSection anchor={anchor} content={section.content} />;
    case "MISSION":
      return <MissionSection anchor={anchor} content={section.content} />;
    case "INSTITUTIONS":
      return <InstitutionsSection anchor={anchor} content={section.content} image={image(section.content.image)} />;
    case "CLIENTS":
      return <ClientsSection anchor={anchor} content={section.content} clients={data.clients} images={data.images} />;
    case "CAREERS_BAND":
      return <CareersBandSection anchor={anchor} content={section.content} jobs={data.jobs} />;
    case "JOBS_LIST":
      return <JobsListSection anchor={anchor} content={section.content} jobs={data.jobs} />;
    case "CONTACT_BAND":
      return <ContactBandSection anchor={anchor} content={section.content} site={data.site} />;
    case "CONTACT_DETAILS":
      return <ContactDetailsSection anchor={anchor} content={section.content} site={data.site} />;
    case "FORM":
      return (
        <FormSection
          anchor={anchor}
          content={section.content}
          form={forms[section.content.form]}
          email={data.site?.contact.email ?? null}
        />
      );
    case "RICH_TEXT":
      return <RichTextSection anchor={anchor} content={section.content} />;
    case "STATEMENT":
      return <StatementSection anchor={anchor} content={section.content} />;
    case "HIGHLIGHTS":
      return <HighlightsSection anchor={anchor} content={section.content} image={image} />;
    case "FOR_INSTITUTIONS":
      return <ForInstitutionsSection anchor={anchor} content={section.content} image={image} />;
    case "FOR_FAMILIES":
      return <ForFamiliesSection anchor={anchor} content={section.content} services={data.services} image={image} />;
    case "PROCESS":
      return <ProcessSection anchor={anchor} content={section.content} image={image} />;
  }
}

/**
 * A page's visible sections in the admin's order (plan §7), each drawn by
 * its type's component from the published content. The forms are fixed in
 * code and handed in by the page that holds them.
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
  forms?: Partial<Record<FormKind, ReactNode>>;
}) {
  const anchors = sectionAnchors(sections);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-section pt-16 pb-section xl:pt-12">
      {sections.map((section, index) => (
        <SectionFor key={section.id} page={page} section={section} anchor={anchors[index]} data={data} forms={forms} />
      ))}
    </div>
  );
}
