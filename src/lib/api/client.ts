import { ERROR_MESSAGES, type ErrorMessageCode } from "@/constants/messages";

/**
 * How the browser talks to the API (AGENTS.md §14). One place unwraps the
 * success envelope and turns a failure envelope back into an error carrying
 * the server's own wording, so a feature's client module is a list of
 * endpoints and nothing else. Nothing here attaches a token: the admin's
 * session travels in HttpOnly cookies the browser sends on its own.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorMessageCode | "UNKNOWN_ERROR",
    message: string,
    readonly requestId?: string,
    /** What the refusal names: the fields that went wrong. */
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiEnvelope<T> {
  data?: T;
  error?: { code?: ErrorMessageCode; message?: string; requestId?: string; details?: unknown };
}

/** The server could not be reached: offline for certain, or online and still not answering. */
function unreached(): ApiError {
  const code = navigator.onLine ? "NETWORK_UNREACHABLE" : "NETWORK_OFFLINE";
  return new ApiError(0, code, ERROR_MESSAGES[code]);
}

async function send<T>(url: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { credentials: "same-origin", ...init });
  } catch (failure) {
    // A request that never reached the server; anything else is not ours to answer.
    if (failure instanceof TypeError) throw unreached();
    throw failure;
  }
  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok) {
    throw new ApiError(
      response.status,
      body.error?.code ?? "UNKNOWN_ERROR",
      body.error?.message ?? ERROR_MESSAGES.INTERNAL_ERROR,
      body.error?.requestId,
      body.error?.details,
    );
  }
  return body.data as T;
}

const json =
  (method: string) =>
  <T>(url: string, payload?: unknown): Promise<T> =>
    send<T>(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });

export const getJson = <T>(url: string) => send<T>(url, { method: "GET" });

/** What SWR reads an address with (src/lib/query): the same unwrapping and the same errors. */
export const fetcher = <T>(url: string) => getJson<T>(url);
export const postJson = json("POST");
export const patchJson = json("PATCH");
export const putJson = json("PUT");
export const deleteJson = json("DELETE");

/**
 * A form with files (a CV, an image): the browser sets the multipart boundary
 * itself, so no content type is given here.
 */
export const postForm = <T>(url: string, form: FormData) => send<T>(url, { method: "POST", body: form });
