const Subscriber = require('../models/Subscriber');
const nodemailer = require('nodemailer');

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        ciphers: 'SSLv3'
    }
});

// Gửi email thông báo cho admin
const notifyAdmin = async (subscriberEmail) => {
    try {
        await transporter.sendMail({
            from: `"【Ranobe Reader】Ranobe.vn" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: 'Có người đăng ký mới!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h1 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">🎉 Người đăng ký mới!</h1>
            <div style="background-color: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="margin: 10px 0;"><strong>Email:</strong> ${subscriberEmail}</p>
                <p style="margin: 10px 0;"><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
            </div>
        </div>
      `
        });
    } catch (error) {
        console.error('Admin notification error:', error);
    }
};

// Đăng ký nhận tin
exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        // Kiểm tra email đã tồn tại chưa
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                return res.status(400).json({ message: 'Email này đã được đăng ký trước đó' });
            } else {
                // Nếu email tồn tại nhưng không active, cập nhật lại thành active
                existingSubscriber.isActive = true;
                await existingSubscriber.save();
                res.status(200).json({ message: 'Đăng ký thành công' });
            }
        } else {
            // Tạo subscriber mới
            const subscriber = new Subscriber({ email });
            await subscriber.save();
            res.status(201).json({ message: 'Đăng ký thành công' });
        }

        // Xử lý gửi email ở background
        (async () => {
            try {
                // Gửi email xác nhận cho người đăng ký
                const isReactivation = existingSubscriber && !existingSubscriber.isActive;
                await transporter.sendMail({
                    from: `"【Ranobe Reader】Ranobe.vn" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Đăng ký nhận tin thành công',
                    html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                    <h1 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">✨ Đăng ký thành công!</h1>
                    <div style="background-color: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <p style="margin: 15px 0; line-height: 1.6;">Bạn đã ${isReactivation ? 'đăng ký tiếp tục' : 'đăng ký'} nhận tin sách mới từ 【Ranobe Reader】Ranobe.vn! 🎉</p>
                        <p style="margin: 15px 0; line-height: 1.6;">Bạn sẽ là người đầu tiên được thông báo khi có sách mới được đăng tải. ( ๑ ˃ᴗ˂)و</p>
                        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
                            <p style="margin: 0;">Nếu bạn muốn hủy đăng ký, vui lòng click vào link sau:</p>
                            <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${email}" 
                               style="display: inline-block; margin-top: 10px; padding: 8px 16px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 4px;">
                                Hủy đăng ký
                            </a>
                        </div>
                    </div>
                </div>
              `
                });

                // Gửi thông báo cho admin
                await notifyAdmin(email);
            } catch (error) {
                console.error('Error sending emails:', error);
                // Không cần xử lý lỗi ở đây vì đã trả về response thành công
            }
        })();
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra' });
    }
};

// Hủy đăng ký
exports.unsubscribe = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email không hợp lệ' });
        }

        const subscriber = await Subscriber.findOne({ email });
        if (!subscriber) {
            return res.status(404).json({ message: 'Không tìm thấy email đăng ký' });
        }

        if (!subscriber.isActive) {
            return res.status(400).json({ message: 'Email này đã được hủy đăng ký trước đó' });
        }

        subscriber.isActive = false;
        await subscriber.save();

        res.json({ message: 'Hủy đăng ký thành công' });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra' });
    }
};

// Gửi thông báo cho tất cả subscribers
exports.sendNotification = async (bookTitle) => {
    try {
        const subscribers = await Subscriber.find({ isActive: true });

        for (const subscriber of subscribers) {
            await transporter.sendMail({
                from: `"【Ranobe Reader】Ranobe.vn" <${process.env.EMAIL_USER}>`,
                to: subscriber.email,
                subject: 'Có sách mới!',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
              <h1 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">📚 Sách mới đã ra mắt!</h1>
              <div style="background-color: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <p style="margin: 15px 0; line-height: 1.6;"><strong>「${bookTitle}」</strong> đã được đăng tải trên Ranobe Reader.</p>
                  <div style="margin: 20px 0; text-align: center;">
                      <a href="${process.env.FRONTEND_URL}" 
                         style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
                          Đọc ngay ( ๑ ˃ᴗ˂)و
                      </a>
                  </div>
              </div>
          </div>
        `
            });
        }
    } catch (error) {
        console.error('Send notification error:', error);
    }
}; 