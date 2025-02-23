// src/controllers/user.controller.js
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

    const createdUser = await User.findById(user?._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered successfully")
    );
});

export { registerUser };
