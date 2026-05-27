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
│   │   └── emailController.js
│   ├── routes/
│   │   └── emailRoutes.js
│   ├── services/
│   │   └── emailService.js
│   ├── queues/
│   │   ├── emailQueue.js
│   │   └── emailWorker.js
│   ├── models/
│   │   └── userModel.js
│   ├── utils/
│   │   └── emailTemplate.js
│   └── .env
├── package.json
└── README.md
```

## Features

- Browser sender page at `GET /` to paste bulk emails and send directly
- `POST /api/email/send` queues bulk emails instead of sending synchronously
- BullMQ retry handling with 3 attempts and exponential backoff
- Separate worker process for asynchronous email delivery
- Nodemailer email service abstraction for future SendGrid replacement
- MongoDB user persistence with deduplicated email storage
- Input validation, logging, and centralized error handling

## Installation

```bash
npm install
```

Update environment variables in [server/.env](/Users/sj/Desktop/Stuff/Email System/email-system/server/.env):

```env
PORT=5000
EMAIL=your_email@gmail.com
PASSWORD=your_google_app_password
MONGO_URI=mongodb://127.0.0.1:27017/email_system
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
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

## Workflow

1. You submit emails from the UI (`/`) or API (`POST /api/email/send`).
2. Server validates and normalizes email IDs.
3. Valid emails are saved/deduplicated in MongoDB.
4. One BullMQ job is created per recipient.
5. Worker consumes jobs asynchronously from Redis-backed queue.
6. Worker renders HTML template and sends via Nodemailer SMTP.
7. Success/failure is logged; failed jobs retry automatically (3 attempts with exponential backoff).

## API Usage (Optional)

You can still send directly via API:

```bash
curl -X POST http://localhost:5000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "emails": ["user1@gmail.com", "user2@gmail.com"],
    "subject": "NIEdge Update: New Placements Section Is Live",
    "message": "In the latest update, we have added a NEW SECTION called PLACEMENTS. It is your ultimate guide to prepare for the upcoming placement season."
  }'
```

## Notes

- Use a Gmail app password if you are testing with Gmail SMTP.
- Make sure MongoDB and Redis are running before starting the server and worker.
- Keep `npm start` and `npm run worker` running in separate terminals while sending emails.
