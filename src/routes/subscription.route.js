import { Router } from "express";
import { subscribeUser, unSubscription } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/subscribe").post(verifyJWT, subscribeUser);
router.route("/unsubscribe/:id").delete(verifyJWT, unSubscription);

export default router;