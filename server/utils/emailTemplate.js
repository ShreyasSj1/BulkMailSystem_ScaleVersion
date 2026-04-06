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
      <style>
        body,
        table,
        td,
        a {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }

        table {
          border-collapse: separate;
        }

        img {
          border: 0;
          line-height: 100%;
          outline: none;
          text-decoration: none;
        }

        @media screen and (max-width: 600px) {
          .outer-shell {
            padding: 20px 10px !important;
          }

          .main-card {
            border-radius: 20px !important;
          }

          .content-pad {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          .top-pad {
            padding-top: 16px !important;
          }

          .hero-title {
            font-size: 31px !important;
            line-height: 1.12 !important;
          }

          .hero-copy {
            font-size: 16px !important;
            line-height: 1.6 !important;
          }

          .inner-card {
            border-radius: 16px !important;
          }

          .inner-copy {
            padding: 18px !important;
            font-size: 15px !important;
            line-height: 1.7 !important;
          }

          .inner-greeting {
            font-size: 20px !important;
          }

          .cta-wrap {
            padding-top: 2px !important;
            padding-bottom: 22px !important;
          }

          .cta-table {
            width: 100% !important;
          }

          .cta-button {
            display: block !important;
            width: 100% !important;
            box-sizing: border-box !important;
            text-align: center !important;
            padding: 15px 22px !important;
            font-size: 17px !important;
          }

          .footer-copy {
            font-size: 14px !important;
            line-height: 1.7 !important;
          }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background-color:#f4b000;font-family:Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="outer-shell" style="background:linear-gradient(135deg,#ffd34f 0%,#ffbe1a 35%,#f59e0b 100%);padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="main-card" style="max-width:600px;width:100%;background:rgba(255,242,204,0.92);border:1px solid rgba(255,255,255,0.35);border-radius:24px;overflow:hidden;box-shadow:0 18px 45px rgba(120,72,0,0.28);">
              <tr>
                <td class="content-pad top-pad" style="padding:18px 24px 0 24px;">
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
                <td class="content-pad" style="padding:18px 24px 8px 24px;color:#1a1a1a;line-height:1.6;">
                  <h1 class="hero-title" style="margin:0 0 12px 0;font-size:42px;line-height:1.06;font-weight:800;color:#141414;">
                    NIEdge just became better.<br />
                  </h1>
                  <p class="hero-copy" style="margin:0;font-size:18px;line-height:1.6;color:#6a4300;">
                    A smarter place to prepare, explore, and stay ready for what comes next.
                  </p>
                </td>
              </tr>
              <tr>
                <td class="content-pad" style="padding:18px 24px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="inner-card" style="background:rgba(255,255,255,0.4);border:1px solid rgba(255,255,255,0.45);border-radius:18px;">
                    <tr>
                      <td class="inner-copy" style="padding:24px;color:#2b1b00;font-size:16px;line-height:1.8;">
                        <p class="inner-greeting" style="margin:0 0 14px 0;font-size:18px;font-weight:bold;">Hey Subscriber,</p>
                        <p style="margin:0;">${escapeHtml(message)}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="content-pad cta-wrap" style="padding:8px 24px 28px 24px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" class="cta-table">
                    <tr>
                      <td style="background:#ffffff;border-radius:999px;">
                        <a href="https://niedge.vercel.app/" target="_blank" rel="noopener noreferrer" class="cta-button" style="display:inline-block;padding:14px 24px;color:#d97706;font-size:16px;font-weight:bold;text-decoration:none;">
                          Explore Now
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="content-pad" style="padding:0 24px 24px 24px;">
                  <p class="footer-copy" style="margin:0;font-size:13px;color:#7c5200;line-height:1.6;">
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
