import { Router } from "express";
import { subscribeUser, unSubscription } from "../controllers/subscription.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();
router.route("/subscribe").post(verifyJWT, subscribeUser);
router.route("/unsubscribe").post(verifyJWT, unSubscription);

export default router;