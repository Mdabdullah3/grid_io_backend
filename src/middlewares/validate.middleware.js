// src/middlewares/validate.js
import Joi from "joi";
import { ApiError } from "../utils/ApiError.js";

/**
 * A dynamic validation middleware that accepts a Joi schema.
 * If validation fails, it passes an ApiError to the error handler.
 * 
 * @param {Joi.Schema} schema - The Joi schema to validate the request against.
 * @param {string} property - The request property to validate (default: "body").
 */
const validate = (schema, property = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Collect all errors
            allowUnknown: true, // Allow extra properties
            stripUnknown: true, // Remove unknown properties
        });

        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return next(new ApiError(400, "Validation error", errors));
        }

        req[property] = value;
        next();
    };
};

export default validate;
