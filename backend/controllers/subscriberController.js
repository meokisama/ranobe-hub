const Subscriber = require("../models/Subscriber");
const nodemailer = require("nodemailer");
const { serverErrorResponse, validationErrorResponse, notFoundResponse } = require("../utils/errorHandler");

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    ciphers: "TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384", // Modern TLS ciphers
  },
});

// Gửi email thông báo cho admin
const notifyAdmin = async (subscriberEmail) => {
  try {
    await transporter.sendMail({
      from: `"【Ranobe Hub】Ranobe.vn" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "Có người đăng ký mới!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h1 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Người đăng ký mới!</h1>
            <div style="background-color: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="margin: 10px 0;"><strong>Email:</strong> ${subscriberEmail}</p>
                <p style="margin: 10px 0;"><strong>Thời gian:</strong> ${new Date().toLocaleString("vi-VN")}</p>
            </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Admin notification error:", error);
  }
};

// Gửi email xác nhận cho subscriber
const sendConfirmationEmail = async (email, isReactivation = false) => {
  try {
    await transporter.sendMail({
      from: `"【Ranobe Hub】Ranobe.vn" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Đăng ký nhận tin thành công",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h1 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Đăng ký thành công!</h1>
            <div style="background-color: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="margin: 15px 0; line-height: 1.6;">Bạn đã ${
                  isReactivation ? "đăng ký tiếp tục" : "đăng ký"
                } nhận tin sách mới từ 【Ranobe Hub】Ranobe.vn! 🎉</p>
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
      `,
    });
  } catch (error) {
    console.error("Confirmation email error:", error);
  }
};

// Đăng ký nhận tin
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingSubscriber = await Subscriber.findOne({ email });

    let isReactivation = false;

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return validationErrorResponse(res, "Email này đã được đăng ký trước đó");
      }

      // Nếu email tồn tại nhưng không active, cập nhật lại thành active
      existingSubscriber.isActive = true;
      await existingSubscriber.save();
      isReactivation = true;

      // Gửi emails ở background (fix race condition)
      setImmediate(() => {
        sendConfirmationEmail(email, isReactivation);
        notifyAdmin(email);
      });

      return res.status(200).json({ message: "Đăng ký thành công" });
    }

    // Tạo subscriber mới
    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // Gửi emails ở background (fix race condition)
    setImmediate(() => {
      sendConfirmationEmail(email, false);
      notifyAdmin(email);
    });

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    console.error("Subscribe error:", error);
    return serverErrorResponse(res, error, "Có lỗi xảy ra khi đăng ký");
  }
};

// Hủy đăng ký
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return validationErrorResponse(res, "Email không hợp lệ");
    }

    const subscriber = await Subscriber.findOne({ email });
    if (!subscriber) {
      return notFoundResponse(res, "email đăng ký");
    }

    if (!subscriber.isActive) {
      return validationErrorResponse(res, "Email này đã được hủy đăng ký trước đó");
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.json({ message: "Hủy đăng ký thành công" });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return serverErrorResponse(res, error, "Có lỗi xảy ra khi hủy đăng ký");
  }
};

// Gửi thông báo cho tất cả subscribers
exports.sendNotification = async (bookTitle) => {
  try {
    const subscribers = await Subscriber.find({ isActive: true });

    // Gửi email song song với Promise.all thay vì tuần tự
    const emailPromises = subscribers.map((subscriber) =>
      transporter.sendMail({
        from: `"【Ranobe Hub】Ranobe.vn" <${process.env.EMAIL_USER}>`,
        to: subscriber.email,
        subject: "Có sách mới!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
              <h1 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Đã đăng tải sách mới!</h1>
              <div style="background-color: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <p style="margin: 15px 0; line-height: 1.6;"><strong>「${bookTitle}」</strong> đã được đăng tải trên Ranobe Hub.</p>
                  <div style="margin: 20px 0; text-align: center;">
                      <a href="${process.env.FRONTEND_URL}"
                         style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
                          Đọc ngay ( ๑ ˃ᴗ˂)و
                      </a>
                  </div>
              </div>
          </div>
        `,
      }).catch((err) => {
        console.error(`Failed to send email to ${subscriber.email}:`, err);
      })
    );

    await Promise.allSettled(emailPromises);
  } catch (error) {
    console.error("Send notification error:", error);
  }
};
