import { Router } from "express";
import {
  queueBulkEmails,
  queueEmailsFromFirebase
} from "../controllers/emailController.js";
import {
  resubscribeByEmail,
  unsubscribeByEmail
} from "../controllers/unsubscribeController.js";

const router = Router();

router.post("/send", queueBulkEmails);
router.post("/send-from-firebase", queueEmailsFromFirebase);
router.get("/unsubscribe", unsubscribeByEmail);
router.get("/resubscribe", resubscribeByEmail);

export default router;
