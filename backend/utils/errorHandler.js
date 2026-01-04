/**
 * Tạo response lỗi chuẩn hóa
 * @param {object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @param {object} details - Optional error details
 */
function errorResponse(res, status, message, details = null) {
  const response = { msg: message };
  if (details) {
    response.details = details;
  }
  return res.status(status).json(response);
}

/**
 * Xử lý lỗi không tìm thấy resource
 * @param {object} res - Express response object
 * @param {string} resourceName - Tên resource (ebook, konorano, etc.)
 */
function notFoundResponse(res, resourceName = "Resource") {
  return errorResponse(res, 404, `Không tìm thấy ${resourceName}`);
}

/**
 * Xử lý lỗi server
 * @param {object} res - Express response object
 * @param {object} err - Error object
 * @param {string} customMessage - Custom error message
 */
function serverErrorResponse(res, err, customMessage = "Lỗi server") {
  console.error("Server Error:", err.message || err);
  if (err.stack) {
    console.error(err.stack);
  }
  return errorResponse(res, 500, customMessage);
}

/**
 * Xử lý lỗi validation
 * @param {object} res - Express response object
 * @param {string} message - Validation error message
 */
function validationErrorResponse(res, message) {
  return errorResponse(res, 400, message);
}

/**
 * Xử lý lỗi ObjectId không hợp lệ
 * @param {object} err - Error object
 * @param {object} res - Express response object
 * @param {string} resourceName - Tên resource
 * @returns {boolean} - True nếu là lỗi ObjectId
 */
function handleObjectIdError(err, res, resourceName = "Resource") {
  if (err.kind === "ObjectId" || err.name === "CastError") {
    notFoundResponse(res, resourceName);
    return true;
  }
  return false;
}

module.exports = {
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
  validationErrorResponse,
  handleObjectIdError,
};
