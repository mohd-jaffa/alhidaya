import { describe, expect, it } from "vitest";

import * as validation from "@/lib/validation";

describe("the validation module", () => {
  it("offers the primitives and the schemas", () => {
    expect(Object.keys(validation).sort()).toEqual([
      "EMAIL",
      "applicationFormSchema",
      "clientDocumentSchema",
      "contactFormSchema",
      "enquiryListQuerySchema",
      "enquiryNoteSchema",
      "enquirySchema",
      "enquiryStatusSchema",
      "forgotPasswordSchema",
      "hrefSchema",
      "httpsUrlSchema",
      "imageRefSchema",
      "isSafeHref",
      "isoDateSchema",
      "jobDocumentSchema",
      "localized",
      "operationsSchema",
      "optionalEmail",
      "optionalLine",
      "optionalLines",
      "optionalPhone",
      "orderingDocumentSchema",
      "pageDocumentSchema",
      "previewQuerySchema",
      "quoteFormSchema",
      "requiredEmail",
      "requiredLine",
      "requiredLines",
      "requiredPhone",
      "resetPasswordSchema",
      "richTextSchema",
      "sectionSchema",
      "seoSchema",
      "serviceDocumentSchema",
      "signInSchema",
      "siteDocumentSchema",
      "slugSchema",
    ]);
  });
});
