import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "@/db/client";
import { auditLog, documents, records } from "@/db/schema";
import {
  findJobToApply,
  getApplyMetadata,
  getGeneralApplicationShareImage,
  getJobMetadata,
  getJobShareImage,
  getPublishedJobPage,
} from "@/features/careers/api";
import { createRecord, publishRecord, saveRecordDraft } from "@/lib/content/records";
import { jobFixture } from "@tests/support/fixtures/content";

const REQUEST = `req_job_page_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };
const en = <T>(value: T) => ({ en: value });
// 09:00 in Doha on 29 October 2026.
const AT = new Date("2026-10-29T06:00:00Z");

async function clearContent() {
  await getDb().delete(documents);
  await getDb().delete(records);
}

async function published(draft: ReturnType<typeof jobFixture>) {
  const id = await createRecord("JOBS", draft, actor);
  await publishRecord("JOBS", id, draft.slug, actor);
  return id;
}

let nurse: string;
let school: string;

beforeAll(async () => {
  await clearContent();
  nurse = await published(jobFixture({ closesOn: "2026-11-30" }));
  school = await published(jobFixture({ title: en("School Nurse"), slug: "school-nurse", postedOn: "2026-10-10" }));
  await published(jobFixture({ title: en("Clinic Nurse"), slug: "clinic-nurse", closesOn: "2026-10-28" }));
});

afterAll(async () => {
  await clearContent();
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await closeDb();
});

describe("a job's page, against the local MySQL", () => {
  it("reads an open job with the other open jobs, never a closed one", async () => {
    const page = await getPublishedJobPage("registered-general-nurse-home-care", "published", AT);
    if (!page || "movedTo" in page) throw new Error("the job is published");
    expect([page.job.id, page.job.open]).toEqual([nurse, true]);
    expect(page.others.map((other) => other.id)).toEqual([school]);
  });

  it("reads a closed job, still at its address, with the open jobs it offers instead", async () => {
    const page = await getPublishedJobPage("clinic-nurse", "published", AT);
    if (!page || "movedTo" in page) throw new Error("the job is published");
    expect(page.job.open).toBe(false);
    expect(page.others.map((other) => other.id).toSorted()).toEqual([nurse, school].toSorted());
  });

  it("answers where a renamed job moved to, nothing for an address it never had, and a draft only in preview", async () => {
    await saveRecordDraft("JOBS", school, jobFixture({ title: en("School Nurse"), slug: "nurse-for-schools" }), actor);
    expect(await getPublishedJobPage("nurse-for-schools", "published", AT)).toBeNull();
    expect(await getPublishedJobPage("nurse-for-schools", "preview", AT)).toMatchObject({ job: { id: school } });

    await publishRecord("JOBS", school, "nurse-for-schools", actor);
    expect(await getPublishedJobPage("school-nurse", "published", AT)).toEqual({ movedTo: "nurse-for-schools" });
    expect(await getPublishedJobPage("no-such-job")).toBeNull();
  });

  it("titles a job with the admin's SEO words or its own, and keeps a closed one out of search", async () => {
    expect(await getJobMetadata("registered-general-nurse-home-care", AT)).toEqual({
      title: "Registered General Nurse – Home Care",
      description: "Home care nursing.",
      alternates: { canonical: "/careers/registered-general-nurse-home-care" },
      openGraph: {
        title: "Registered General Nurse – Home Care",
        description: "Home care nursing.",
        url: "/careers/registered-general-nurse-home-care",
        type: "website",
        siteName: "Al Hidaya Health Care Services",
      },
    });
    await saveRecordDraft(
      "JOBS",
      nurse,
      jobFixture({
        closesOn: "2026-11-30",
        seo: { title: en("Home care nurse jobs in Doha"), description: en("Nurse patients at home.") },
      }),
      actor,
    );
    await publishRecord("JOBS", nurse, "registered-general-nurse-home-care", actor);
    expect(await getJobMetadata("registered-general-nurse-home-care", AT)).toMatchObject({
      title: "Home care nurse jobs in Doha",
      description: "Nurse patients at home.",
    });
    expect(await getJobMetadata("clinic-nurse", AT)).toMatchObject({ robots: { index: false } });
    expect(await getJobMetadata("school-nurse")).toEqual({});
    expect(await getJobMetadata("no-such-job")).toEqual({});
  });

  it("finds the job an application page is for: open or closed, where it moved to, a draft only in preview", async () => {
    expect(await findJobToApply("registered-general-nurse-home-care", "published", AT)).toMatchObject({
      id: nurse,
      open: true,
    });
    expect(await findJobToApply("clinic-nurse", "published", AT)).toMatchObject({ open: false });
    expect(await findJobToApply("school-nurse")).toEqual({ movedTo: "nurse-for-schools" });
    expect(await findJobToApply("no-such-job")).toBeNull();
    await saveRecordDraft("JOBS", school, jobFixture({ title: en("School Nurse"), slug: "nurse-at-school" }), actor);
    expect(await findJobToApply("nurse-at-school")).toBeNull();
    expect(await findJobToApply("nurse-at-school", "preview", AT)).toMatchObject({ id: school });
  });

  it("titles an application page by its open job, or as the general application", async () => {
    expect(await getApplyMetadata("nurse-for-schools", AT)).toEqual({
      title: "Apply for School Nurse",
      description: "Tell us where you are with your licence, and send your CV. It takes a few minutes.",
      alternates: { canonical: "/careers/nurse-for-schools/apply" },
      openGraph: {
        title: "Apply for School Nurse",
        description: "Tell us where you are with your licence, and send your CV. It takes a few minutes.",
        url: "/careers/nurse-for-schools/apply",
        type: "website",
        siteName: "Al Hidaya Health Care Services",
      },
    });
    expect(await getApplyMetadata(null)).toMatchObject({
      title: "A general application",
      alternates: { canonical: "/careers/apply" },
    });
    for (const slug of ["clinic-nurse", "school-nurse", "no-such-job"]) {
      expect(await getApplyMetadata(slug, AT), slug).toEqual({});
    }
  });

  it("draws a job's share picture, and Careers' own for an address it does not have", async () => {
    for (const slug of ["clinic-nurse", "no-such-job"]) {
      const image = await getJobShareImage(slug);
      expect(image.headers.get("content-type"), slug).toBe("image/png");
    }
  });

  it("draws the general application's share picture", async () => {
    expect((await getGeneralApplicationShareImage()).headers.get("content-type")).toBe("image/png");
  });
});
