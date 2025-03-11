import { Router } from "express";
import {
    changCurrentPassword,
    getMe,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    resendVerificationCode,
    updateAccountDetails,
    updateUserAvatar,
    verifyEmail,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUserSchema } from "../validations/user.validation.js";
import validate from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import passport from "passport";
import { generateAccessTokenAndRefreshToken } from "../controllers/user.controller.js";

const router = Router();

// Register User
router.post(
    "/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    validate(registerUserSchema),
    registerUser
);

// Login User
router.route("/login").post(loginUser);

// Logout User
router.route("/logout").post(verifyJWT, logoutUser);

// Refresh Token
router.route("/refresh-token").post(refreshAccessToken);

// Get Current User
router.route("/me").get(verifyJWT, getMe);

// Verify Email
router.route("/verify-email").post(verifyEmail);

// Resend Verification Code
router.route("/resend-verification-code").post(resendVerificationCode);

// Change Password
router.route("/change-password").post(verifyJWT, changCurrentPassword);

// Update Avatar
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

// Update Account Details
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

// Get User Channel Profile
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);

// Get Watch History
router.route("/watch-history").get(verifyJWT, getWatchHistory);

// Google OAuth Routes
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
    "/google/callback",
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