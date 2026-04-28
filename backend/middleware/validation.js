const { body, param, query, validationResult } = require("express-validator");
const { validationErrorResponse } = require("../utils/errorHandler");

// Middleware để xử lý validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return validationErrorResponse(res, firstError.msg);
  }
  next();
};

// Validation rules cho Ebook
const validateEbook = [
  body("name").trim().notEmpty().withMessage("Tên sách không được để trống").isLength({ max: 255 }).withMessage("Tên sách quá dài"),
  body("author").trim().notEmpty().withMessage("Tên tác giả không được để trống").isLength({ max: 100 }).withMessage("Tên tác giả quá dài"),
  body("illustrator").optional().trim().isLength({ max: 100 }).withMessage("Tên họa sĩ quá dài"),
  body("releaseDate").notEmpty().withMessage("Ngày phát hành không được để trống").isISO8601().toDate().withMessage("Ngày phát hành không hợp lệ"),
  body("publisher").notEmpty().withMessage("Nhãn hiệu không được để trống").isMongoId().withMessage("ID nhãn hiệu không hợp lệ"),
  handleValidationErrors,
];

// Validation rules cho Konorano
const validateKonorano = [
  body("name").trim().notEmpty().withMessage("Tên sách không được để trống").isLength({ max: 255 }).withMessage("Tên sách quá dài"),
  body("author").optional().trim().isLength({ max: 100 }).withMessage("Tên tác giả quá dài"),
  body("releaseDate").notEmpty().withMessage("Ngày phát hành không được để trống").isISO8601().toDate().withMessage("Ngày phát hành không hợp lệ"),
  body("viURL").trim().notEmpty().withMessage("URL bản dịch không được để trống").isURL().withMessage("URL không hợp lệ"),
  handleValidationErrors,
];

// Validation rules cho Publisher
const validatePublisher = [
  body("name").trim().notEmpty().withMessage("Tên nhãn hiệu không được để trống").isLength({ max: 100 }).withMessage("Tên nhãn hiệu quá dài"),
  handleValidationErrors,
];

// Validation rules cho Subscriber
const validateSubscriber = [
  body("email").trim().notEmpty().withMessage("Email không được để trống").isEmail().withMessage("Email không hợp lệ").normalizeEmail(),
  handleValidationErrors,
];

// Validation cho MongoDB ObjectId params
const validateObjectId = [param("id").isMongoId().withMessage("ID không hợp lệ"), handleValidationErrors];

// Validation cho token unsubscribe (JWT signed)
const validateUnsubscribeToken = [
  query("token").trim().notEmpty().withMessage("Token không được để trống").isLength({ max: 1024 }).withMessage("Token không hợp lệ"),
  handleValidationErrors,
];

// Validation cho pagination
const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page phải là số nguyên dương").toInt(),
  query("limit").optional().isInt({ min: 1, max: 1000 }).withMessage("Limit phải từ 1-1000").toInt(),
  handleValidationErrors,
];

module.exports = {
  validateEbook,
  validateKonorano,
  validatePublisher,
  validateSubscriber,
  validateObjectId,
  validateUnsubscribeToken,
  validatePagination,
  handleValidationErrors,
};
