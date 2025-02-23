// src/validations/user.validation.js
import Joi from "joi";

export const registerUserSchema = Joi.object({
    fullName: Joi.string().min(4).required().messages({
        "string.empty": "Full Name is required",
        "string.min": "Full Name should be at least 4 characters long",
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email address",
        "string.empty": "Email is required",
    }),
    username: Joi.string().min(4).required().messages({
        "string.empty": "Username is required",
        "string.min": "Username should be at least 4 characters long",
    }),
    password: Joi.string().min(8).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password should be at least 8 characters long",
    }),
});
