import type { Response } from "express";

interface ErrorResponseBody {
  msg: string;
  details?: unknown;
}

/** Build a standardized error response. */
export function errorResponse(res: Response, status: number, message: string, details: unknown = null): Response {
  const response: ErrorResponseBody = { msg: message };
  if (details) {
    response.details = details;
  }
  return res.status(status).json(response);
}

export function notFoundResponse(res: Response, resourceName = "Resource"): Response {
  return errorResponse(res, 404, `Không tìm thấy ${resourceName}`);
}

export function serverErrorResponse(res: Response, err: unknown, customMessage = "Lỗi server"): Response {
  const error = err as { message?: string; stack?: string };
  console.error("Server Error:", error?.message || err);
  if (error?.stack) {
    console.error(error.stack);
  }
  return errorResponse(res, 500, customMessage);
}

export function validationErrorResponse(res: Response, message: string): Response {
  return errorResponse(res, 400, message);
}

/**
 * Handle an invalid ObjectId error.
 * @returns true if the error was an ObjectId/CastError
 */
export function handleObjectIdError(err: unknown, res: Response, resourceName = "Resource"): boolean {
  const error = err as { kind?: string; name?: string };
  if (error?.kind === "ObjectId" || error?.name === "CastError") {
    notFoundResponse(res, resourceName);
    return true;
  }
  return false;
}
