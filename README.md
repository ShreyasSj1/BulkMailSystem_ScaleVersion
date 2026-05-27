# Bulk Email System

Production-ready bulk email backend using Node.js, Express, MongoDB, Redis, BullMQ, and Nodemailer.

## Project Structure

```text
email-system/
├── server/
│   ├── app.js
│   ├── config/
│   │   ├── db.js
│   │   ├── redis.js
│   ├── controllers/
│   │   ├── emailController.js
│   │   └── unsubscribeController.js
│   ├── routes/
│   │   └── emailRoutes.js
│   ├── services/
│   │   └── emailService.js
│   ├── queues/
│   │   ├── emailQueue.js
│   │   └── emailWorker.js
│   ├── models/
│   │   ├── userModel.js
│   │   └── unsubscribedUserModel.js
│   ├── utils/
│   │   ├── buildEmailContent.js
│   │   ├── emailTemplate.js
│   │   ├── filterUnsubscribedRecipients.js
│   │   └── generatePlainText.js
│   └── .env.example
├── package.json
└── README.md
```

## Features

- Browser sender page at `GET /` to paste bulk emails and send directly
- `POST /api/email/send` queues bulk emails instead of sending synchronously
- Multipart email delivery (`html` + `text`) for better client compatibility
- Safe outbound throttling with configurable rate, concurrency, and batching
- One-click unsubscribe support with DB-backed suppression
- BullMQ retry handling with 3 attempts and exponential backoff
- Separate worker process for asynchronous email delivery
- Nodemailer email service abstraction for future SendGrid replacement
- MongoDB user persistence with deduplicated email storage
- Input validation, logging, and centralized error handling

## Installation

```bash
npm install
```

Create `server/.env` from [server/.env.example](/Users/sj/Desktop/Stuff/Email System/email-system/server/.env.example), then update values:

```env
PORT=5000
EMAIL=your_email@gmail.com
PASSWORD=your_google_app_password
MONGO_URI=mongodb://127.0.0.1:27017/email_system
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
SENDER_NAME=NIEdge
REPLY_TO=support@niedge.com
EMAILS_PER_SECOND=1
MAX_CONCURRENCY=1
BATCH_SIZE=10
```

## Run Instructions

1. Start MongoDB
2. Start Redis
3. Start API server:

```bash
npm start
```

4. Start worker in a second terminal:

```bash
npm run worker
```

5. Open sender UI:

[http://localhost:5000/](http://localhost:5000/)

6. Paste emails, add subject/message, click `Send Bulk Email`
7. Optionally set custom `Sender Name` and `Reply-To Email`

## Throttling Configuration

Use these variables in [server/.env](/Users/sj/Desktop/Stuff/Email System/email-system/server/.env):

- `EMAILS_PER_SECOND`: max sends per second (default `1`)
- `MAX_CONCURRENCY`: worker concurrency limit (default `1`)
- `BATCH_SIZE`: number of queued jobs grouped before next staged window (default `10`)

## Unsubscribe Flow

- Every email includes an unsubscribe link.
- Endpoint: `GET /unsubscribe?email=<recipient-email>`
- Alias endpoint: `GET /api/email/unsubscribe?email=<recipient-email>`
- Clicking unsubscribe stores the email in `UnsubscribedUsers`.
- Unsubscribed recipients are skipped before queueing (`filterUnsubscribedRecipients`).
- Unsubscribe actions and skipped recipients are logged.

Behavior:

- Jobs are queued with staggered delays plus randomized jitter.
- Worker also applies random pre-send jitter (`300ms` to `2000ms`).
- BullMQ limiter prevents send bursts beyond `EMAILS_PER_SECOND`.
- Retry logic remains active (`attempts: 3`, exponential backoff).

## Workflow

1. You submit emails from the UI (`/`) or API (`POST /api/email/send`).
2. Server validates and normalizes email IDs.
3. Unsubscribed users are filtered out before jobs are created.
4. Valid recipients are saved/deduplicated in MongoDB.
5. One BullMQ job is created per allowed recipient.
6. Worker consumes jobs asynchronously from Redis-backed queue.
7. Worker generates both HTML and plain text versions of the email.
8. Worker sends multipart email via Nodemailer SMTP (Gmail).
9. Optional sender name and reply-to are applied from request or environment variables.
10. Worker applies throttling (rate limits, jitter, and gradual batch pacing).
11. Success/failure is logged; failed jobs retry automatically (3 attempts with exponential backoff).

## Worker Metrics Logging

Worker logs now include:

- current send rate (emails/second)
- queue depth (`waiting`, `active`, `delayed`)
- retries count
- failures count

## API Usage (Optional)

You can still send directly via API:

```bash
curl -X POST http://localhost:5000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "emails": ["user1@gmail.com", "user2@gmail.com"],
    "subject": "NIEdge Update: New Placements Section Is Live",
    "message": "In the latest update, we have added a NEW SECTION called PLACEMENTS. It is your ultimate guide to prepare for the upcoming placement season.",
    "senderName": "NIEdge",
    "replyTo": "support@niedge.com"
  }'
```

## Notes

- Use a Gmail app password if you are testing with Gmail SMTP.
- Make sure MongoDB and Redis are running before starting the server and worker.
- Keep `npm start` and `npm run worker` running in separate terminals while sending emails.
