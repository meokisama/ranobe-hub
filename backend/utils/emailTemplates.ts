import { signUnsubscribeToken } from "./unsubscribeToken.js";

const BRAND_NAME = "RANOBE HUB";
const BRAND_TAGLINE = "Light Novel tiếng Nhật miễn phí";

export interface EmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
}

const buildUnsubscribeUrl = (email: string): string => {
  const token = signUnsubscribeToken(email);
  return `${process.env.FRONTEND_URL}/unsubscribe?token=${encodeURIComponent(token)}`;
};

// Bulletproof button — VML fallback cho Outlook desktop
const renderButton = (href: string, label: string, { color = "#111111", textColor = "#ffffff" }: { color?: string; textColor?: string } = {}): string => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto;">
    <tr>
      <td align="center" bgcolor="${color}" style="border-radius: 6px;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:46px;v-text-anchor:middle;width:220px;" arcsize="13%" stroke="f" fillcolor="${color}">
          <w:anchorlock/>
          <center style="color:${textColor};font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${label}</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-- -->
        <a href="${href}"
           style="display: inline-block; padding: 14px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; color: ${textColor}; text-decoration: none; border-radius: 6px; letter-spacing: 0.3px;">
          ${label}
        </a>
        <!--<![endif]-->
      </td>
    </tr>
  </table>
`;

// Khung email chung — table-based, an toàn cho Outlook/Gmail clip
const renderLayout = ({
  preheader,
  title,
  bodyHtml,
  footerHtml,
}: {
  preheader: string;
  title: string;
  bodyHtml: string;
  footerHtml: string;
}): string => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="vi">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    table, td, p, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; visibility: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #f4f4f5;">
    ${preheader}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding: 32px 40px 24px 40px; border-bottom: 1px solid #eeeeee;" align="center">
              <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 700; letter-spacing: 4px; color: #111111;">
                ${BRAND_NAME}
              </div>
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px; color: #888888; margin-top: 6px; letter-spacing: 1px; text-transform: uppercase;">
                ${BRAND_TAGLINE}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 32px 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #1f2937; font-size: 15px; line-height: 1.65;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 32px 40px; border-top: 1px solid #eeeeee; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.6;">
              ${footerHtml}
            </td>
          </tr>
        </table>
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 11px; color: #b0b0b0; margin-top: 16px;">
          © ${new Date().getFullYear()} Ranobe Hub · Ranobe.vn
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;

const subscriberFooter = (email: string): string => {
  const url = buildUnsubscribeUrl(email);
  return `
    Bạn nhận được email này vì đã đăng ký nhận tin sách mới tại Ranobe Hub.<br />
    Không muốn nhận nữa? <a href="${url}" style="color: #6b7280; text-decoration: underline;">Huỷ đăng ký</a>.
  `;
};

const adminFooter = `Email tự động từ hệ thống Ranobe Hub — không cần phản hồi.`;

// 1) Email báo admin có người đăng ký mới
export const buildAdminNotifyEmail = (subscriberEmail: string): EmailPayload => {
  const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  const preheader = `Có subscriber mới: ${subscriberEmail}`;
  const bodyHtml = `
    <h1 style="margin: 0 0 16px 0; font-family: Georgia, 'Times New Roman', serif; text-align: center; font-size: 22px; font-weight: 700; color: #111111;">
      Có người đăng ký mới
    </h1>
    <p style="margin: 0 0 24px 0; text-align: center;">
      Một độc giả vừa đăng ký nhận thông báo sách mới.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fafafa; border: 1px solid #eeeeee; border-radius: 8px;">
      <tr>
        <td style="padding: 16px 20px; font-size: 13px; color: #6b7280; width: 90px;">Email</td>
        <td style="padding: 16px 20px; font-size: 14px; color: #111111; font-weight: 600;">${subscriberEmail}</td>
      </tr>
      <tr>
        <td style="padding: 16px 20px; font-size: 13px; color: #6b7280; border-top: 1px solid #eeeeee;">Thời gian</td>
        <td style="padding: 16px 20px; font-size: 14px; color: #111111; border-top: 1px solid #eeeeee;">${time}</td>
      </tr>
    </table>
  `;
  const text = `Có người đăng ký mới\n\nEmail: ${subscriberEmail}\nThời gian: ${time}\n\n— Ranobe Hub`;

  return {
    from: process.env.EMAIL_FROM as string,
    to: [process.env.ADMIN_EMAIL as string],
    subject: `[Ranobe Hub] Subscriber mới: ${subscriberEmail}`,
    html: renderLayout({ preheader, title: "Subscriber mới", bodyHtml, footerHtml: adminFooter }),
    text,
  };
};

// 2) Email xác nhận cho subscriber
export const buildConfirmationEmail = (email: string, isReactivation = false): EmailPayload => {
  const unsubscribeUrl = buildUnsubscribeUrl(email);
  const heading = isReactivation ? "Chào mừng bạn quay lại!" : "Đăng ký thành công!";
  const preheader = isReactivation
    ? "Bạn đã đăng ký lại để nhận tin sách mới từ Ranobe Hub."
    : "Cảm ơn bạn đã đăng ký nhận tin sách mới từ Ranobe Hub.";

  const bodyHtml = `
    <h1 style="margin: 0 0 16px 0; font-family: Georgia, 'Times New Roman', serif; text-align: center; font-size: 26px; font-weight: 700; color: #111111;">
      ${heading}
    </h1>
    <p style="margin: 0 0 16px 0; text-align: center;">
      Cảm ơn bạn đã ${isReactivation ? "đăng ký lại" : "đăng ký"} nhận tin từ <strong>Ranobe Hub</strong>.
    </p>
    <p style="margin: 0 0 28px 0; text-align: center;">
      Bạn sẽ là một trong những người đầu tiên được thông báo mỗi khi có sách mới được đăng tải.
    </p>
    ${renderButton(process.env.FRONTEND_URL as string, "Khám phá thư viện")}
    <p style="margin: 32px 0 0 0; font-size: 13px; color: #6b7280; text-align: center;">
      Đăng ký nhầm? <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Huỷ đăng ký tại đây</a>.
    </p>
  `;
  const text = [
    heading,
    "",
    `Cảm ơn bạn đã ${isReactivation ? "đăng ký lại" : "đăng ký"} nhận tin từ Ranobe Hub.`,
    "Bạn sẽ là một trong những người đầu tiên được thông báo mỗi khi có ranobe mới được đăng tải.",
    "",
    `Khám phá thư viện: ${process.env.FRONTEND_URL}`,
    "",
    `Huỷ đăng ký: ${unsubscribeUrl}`,
    "",
    "— Ranobe Hub",
  ].join("\n");

  return {
    from: process.env.EMAIL_FROM as string,
    to: [email],
    subject: isReactivation ? "Chào mừng bạn quay lại Ranobe Hub" : "Đăng ký nhận tin Ranobe Hub thành công",
    html: renderLayout({ preheader, title: heading, bodyHtml, footerHtml: subscriberFooter(email) }),
    text,
  };
};

// 3) Email thông báo sách mới
export const buildNewBookEmail = (email: string, bookTitle: string): EmailPayload => {
  const preheader = `「${bookTitle}」vừa được đăng tải trên Ranobe Hub.`;
  const bodyHtml = `
    <h1 style="margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; text-align: center; color: #111111; line-height: 1.3;">
      「${bookTitle}」
    </h1>
    <p style="margin: 0 0 28px 0; text-align: center;">
      Sách mới vừa được đăng tải trên Ranobe Hub.
    </p>
    ${renderButton(process.env.FRONTEND_URL as string, "Đọc ngay")}
  `;
  const text = [
    "Sách mới trên Ranobe Hub",
    "",
    `「${bookTitle}」vừa được đăng tải.`,
    "",
    `Đọc ngay: ${process.env.FRONTEND_URL}`,
    "",
    `Huỷ đăng ký: ${buildUnsubscribeUrl(email)}`,
    "",
    "— Ranobe Hub",
  ].join("\n");

  return {
    from: process.env.EMAIL_FROM as string,
    to: [email],
    subject: `[Ranobe Hub] Sách mới: 「${bookTitle}」`,
    html: renderLayout({
      preheader,
      title: `Sách mới: ${bookTitle}`,
      bodyHtml,
      footerHtml: subscriberFooter(email),
    }),
    text,
  };
};
