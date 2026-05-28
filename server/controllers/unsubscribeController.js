import UnsubscribedUser from "../models/unsubscribedUserModel.js";
import SuppressionList from "../models/suppressionListModel.js";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const unsubscribeByEmail = async (req, res, next) => {
  try {
    const rawEmail = req.query.email;
    const email = String(rawEmail || "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return res.status(400).send(`
        <html>
          <body style="font-family:Arial,sans-serif;padding:24px;">
            <h2>Invalid unsubscribe link</h2>
            <p>The email address is missing or invalid.</p>
          </body>
        </html>
      `);
    }

    await UnsubscribedUser.updateOne(
      { email },
      {
        $set: {
          email,
          unsubscribedAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log(
      `[${new Date().toISOString()}] Unsubscribe recorded for ${email}`
    );

    return res.status(200).send(`
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Unsubscribed</title>
        </head>
        <body style="margin:0;padding:0;background:#fff8e1;font-family:Arial,sans-serif;">
          <div style="max-width:560px;margin:48px auto;padding:24px;background:#fff3c4;border:1px solid #f3dfa1;border-radius:16px;">
            <h1 style="margin:0 0 12px;color:#5f3b00;font-size:28px;">You are unsubscribed</h1>
            <p style="margin:0;color:#5f3b00;line-height:1.6;">
              ${email} has been removed from future bulk emails.
            </p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};

export const resubscribeByEmail = async (req, res, next) => {
  try {
    const rawEmail = req.query.email;
    const email = String(rawEmail || "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return res.status(400).send(`
        <html>
          <body style="font-family:Arial,sans-serif;padding:24px;">
            <h2>Invalid resubscribe link</h2>
            <p>The email address is missing or invalid.</p>
          </body>
        </html>
      `);
    }

    await Promise.all([
      UnsubscribedUser.deleteOne({ email }),
      SuppressionList.deleteOne({ email })
    ]);

    console.log(
      `[${new Date().toISOString()}] Resubscribe recorded for ${email}`
    );

    return res.status(200).send(`
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Resubscribed</title>
        </head>
        <body style="margin:0;padding:0;background:#fff8e1;font-family:Arial,sans-serif;">
          <div style="max-width:560px;margin:48px auto;padding:24px;background:#fff3c4;border:1px solid #f3dfa1;border-radius:16px;">
            <h1 style="margin:0 0 12px;color:#5f3b00;font-size:28px;">You are subscribed again</h1>
            <p style="margin:0;color:#5f3b00;line-height:1.6;">
              ${email} has been added back to future bulk emails.
            </p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};
