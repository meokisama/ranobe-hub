import Bottleneck from "bottleneck";
import { Resend } from "resend";
import Subscriber from "../models/Subscriber.js";
import { serverErrorResponse, validationErrorResponse, notFoundResponse } from "../utils/errorHandler.js";
import { verifyUnsubscribeToken } from "../utils/unsubscribeToken.js";
import { buildAdminNotifyEmail, buildConfirmationEmail, buildNewBookEmail } from "../utils/emailTemplates.js";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend giới hạn 100 email mỗi batch và 2 request mỗi giây
const BATCH_SIZE = 100;

// Bottleneck
const limiter = new Bottleneck({
  minTime: 800,
  maxConcurrent: 1,
});

// Gửi danh sách email theo từng batch tối đa 100 email
const sendBatched = async (emails) => {
  if (!emails.length) return;
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    try {
      const { error } = await limiter.schedule(() => resend.batch.send(chunk));
      if (error) {
        console.error(`Resend batch error (chunk ${i / BATCH_SIZE + 1}, ${chunk.length} emails):`, error);
      }
    } catch (err) {
      console.error("Resend batch threw:", err);
    }
  }
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
        sendBatched([buildConfirmationEmail(email, isReactivation), buildAdminNotifyEmail(email)]);
      });

      return res.status(200).json({ msg: "Đăng ký thành công" });
    }

    // Tạo subscriber mới
    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // Gộp 2 email vào 1 batch để chỉ tốn 1 request, gửi background
    setImmediate(() => {
      sendBatched([buildConfirmationEmail(email, false), buildAdminNotifyEmail(email)]);
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

    const emails = subscribers.map((subscriber) => buildNewBookEmail(subscriber.email, bookTitle));

    await sendBatched(emails);
  } catch (error) {
    console.error("Send notification error:", error);
  }
};
