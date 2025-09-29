require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const ebookRoutes = require('./routes/ebookRoutes');
const konoranoRoutes = require('./routes/konoranoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publisherRoutes = require('./routes/publisherRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const connectDB = require('./config/db');
const {
    apiLimiter,
    uploadLimiter
} = require('./middleware/security');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(compression({
    threshold: 1024, // Chỉ nén các response > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3002', process.env.FRONTEND_URL],
    credentials: true
}));

// CSRF protection
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
});

// Áp dụng CSRF protection cho các route admin
app.use('/api/admin', csrfProtection);

// Connect to MongoDB
connectDB();

// Áp dụng rate limiting cho các routes
app.use('/api/ebooks', apiLimiter);
app.use('/api/ebooks/upload', uploadLimiter);
app.use('/api/konoranos', apiLimiter);
app.use('/api/konoranos/upload', uploadLimiter);

// Routes
app.use('/api/ebooks', ebookRoutes);
app.use('/api/konoranos', konoranoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/publishers', publisherRoutes);
app.use('/api/subscribers', subscriberRoutes);

// Serve reader
app.use('/reader', express.static(path.join(__dirname, 'reader')));
app.use('/uploads/covers', express.static(path.join(__dirname, 'uploads', 'covers')));

app.use('/uploads/ebooks', (req, res, next) => {
    const referer = req.get('referer');
    if (!referer) {
        return res.status(403).sendFile(path.join(__dirname, 'error', '403.html'));
    }
    try {
        const refererUrl = new URL(referer);
        const host = req.get('host');
        if (refererUrl.host === host && (refererUrl.pathname.startsWith('/reader') || refererUrl.pathname.startsWith('/admin'))) {
            return express.static(path.join(__dirname, 'uploads', 'ebooks'))(req, res, next);
        }
    } catch (error) {
        console.error('Invalid referer URL:', error);
    }
    res.status(403).sendFile(path.join(__dirname, 'error', '403.html'));
});

app.get('/reader', (req, res, next) => {
    if (req.query.book) {
        return res.sendFile(path.join(__dirname, 'reader', 'index.html'));
    }
    next();
});

app.get('/reader/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'reader', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            msg: 'CSRF token không hợp lệ'
        });
    }
    console.error(err.stack);
    res.status(500).json({ msg: 'Lỗi server' });
});

app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});