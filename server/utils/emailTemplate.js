export const generateEmailTemplate = (name, message) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f4b000;font-family:Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#ffd34f 0%,#ffbe1a 35%,#f59e0b 100%);padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:rgba(255,242,204,0.92);border:1px solid rgba(255,255,255,0.35);border-radius:24px;overflow:hidden;box-shadow:0 18px 45px rgba(120,72,0,0.28);">
              <tr>
                <td style="padding:18px 24px 0 24px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#8a5300;font-weight:bold;">
                        Latest Drop
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 24px 8px 24px;color:#1a1a1a;line-height:1.6;">
                  <h1 style="margin:0 0 14px 0;font-size:40px;line-height:1.05;font-weight:800;color:#141414;">
                    NIEdge just became better.<br />
                  </h1>
                  <p style="margin:0;font-size:18px;color:#5a3a00;">
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 24px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:rgba(255,255,255,0.4);border:1px solid rgba(255,255,255,0.45);border-radius:18px;">
                    <tr>
                      <td style="padding:24px;color:#2b1b00;font-size:16px;line-height:1.8;">
                        <p style="margin:0 0 14px 0;font-size:18px;font-weight:bold;">Hey Subscriber,</p>
                        <p style="margin:0;">In the latest update, we have added a NEW SECTION called PLACEMENTS, its an ultimate guide to prep for upcoming placement season!</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 24px 28px 24px;">
                  <table role="presentation" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="background:#ffffff;border-radius:999px;">
                        <a href="https://niedge.vercel.app/" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 24px;color:#d97706;font-size:16px;font-weight:bold;text-decoration:none;">
                          Explore Now
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 24px 24px;">
                  <p style="margin:0;font-size:13px;color:#7c5200;">
                    Thanks,<br />Team NIEdge
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;
