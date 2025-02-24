import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, resendVerificationCode, verifyEmail } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUserSchema } from "../validations/user.validation.js";
import validate from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import passport from "passport";
import { generateAccessTokenAndRefreshToken } from "../controllers/user.controller.js";

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
// Google OAuth Routes
router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res) => {
        try {
            const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(req.user._id);

            const options = { httpOnly: true, secure: true };
            res.cookie("accessToken", accessToken, options);
            res.cookie("refreshToken", refreshToken, options);

            res.redirect(process.env.FRONTEND_REDIRECT_URL || "http://localhost:3000");
        } catch (error) {
            res.status(500).json(new ApiResponse(500, {}, "Google login failed"));
        }
    }
);
export default router;