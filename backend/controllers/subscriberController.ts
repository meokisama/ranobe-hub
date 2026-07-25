import type { Request, Response } from "express";
import Bottleneck from "bottleneck";
import { Resend, type CreateBatchOptions } from "resend";
import Subscriber from "../models/Subscriber.js";
import { serverErrorResponse, validationErrorResponse, notFoundResponse } from "../utils/errorHandler.js";
import { verifyUnsubscribeToken } from "../utils/unsubscribeToken.js";
import { buildAdminNotifyEmail, buildConfirmationEmail, buildNewBookEmail, type EmailPayload } from "../utils/emailTemplates.js";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend limits: 100 emails per batch, 2 requests per second
const BATCH_SIZE = 100;

const limiter = new Bottleneck({
  minTime: 800,
  maxConcurrent: 1,
});

// Send emails in batches of up to 100
const sendBatched = async (emails: EmailPayload[]): Promise<void> => {
  if (!emails.length) return;
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    try {
      const { error } = await limiter.schedule(() => resend.batch.send(chunk as CreateBatchOptions));
      if (error) {
        console.error(`Resend batch error (chunk ${i / BATCH_SIZE + 1}, ${chunk.length} emails):`, error);
      }
    } catch (err) {
      console.error("Resend batch threw:", err);
    }
  }
};

// Subscribe
export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const existingSubscriber = await Subscriber.findOne({ email });

    let isReactivation = false;

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return validationErrorResponse(res, "Email này đã được đăng ký trước đó");
      }

      // Reactivate an existing inactive subscriber
      existingSubscriber.isActive = true;
      await existingSubscriber.save();
      isReactivation = true;

      // Combine both emails into one batch to use a single request; send in background
      setImmediate(() => {
        void sendBatched([buildConfirmationEmail(email, isReactivation), buildAdminNotifyEmail(email)]);
      });

      return res.status(200).json({ msg: "Đăng ký thành công" });
    }

    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // Combine both emails into one batch to use a single request; send in background
    setImmediate(() => {
      void sendBatched([buildConfirmationEmail(email, false), buildAdminNotifyEmail(email)]);
    });

    res.status(201).json({ msg: "Đăng ký thành công" });
  } catch (error) {
    console.error("Subscribe error:", error);
    return serverErrorResponse(res, error, "Có lỗi xảy ra khi đăng ký");
  }
};

// Unsubscribe
export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token) {
      return validationErrorResponse(res, "Token không hợp lệ");
    }

    let email: string;
    try {
      email = verifyUnsubscribeToken(token as string);
    } catch {
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

// Notify all subscribers
export const sendNotification = async (bookTitle: string): Promise<void> => {
  try {
    const subscribers = await Subscriber.find({ isActive: true });
    if (!subscribers.length) return;

    const emails = subscribers.map((subscriber) => buildNewBookEmail(subscriber.email, bookTitle));

    await sendBatched(emails);
  } catch (error) {
    console.error("Send notification error:", error);
  }
};
