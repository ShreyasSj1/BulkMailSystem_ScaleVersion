import { Router } from "express";
import { queueBulkEmails } from "../controllers/emailController.js";
import { unsubscribeByEmail } from "../controllers/unsubscribeController.js";

const router = Router();

router.post("/send", queueBulkEmails);
router.get("/unsubscribe", unsubscribeByEmail);

export default router;
