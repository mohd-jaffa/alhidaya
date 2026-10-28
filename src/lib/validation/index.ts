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
