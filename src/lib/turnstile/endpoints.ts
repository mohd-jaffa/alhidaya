/**
 * Cloudflare Turnstile's addresses (plan §10.3). The script is loaded from
 * Cloudflare as it is, never copied or cached by the site, as Cloudflare
 * requires; the server checks each token with siteverify.
 */
export const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
export const TURNSTILE_SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** The form field the widget writes its token into, and the route reads it from. */
export const TURNSTILE_FIELD = "turnstileToken";
