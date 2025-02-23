import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, resendVerificationCode, verifyEmail } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUserSchema } from "../validations/user.validation.js";
import validate from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.post(
    "/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    validate(registerUserSchema),
    registerUser
);
router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

// user email verification routes
router.route('/verify-email').post(verifyEmail);
router.route('/resend-verification-code').post(resendVerificationCode);

export default router;