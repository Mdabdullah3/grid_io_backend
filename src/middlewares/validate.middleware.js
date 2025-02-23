import Joi from "joi";
import { ApiError } from "../utils/ApiError.js";

const validate = (schema, property = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Collect all errors
            allowUnknown: true, // Allow extra properties
            stripUnknown: true, // Remove unknown properties
        });

        if (error) {
            const errors = error.details.map((detail) => {
                return detail.message.replace(/["']/g, "");
            });

            return next(new ApiError(400, "Validation error", errors));
        }

        req[property] = value;
        next();
    };
};

export default validate;
