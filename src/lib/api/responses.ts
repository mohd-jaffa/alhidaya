import { NextResponse } from "next/server";

import { type ErrorMessageCode, getErrorMessage } from "@/constants/messages";
import type { AppError } from "@/lib/errors";

/**
 * The two shapes every endpoint answers with (AGENTS.md §14). Built here and
 * nowhere else, so the contract cannot drift route by route.
 */
export interface ApiSuccessPayload<TData> {
  success: true;
  data: TData;
}

export interface ApiErrorPayload {
  success: false;
  error: {
    code: ErrorMessageCode;
    message: string;
    requestId: string;
    details?: unknown;
  };
}

export function buildErrorPayload(error: AppError, requestId: string): ApiErrorPayload {
  return {
    success: false,
    error: { code: error.code, message: getErrorMessage(error.code), requestId, details: error.details },
  };
}

/**
 * Every answer names its request, and none is kept by a browser or a proxy:
 * an answer may carry personal data (AGENTS.md §8). Nor may a browser guess a
 * type the server did not declare.
 */
function headers(requestId: string) {
  return { "x-request-id": requestId, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
}

export function successResponse<TData>(
  data: TData,
  requestId: string,
  status = 200,
): NextResponse<ApiSuccessPayload<TData>> {
  return NextResponse.json({ success: true, data } as const, { status, headers: headers(requestId) });
}

export function errorResponse(error: AppError, requestId: string): NextResponse<ApiErrorPayload> {
  return NextResponse.json(buildErrorPayload(error, requestId), {
    status: error.httpStatus,
    headers: headers(requestId),
  });
}

/**
 * A private file for the signed-in admin (plan §9.4): always saved, never
 * shown in the browser, never kept by a browser or a proxy, its type never
 * guessed, and nothing in it allowed to run.
 */
export function fileResponse(
  file: { bytes: Uint8Array; filename: string; contentType: string },
  requestId: string,
): Response {
  return new Response(new Uint8Array(file.bytes), {
    status: 200,
    headers: {
      ...headers(requestId),
      "Content-Type": file.contentType,
      "Content-Length": String(file.bytes.byteLength),
      "Content-Disposition": `attachment; filename="${file.filename.replace(/[^A-Za-z0-9._-]/g, "_")}"`,
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
