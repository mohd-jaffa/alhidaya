import { describe, expect, it } from "vitest";

import {
  APPLICATION_STATUSES,
  CARE_FOR,
  CARE_FOR_LABELS,
  CONTACT_METHOD_LABELS,
  CONTACT_METHODS,
  AUDIT_ACTIONS,
  CV_STATUSES,
  EMAIL_STATUS_LABELS,
  EMAIL_STATUSES,
  ENQUIRY_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  ENQUIRY_STATUSES,
  ERROR_SOURCES,
  FORM_KINDS,
  MEDIA_KINDS,
  RECORD_COLLECTIONS,
  SOCIAL_NETWORK_LABELS,
  SOCIAL_NETWORKS,
} from "@/constants/statuses";

describe("the vocabularies", () => {
  it("have no repeats and fit their columns", () => {
    for (const [list, width] of [
      [AUDIT_ACTIONS, 32],
      [ERROR_SOURCES, 16],
      [RECORD_COLLECTIONS, 16],
      [MEDIA_KINDS, 8],
      [FORM_KINDS, 8],
      [ENQUIRY_STATUSES, 16],
      [APPLICATION_STATUSES, 16],
      [EMAIL_STATUSES, 8],
      [CV_STATUSES, 16],
    ] as const) {
      expect(new Set(list).size).toBe(list.length);
      for (const value of list) expect(value.length).toBeLessThanOrEqual(width);
    }
  });

  it("record the admin's CV downloads (plan §9.4)", () => {
    expect(AUDIT_ACTIONS).toContain("CV_DOWNLOAD");
  });

  it("start every submission new, with its email and CV still to come (plan §9.3, §10.4)", () => {
    expect([ENQUIRY_STATUSES[0], APPLICATION_STATUSES[0]]).toEqual(["NEW", "NEW"]);
    expect([EMAIL_STATUSES[0], CV_STATUSES[0]]).toEqual(["PENDING", "PENDING"]);
  });

  it("name every social network the footer may link", () => {
    expect(Object.keys(SOCIAL_NETWORK_LABELS)).toEqual([...SOCIAL_NETWORKS]);
    expect(Object.keys(EMPLOYMENT_TYPE_LABELS)).toEqual([...EMPLOYMENT_TYPES]);
  });

  it("word every choice of the Quote form, as the plan lists them (plan §10.1)", () => {
    expect(Object.values(CARE_FOR_LABELS)).toEqual(["My family", "A hospital", "A clinic", "A school", "Other"]);
    expect(Object.keys(CARE_FOR_LABELS)).toEqual([...CARE_FOR]);
    expect(Object.keys(CONTACT_METHOD_LABELS)).toEqual([...CONTACT_METHODS]);
  });

  it("word where an enquiry stands and whether its alert went, for the inbox (plan §10.5)", () => {
    expect(Object.keys(ENQUIRY_STATUS_LABELS)).toEqual([...ENQUIRY_STATUSES]);
    expect(Object.keys(EMAIL_STATUS_LABELS)).toEqual([...EMAIL_STATUSES]);
  });
});
