// src/controllers/user.controller.js
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";



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

const registerUser = asyncHandler(async (req, res) => {

    // get user details from request body
    // validation of user details
    // check if user already exists : username & email
    // check for images, check for avatar
    // upload them to cloudinary and get urls
    // create user object - create entry in database
    // remove password and refresh token from response
    // check for user creation 
    // return response



    // Destructure the validated fields from req.body
    const { fullName, email, username, password } = req.body;

    const errors = []
    const emailExists = await User.findOne({ email });
    if (emailExists) {
        errors.push("A user with this email already exists. Please use a different email.");
    }

    // Check if the username is already in use
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
        errors.push("This username is already taken. Please choose a different username.");
    }

    // If any errors were found, throw an ApiError with the combined messages
    if (errors.length > 0) {
        throw new ApiError(400, "Validation error", errors);
    }



    // Retrieve file paths from Multer middleware
    const avatarFile = req.files?.avatar?.[0]?.path;
    const coverImageFile = req.files?.coverImage?.[0]?.path;

    // Check if avatar exists
    if (!avatarFile) {
        throw new ApiError(400, "Avatar image is required");
    }
    const avatarUrl = avatarFile ? await uploadOnCloudinary(avatarFile) : null;
    const coverImageUrl = coverImageFile ? await uploadOnCloudinary(coverImageFile) : null;

    if (!avatarUrl) {
        throw new ApiError(400, "Avatar image upload failed");
    }


    // Create the user; password hashing is handled in the model's pre-save hook
    const user = await User.create({
        fullName,
        email,
        username,
        password,
        avatar: avatarUrl.url,
        coverImage: coverImageUrl?.url || "",
    });

    // Remove password and refreshToken from response object
    const createdUser = await User.findById(user?._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user");
    }

    // Return response with user details and success message
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered successfully")
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
export { registerUser, loginUser, logoutUser, refreshAccessToken };

