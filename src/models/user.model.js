import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        },
    ],
    isVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationCode: {
        type: String,
        index: true,
    },
    emailVerificationExpiry: {
        type: Date,
        index: true,
    },
    resendAttempts: {
        type: Number,
        default: 0,
    },
    password: {
        type: String,
    },
    refreshToken: {
        type: String,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, 
    },
}, {
    timestamps: true,
});

// Pre-save hook to hash the password (only if password is provided)
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to compare passwords
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Instance method to generate an access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

// Instance method to generate a refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

// Pre-save hook to set emailVerificationExpiry
userSchema.pre("save", function (next) {
    if (this.isModified("emailVerificationCode")) {
        this.emailVerificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    }
    next();
});

export default mongoose.model("User", userSchema);