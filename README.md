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

Update environment variables in [`server/.env`](/Users/sj/Desktop/Stuff/Email System/email-system/server/.env).

## Run Server

```bash
npm start
```

## Run Worker

Open another terminal and run:

```bash
npm run worker
```

## Sample API Request

### cURL

```bash
curl --request POST http://localhost:5000/api/email/send \
  --header "Content-Type: application/json" \
  --data '{
    "emails": ["user1@gmail.com", "user2@gmail.com"],
    "subject": "Special Offer",
    "message": "Hello! This is a queued bulk email from our system."
  }'
```

### Postman Body

```json
{
  "emails": ["user1@gmail.com", "user2@gmail.com"],
  "subject": "Special Offer",
  "message": "Hello! This is a queued bulk email from our system."
}
```

## Notes

- Use a Gmail app password if you are testing with Gmail SMTP.
- Make sure MongoDB and Redis are running before starting the server and worker.
