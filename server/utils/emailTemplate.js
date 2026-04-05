const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const generateEmailTemplate = (name, message) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f7fb;padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="background:#0f172a;padding:24px;text-align:center;color:#ffffff;font-size:24px;font-weight:bold;">
                  Bulk Email Notification
                </td>
              </tr>
              <tr>
                <td style="padding:32px 24px;color:#1f2937;line-height:1.7;font-size:16px;">
                  <p style="margin-top:0;">Hi ${escapeHtml(name)},</p>
                  <p>${escapeHtml(message)}</p>
                  <p style="margin-bottom:0;">Thanks,<br />Email System Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;
