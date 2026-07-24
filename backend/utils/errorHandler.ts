import type { Response } from "express";

interface ErrorResponseBody {
  msg: string;
  details?: unknown;
}

/**
 * Tạo response lỗi chuẩn hóa
 */
export function errorResponse(res: Response, status: number, message: string, details: unknown = null): Response {
  const response: ErrorResponseBody = { msg: message };
  if (details) {
    response.details = details;
  }
  return res.status(status).json(response);
}

/**
 * Xử lý lỗi không tìm thấy resource
 */
export function notFoundResponse(res: Response, resourceName = "Resource"): Response {
  return errorResponse(res, 404, `Không tìm thấy ${resourceName}`);
}

/**
 * Xử lý lỗi server
 */
export function serverErrorResponse(res: Response, err: unknown, customMessage = "Lỗi server"): Response {
  const error = err as { message?: string; stack?: string };
  console.error("Server Error:", error?.message || err);
  if (error?.stack) {
    console.error(error.stack);
  }
  return errorResponse(res, 500, customMessage);
}

/**
 * Xử lý lỗi validation
 */
export function validationErrorResponse(res: Response, message: string): Response {
  return errorResponse(res, 400, message);
}

/**
 * Xử lý lỗi ObjectId không hợp lệ
 * @returns True nếu là lỗi ObjectId
 */
export function handleObjectIdError(err: unknown, res: Response, resourceName = "Resource"): boolean {
  const error = err as { kind?: string; name?: string };
  if (error?.kind === "ObjectId" || error?.name === "CastError") {
    notFoundResponse(res, resourceName);
    return true;
  }
  return false;
}
