import { Router } from "express";
import { queueBulkEmails } from "../controllers/emailController.js";

const router = Router();

router.post("/send", queueBulkEmails);

export default router;
