import Bottleneck from "bottleneck";
import { Resend } from "resend";
import Subscriber from "../models/Subscriber.js";
import { serverErrorResponse, validationErrorResponse, notFoundResponse } from "../utils/errorHandler.js";
import { signUnsubscribeToken, verifyUnsubscribeToken } from "../utils/unsubscribeToken.js";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM;

// Resend giới hạn 100 email mỗi batch và 2 request mỗi giây
const BATCH_SIZE = 100;

// Bottleneck: tối đa 2 request mỗi giây, không bao giờ vượt limit của Resend
const limiter = new Bottleneck({
  reservoir: 2,
  reservoirRefreshAmount: 2,
  reservoirRefreshInterval: 1000,
  maxConcurrent: 2,
});

// Gửi danh sách email theo từng batch tối đa 100 email
const sendBatched = async (emails) => {
  if (!emails.length) return;
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    try {
      const { error } = await limiter.schedule(() => resend.batch.send(chunk));
      if (error) {
        console.error(
          `Resend batch error (chunk ${i / BATCH_SIZE + 1}, ${chunk.length} emails):`,
          error
        );
      }
    } catch (err) {
      console.error("Resend batch threw:", err);
    }
  }
};

// Tạo payload email thông báo cho admin
const buildAdminNotifyEmail = (subscriberEmail) => ({
  from: FROM,
  to: [process.env.ADMIN_EMAIL],
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

// Tạo payload email xác nhận cho subscriber
const buildConfirmationEmail = (email, isReactivation = false) => {
  const unsubscribeToken = signUnsubscribeToken(email);
  const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
  return {
    from: FROM,
    to: [email],
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
                    <a href="${unsubscribeUrl}"
                       style="display: inline-block; margin-top: 10px; padding: 8px 16px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 4px;">
                        Hủy đăng ký
                    </a>
                </div>
            </div>
        </div>
      `,
  };
};

// Đăng ký nhận tin
export const subscribe = async (req, res) => {
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

      // Gộp 2 email vào 1 batch để chỉ tốn 1 request, gửi background
      setImmediate(() => {
        sendBatched([
          buildConfirmationEmail(email, isReactivation),
          buildAdminNotifyEmail(email),
        ]);
      });

      return res.status(200).json({ msg: "Đăng ký thành công" });
    }

    // Tạo subscriber mới
    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // Gộp 2 email vào 1 batch để chỉ tốn 1 request, gửi background
    setImmediate(() => {
      sendBatched([
        buildConfirmationEmail(email, false),
        buildAdminNotifyEmail(email),
      ]);
    });

    res.status(201).json({ msg: "Đăng ký thành công" });
  } catch (error) {
    console.error("Subscribe error:", error);
    return serverErrorResponse(res, error, "Có lỗi xảy ra khi đăng ký");
  }
};

// Hủy đăng ký
export const unsubscribe = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return validationErrorResponse(res, "Token không hợp lệ");
    }

    let email;
    try {
      email = verifyUnsubscribeToken(token);
    } catch (err) {
      return validationErrorResponse(res, "Token không hợp lệ hoặc đã hết hạn");
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

    res.json({ msg: "Hủy đăng ký thành công" });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return serverErrorResponse(res, error, "Có lỗi xảy ra khi hủy đăng ký");
  }
};

// Gửi thông báo cho tất cả subscribers
export const sendNotification = async (bookTitle) => {
  try {
    const subscribers = await Subscriber.find({ isActive: true });
    if (!subscribers.length) return;

    const html = `
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
        `;

    const emails = subscribers.map((subscriber) => ({
      from: FROM,
      to: [subscriber.email],
      subject: "Có sách mới!",
      html,
    }));

    await sendBatched(emails);
  } catch (error) {
    console.error("Send notification error:", error);
  }
};
