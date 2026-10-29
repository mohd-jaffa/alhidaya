import { describe, expect, it } from "vitest";

import { VALIDATION_MESSAGES } from "@/constants/messages";
import { operationsSchema, orderingDocumentSchema, siteDocumentSchema } from "@/lib/validation";
import { siteFixture } from "@tests/support/fixtures/content";

const first = (result: { error?: { issues: { message: string }[] } }) => result.error?.issues[0].message;

describe("the site's content", () => {
  it("is valid as its fixture, phones stored as E.164", () => {
    const parsed = siteDocumentSchema.parse(siteFixture({ contact: { ...siteFixture().contact, phone: "3130 6555" } }));
    expect(parsed.contact.phone).toBe("+97431306555");
  });

  it("refuses a network twice, and links that are not safe", () => {
    const twice = siteFixture().social.concat(siteFixture().social);
    expect(first(siteDocumentSchema.safeParse(siteFixture({ social: twice })))).toBe(
      VALIDATION_MESSAGES.noRepeats("Social links"),
    );
    expect(
      siteDocumentSchema.safeParse(
        siteFixture({ navigation: [{ label: { en: "X" }, href: "javascript:x", visible: true }] }),
      ).success,
    ).toBe(false);
    expect(
      first(siteDocumentSchema.safeParse(siteFixture({ contact: { ...siteFixture().contact, address: [] } }))),
    ).toBe(VALIDATION_MESSAGES.atLeastOne("The address"));
  });
});

describe("the office on the map", () => {
  const withPin = (mapPin: unknown) => siteFixture({ contact: { ...siteFixture().contact, mapPin } as never });

  it("is a spot on the earth, or none until the client confirms it", () => {
    expect(siteDocumentSchema.parse(withPin({ lat: 25.2827, lon: 51.4959 })).contact.mapPin).toEqual({
      lat: 25.2827,
      lon: 51.4959,
    });
    expect(siteDocumentSchema.parse(withPin(null)).contact.mapPin).toBeNull();
  });

  it("refuses a latitude or longitude that is not one", () => {
    expect(first(siteDocumentSchema.safeParse(withPin({ lat: 91, lon: 51 })))).toBe(
      VALIDATION_MESSAGES.between("Latitude", -90, 90),
    );
    expect(first(siteDocumentSchema.safeParse(withPin({ lat: 25, lon: -181 })))).toBe(
      VALIDATION_MESSAGES.between("Longitude", -180, 180),
    );
    expect(first(siteDocumentSchema.safeParse(withPin({ lat: "north", lon: 51 })))).toBe(
      VALIDATION_MESSAGES.between("Latitude", -90, 90),
    );
  });
});

describe("an order", () => {
  it("names each record once", () => {
    const id = crypto.randomUUID();
    expect(orderingDocumentSchema.parse([id])).toEqual([id]);
    expect(first(orderingDocumentSchema.safeParse([id, id]))).toBe(VALIDATION_MESSAGES.noRepeats("An order"));
  });
});

describe("how the site runs", () => {
  const valid = {
    enquiriesTo: ["info@alhidaya.qa"],
    applicationsTo: ["hr@alhidaya.qa"],
    retentionDays: 180,
    cvExpiryDays: 90,
  };

  it("keeps retention and CV expiry within a year (plan D24, D52)", () => {
    expect(operationsSchema.parse(valid)).toEqual(valid);
    const days = VALIDATION_MESSAGES.between("Retention", 1, 365);
    for (const retentionDays of [0, 366, 1.5, "180"])
      expect(first(operationsSchema.safeParse({ ...valid, retentionDays })), String(retentionDays)).toBe(days);
    expect(first(operationsSchema.safeParse({ ...valid, cvExpiryDays: 400 }))).toBe(
      VALIDATION_MESSAGES.between("CV expiry", 1, 365),
    );
  });

  it("sends to one to five addresses, none twice", () => {
    expect(first(operationsSchema.safeParse({ ...valid, enquiriesTo: [] }))).toBe(
      VALIDATION_MESSAGES.atLeastOne("Enquiry recipients"),
    );
    expect(first(operationsSchema.safeParse({ ...valid, applicationsTo: Array(6).fill("hr@alhidaya.qa") }))).toBe(
      VALIDATION_MESSAGES.atMost("Application recipients", 5),
    );
    expect(first(operationsSchema.safeParse({ ...valid, enquiriesTo: ["a@b.qa", "A@B.qa"] }))).toBe(
      VALIDATION_MESSAGES.noRepeats("Enquiry recipients"),
    );
  });
});
