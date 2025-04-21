const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const adminAuth = require('../middleware/adminAuth');
const konoranoController = require('../controllers/konoranoController');
const { cache } = require('../middleware/cache');

// Tạo thư mục upload nếu chưa tồn tại
const createUploadDirs = () => {
    const dirs = [
        path.join(__dirname, '../uploads'),
        path.join(__dirname, '../uploads/covers'),
        path.join(__dirname, '../uploads/ebooks')
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
};

// Gọi hàm tạo thư mục
createUploadDirs();

// Cấu hình Multer cho upload file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = '';
        if (file.fieldname === 'cover') {
            uploadPath = path.join(__dirname, '../uploads/covers');
        } else if (file.fieldname === 'konorano') {
            uploadPath = path.join(__dirname, '../uploads/ebooks');
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const newFilename = `${uuidv4()}${ext}`;
        cb(null, newFilename);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.fieldname === 'cover') {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
            }
        } else if (file.fieldname === 'konorano') {
            if (!file.originalname.match(/\.(epub|pdf)$/)) {
                return cb(new Error('Chỉ chấp nhận file .epub hoặc .pdf!'), false);
            }
        }
        cb(null, true);
    }
});

const uploadFields = upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'konorano', maxCount: 1 }
]);

// @route   GET api/konoranos
// @desc    Lấy tất cả konorano
// @access  Public
router.get('/', cache(300), konoranoController.getAllKonoranos);

// @route   GET api/konoranos/:id
// @desc    Lấy konorano theo ID
// @access  Public
router.get('/:id', cache(600), konoranoController.getKonoranoById);

// @route   POST api/konoranos
// @desc    Tạo konorano mới
// @access  Admin
router.post('/', [adminAuth, uploadFields], konoranoController.createKonorano);

// @route   PUT api/konoranos/:id
// @desc    Cập nhật konorano
// @access  Admin
router.put('/:id', [adminAuth, uploadFields], konoranoController.updateKonorano);

// @route   DELETE api/konoranos/:id
// @desc    Xóa konorano
// @access  Admin
router.delete('/:id', adminAuth, konoranoController.deleteKonorano);

module.exports = router;
