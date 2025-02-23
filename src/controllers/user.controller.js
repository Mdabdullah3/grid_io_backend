// src/controllers/user.controller.js
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { generateVerificationCode, sendVerificationEmail } from "../utils/email.js";
import { VERIFICATION_CODE_EXPIRY } from "../constants.js";


const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave: false,
        });

        return {
            accessToken,
            refreshToken,
        };
    } catch (error) {
        throw new ApiError(500, "Failed to generate access token and refresh token");
    }
};

// get user details from request body
// validation of user details
// check if user already exists : username & email
// check for images, check for avatar
// upload them to cloudinary and get urls
// create user object - create entry in database
// remove password and refresh token from response
// check for user creation 
// return response

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // Validate user input
    const errors = [];
    if (await User.findOne({ email })) errors.push("Email already exists.");
    if (await User.findOne({ username })) errors.push("Username already taken.");
    if (errors.length > 0) throw new ApiError(400, "Validation error", errors);

    // Handle file uploads
    const avatarFile = req.files?.avatar?.[0]?.path;
    if (!avatarFile) throw new ApiError(400, "Avatar image is required");

    const avatarUrl = await uploadOnCloudinary(avatarFile);
    if (!avatarUrl) throw new ApiError(400, "Avatar upload failed");

    const coverImageUrl = req.files?.coverImage?.[0]?.path
        ? await uploadOnCloudinary(req.files.coverImage[0].path)
        : null;

    // Create user
    const user = await User.create({
        fullName,
        email,
        username,
        password,
        avatar: avatarUrl.url,
        coverImage: coverImageUrl?.url || "",
    });

    // Generate and send verification code
    const verificationCode = generateVerificationCode();
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpiry = new Date(Date.now() + VERIFICATION_CODE_EXPIRY);
    await user.save({ validateBeforeSave: false });

    try {
        await sendVerificationEmail(user.email, verificationCode);
    } catch (error) {
        await User.findByIdAndDelete(user._id);
        throw new ApiError(500, "Failed to send verification email.");
    }

    // Return response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully. Verification email sent.")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // Get user details from request body
    // Validate user details - email & password
    // Check if user exists : username & email
    // Check if password is correct - compare with hashed password
    // Generate access token and refresh token
    // send cookie with access token and refresh token
    // Return response

    const { email, username, password } = req.body;
    if (!email && !username) {
        throw new ApiError(400, "Email or Username are required");
    }

    const user = await User?.findOne({ $or: [{ email }, { username }] });
    if (!user) {
        throw new ApiError(400, "User does not exist");
    }
    if (!user.isVerified) {
        throw new ApiError(403, "Please verify your email first");
    }
    const isPasswordCorrect = await user?.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Password is incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user?._id);

    const loggedInUser = await User.findById(user?._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, {
        user: loggedInUser, accessToken,
        refreshToken
    }, "User logged in Successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User?.findByIdAndUpdate(req?.user?._id, {
        $set: {
            refreshToken: undefined
        }
    }, {
        new: true
    })

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out Successfully"));

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid Refresh token");
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is invalid");
        }

        const options = {
            httpOnly: true,
            secure: true,
        }
        const { accessToken, newrefreshToken } = await generateAccessTokenAndRefreshToken(user?._id);
        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newrefreshToken, options).json(new ApiResponse(200, {
            accessToken,
            newrefreshToken
        }, "Access token refreshed Successfully"));
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid Refresh token");
    }
})

const verifyEmail = asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        throw new ApiError(400, "Email and verification code are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isVerified) {
        return res.status(200).json(
            new ApiResponse(200, {}, "Email already verified")
        );
    }

    if (user.emailVerificationCode !== code) {
        throw new ApiError(400, "Invalid verification code");
    }

    if (Date.now() > user.emailVerificationExpiry.getTime()) {
        throw new ApiError(400, "Verification code has expired");
    }
    user.resendAttempts = 0;

    user.isVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Email verified successfully")
    );
});

const resendVerificationCode = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "This email is not Registered");
    }

    if (user.isVerified) {
        throw new ApiError(400, "Email is already verified");
    }
    const MAX_RESEND_ATTEMPTS = 3;
    if (user.resendAttempts >= MAX_RESEND_ATTEMPTS) {
        throw new ApiError(429, "Too many resend requests");
    }
    user.resendAttempts += 1;
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpiry = verificationExpiry;
    await user.save({ validateBeforeSave: false });

    try {
        await sendVerificationEmail(user.email, verificationCode);
    } catch (error) {
        throw new ApiError(500, "Failed to resend verification code");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Verification code resent successfully")
    );
});
export {
    registerUser, loginUser, logoutUser, refreshAccessToken, verifyEmail,
    resendVerificationCode
};

