/**
 * The site's validation, in one place (AGENTS.md §12). Each form's schema is
 * declared once in ./schemas (from Phase 1), built from these primitives; the
 * form that fills it and the route that accepts it use the same declaration.
 * Nothing under src/features declares a schema of its own.
 */
export {
  EMAIL,
  optionalEmail,
  optionalLine,
  optionalLines,
  optionalPhone,
  requiredEmail,
  requiredLine,
  requiredLines,
  requiredPhone,
} from "./primitives";

export { applicationFormSchema, type ApplicationFormInput, type ApplicationFormPayload } from "./schemas/applications";

export {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  type ForgotPasswordInput,
  type ForgotPasswordPayload,
  type ResetPasswordInput,
  type ResetPasswordPayload,
  type SignInInput,
  type SignInPayload,
} from "./schemas/auth";

export {
  hrefSchema,
  httpsUrlSchema,
  imageRefSchema,
  isoDateSchema,
  isSafeHref,
  localized,
  richTextSchema,
  seoSchema,
  slugSchema,
  type RichText,
} from "./schemas/content";

export {
  contactFormSchema,
  enquiryListQuerySchema,
  enquiryNoteSchema,
  enquirySchema,
  enquiryStatusSchema,
  quoteFormSchema,
  type ContactFormInput,
  type ContactFormPayload,
  type EnquiryInput,
  type EnquiryListQueryInput,
  type EnquiryListQueryPayload,
  type EnquiryNoteInput,
  type EnquiryNotePayload,
  type EnquiryPayload,
  type EnquiryStatusInput,
  type EnquiryStatusPayload,
  type QuoteFormInput,
  type QuoteFormPayload,
} from "./schemas/enquiries";

export { pageDocumentSchema, sectionSchema, type PageDocument, type Section } from "./schemas/pages";

export { previewQuerySchema, type PreviewQueryPayload } from "./schemas/preview";

export {
  clientDocumentSchema,
  jobDocumentSchema,
  serviceDocumentSchema,
  type ClientDocument,
  type JobDocument,
  type ServiceDocument,
} from "./schemas/records";

export {
  operationsSchema,
  orderingDocumentSchema,
  siteDocumentSchema,
  type OperationsInput,
  type OperationsPayload,
  type OrderingDocument,
  type SiteDocument,
} from "./schemas/site";
