const Konorano = require('../models/Konorano');
const path = require('path');
const fs = require('fs');
const { clearCache } = require('../middleware/cache');
const { sendNotification } = require('./subscriberController');

// Lấy tất cả konorano
exports.getAllKonoranos = async (req, res) => {
    try {
        const konoranos = await Konorano.find().select('-__v');
        res.json(konoranos);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi server');
    }
};

// Lấy konorano theo ID
exports.getKonoranoById = async (req, res) => {
    try {
        const konorano = await Konorano.findById(req.params.id);
        if (!konorano) {
            return res.status(404).json({ msg: 'Không tìm thấy konorano' });
        }
        res.json(konorano);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Không tìm thấy konorano' });
        }
        res.status(500).send('Lỗi server');
    }
};

// Tạo konorano mới
exports.createKonorano = async (req, res) => {
    try {
        const { name, author, releaseDate, viURL } = req.body;

        // Kiểm tra file upload
        if (!req.files || !req.files.cover || !req.files.konorano) {
            return res.status(400).json({ msg: 'Cần upload cả cover và file konorano' });
        }

        const coverFile = req.files.cover[0];
        const konoranoFile = req.files.konorano[0];

        const newKonorano = new Konorano({
            name,
            author: author || '宝島社', // Sử dụng giá trị nhập hoặc mặc định
            coverImage: coverFile.filename,
            filePath: konoranoFile.filename,
            releaseDate,
            viURL
        });

        const konorano = await newKonorano.save();

        // Xóa cache cho danh sách konorano
        await clearCache('cache:/api/konoranos*');

        // Gửi thông báo cho subscribers
        await sendNotification(name);

        res.json(konorano);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi server');
    }
};

// Cập nhật konorano
exports.updateKonorano = async (req, res) => {
    try {
        const { name, author, releaseDate, viURL } = req.body;

        const konoranoFields = {
            name,
            releaseDate,
            viURL,
            updatedAt: Date.now()
        };

        // Chỉ cập nhật author nếu có giá trị được cung cấp
        if (author) {
            konoranoFields.author = author;
        }

        // Kiểm tra nếu có file cover mới
        if (req.files && req.files.cover) {
            const coverFile = req.files.cover[0];
            konoranoFields.coverImage = coverFile.filename;

            // Xóa file cover cũ
            const oldKonorano = await Konorano.findById(req.params.id);
            if (oldKonorano && oldKonorano.coverImage !== 'default-cover.jpg') {
                const oldPath = path.join(__dirname, '../uploads/covers', oldKonorano.coverImage);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }

        // Kiểm tra nếu có file konorano mới
        if (req.files && req.files.konorano) {
            const konoranoFile = req.files.konorano[0];
            konoranoFields.filePath = konoranoFile.filename;

            // Xóa file konorano cũ
            const oldKonorano = await Konorano.findById(req.params.id);
            if (oldKonorano) {
                const oldPath = path.join(__dirname, '../uploads/ebooks', oldKonorano.filePath);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }

        let konorano = await Konorano.findById(req.params.id);
        if (!konorano) {
            return res.status(404).json({ msg: 'Không tìm thấy konorano' });
        }

        konorano = await Konorano.findByIdAndUpdate(
            req.params.id,
            { $set: konoranoFields },
            { new: true }
        );

        // Xóa cache cho danh sách konorano và konorano cụ thể
        await clearCache('cache:/api/konoranos*');

        res.json(konorano);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi server');
    }
};

// Xóa konorano
exports.deleteKonorano = async (req, res) => {
    try {
        const konorano = await Konorano.findById(req.params.id);
        if (!konorano) {
            return res.status(404).json({ msg: 'Không tìm thấy konorano' });
        }

        // Xóa các file đi kèm
        if (konorano.coverImage !== 'default-cover.jpg') {
            const coverPath = path.join(__dirname, '../uploads/covers', konorano.coverImage);
            if (fs.existsSync(coverPath)) {
                fs.unlinkSync(coverPath);
            }
        }

        const konoranoPath = path.join(__dirname, '../uploads/ebooks', konorano.filePath);
        if (fs.existsSync(konoranoPath)) {
            fs.unlinkSync(konoranoPath);
        }

        await Konorano.findByIdAndRemove(req.params.id);

        // Xóa cache cho danh sách konorano
        await clearCache('cache:/api/konoranos*');

        res.json({ msg: 'Konorano đã được xóa' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi server');
    }
};
