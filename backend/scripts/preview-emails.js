// Render các email template ra file HTML để xem trước trên trình duyệt.
// Chạy: node scripts/preview-emails.js
// Output: backend/email-previews/*.html

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Set env stub trước khi import config — config.js sẽ exit nếu thiếu JWT_SECRET/ADMIN_PASSWORD
process.env.JWT_SECRET = process.env.JWT_SECRET || "preview-secret-please-do-not-use-in-prod-32chars";
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "$2a$10$preview.placeholder.hash.value.not.used.here.0000000";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "https://ranobe.vn";
process.env.EMAIL_FROM = process.env.EMAIL_FROM || "Ranobe Hub <noreply@ranobe.vn>";
process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ranobe.vn";

const { buildAdminNotifyEmail, buildConfirmationEmail, buildNewBookEmail } = await import(
  "../utils/emailTemplates.js"
);

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "email-previews");
mkdirSync(outDir, { recursive: true });

const samples = [
  {
    file: "01-admin-notify.html",
    label: "Admin notify · subscriber mới",
    payload: buildAdminNotifyEmail("docgia@example.com"),
  },
  {
    file: "02-confirmation-new.html",
    label: "Confirmation · đăng ký lần đầu",
    payload: buildConfirmationEmail("docgia@example.com", false),
  },
  {
    file: "03-confirmation-reactivation.html",
    label: "Confirmation · đăng ký lại",
    payload: buildConfirmationEmail("docgia@example.com", true),
  },
  {
    file: "04-new-book.html",
    label: "New book · gửi tới subscriber",
    payload: buildNewBookEmail("docgia@example.com", "Yagate Kimi ni Naru"),
  },
];

for (const { file, payload } of samples) {
  writeFileSync(join(outDir, file), payload.html, "utf8");
}

// Trang index để mở dễ — liệt kê meta (subject, from, to, preheader) cạnh từng preview
const indexHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Email previews · Ranobe Hub</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; background: #fafafa; color: #111; }
    header { padding: 24px 32px; border-bottom: 1px solid #eee; background: #fff; }
    header h1 { margin: 0; font-size: 18px; letter-spacing: 2px; }
    main { display: grid; grid-template-columns: 320px 1fr; min-height: calc(100vh - 65px); }
    aside { border-right: 1px solid #eee; background: #fff; padding: 16px 0; }
    aside a { display: block; padding: 12px 24px; color: #111; text-decoration: none; font-size: 14px; border-left: 3px solid transparent; }
    aside a:hover { background: #f4f4f5; }
    aside a.active { background: #f4f4f5; border-left-color: #111; font-weight: 600; }
    aside .meta { padding: 8px 24px 16px 24px; font-size: 12px; color: #6b7280; line-height: 1.5; border-bottom: 1px solid #eee; }
    aside .meta strong { color: #111; }
    section { padding: 32px; }
    iframe { width: 100%; height: calc(100vh - 130px); border: 1px solid #e5e5e5; border-radius: 8px; background: #fff; }
  </style>
</head>
<body>
  <header><h1>RANOBE HUB · EMAIL PREVIEWS</h1></header>
  <main>
    <aside>
      ${samples
        .map(
          (s, i) => `
        <a href="#" data-file="${s.file}" data-label="${s.label}"${i === 0 ? ' class="active"' : ""}>${s.label}</a>
        <div class="meta" data-for="${s.file}">
          <div><strong>Subject:</strong> ${s.payload.subject}</div>
          <div><strong>From:</strong> ${s.payload.from}</div>
          <div><strong>To:</strong> ${Array.isArray(s.payload.to) ? s.payload.to.join(", ") : s.payload.to}</div>
        </div>`
        )
        .join("")}
    </aside>
    <section>
      <iframe id="frame" src="${samples[0].file}"></iframe>
    </section>
  </main>
  <script>
    const links = document.querySelectorAll('aside a');
    const frame = document.getElementById('frame');
    links.forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      links.forEach(l => l.classList.remove('active'));
      a.classList.add('active');
      frame.src = a.dataset.file;
    }));
  </script>
</body>
</html>`;

writeFileSync(join(outDir, "index.html"), indexHtml, "utf8");

console.log("Đã render", samples.length, "email previews:");
for (const { file, label } of samples) {
  console.log(`  ${file}  —  ${label}`);
}
console.log(`\nMở: ${join(outDir, "index.html")}`);
