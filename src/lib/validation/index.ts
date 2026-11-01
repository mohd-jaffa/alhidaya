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

export { activityQuerySchema, type ActivityQueryInput, type ActivityQueryPayload } from "./schemas/activity";

export {
  applicationFormSchema,
  applicationListQuerySchema,
  applicationNoteSchema,
  applicationStatusSchema,
  GENERAL_APPLICATIONS,
  type ApplicationFormInput,
  type ApplicationFormPayload,
  type ApplicationListQueryInput,
  type ApplicationListQueryPayload,
  type ApplicationNoteInput,
  type ApplicationNotePayload,
  type ApplicationStatusInput,
  type ApplicationStatusPayload,
} from "./schemas/applications";

export {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  changePasswordSchema,
  profileNameSchema,
  type ChangePasswordInput,
  type ChangePasswordPayload,
  type ProfileNameInput,
  type ProfileNamePayload,
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
  shortQuoteFormSchema,
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
  type ShortQuoteFormInput,
  type ShortQuoteFormPayload,
} from "./schemas/enquiries";

export { todayQuerySchema, type TodayQueryInput, type TodayQueryPayload } from "./schemas/inbox";

export {
  NO_HERO,
  pageDocumentSchema,
  sectionSchema,
  type PageDocument,
  type PageDocumentInput,
  type Section,
  type SectionInput,
} from "./schemas/pages";

export {
  brochureFileSchema,
  imageDetailsSchema,
  imageFileSchema,
  type ImageDetailsInput,
  type ImageDetailsPayload,
} from "./schemas/media";

export { previewQuerySchema, type PreviewQueryPayload } from "./schemas/preview";

export {
  archiveSchema,
  clientDocumentSchema,
  closeSchema,
  jobDocumentSchema,
  serviceDocumentSchema,
  type ArchivePayload,
  type ClosePayload,
  type ClientDocument,
  type ClientDocumentInput,
  type JobDocument,
  type JobDocumentInput,
  type ServiceDocument,
  type ServiceDocumentInput,
} from "./schemas/records";

export {
  operationsSchema,
  orderingDocumentSchema,
  siteDocumentSchema,
  type OperationsInput,
  type OperationsPayload,
  type OrderingDocument,
  type SiteDocument,
  type SiteDocumentInput,
} from "./schemas/site";
