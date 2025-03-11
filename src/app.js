import express from "express";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import logger from "./utils/logger.js"; // Import Winston logger
import specs from "./config/swagger.js"; // Swagger configuration
import "./config/google.strategy.js"; // Google OAuth strategy
import userRoute from "./routes/user.route.js";
import subscribeRouter from "./routes/subscription.route.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

// *******************
// Security Middleware
// *******************
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "trusted-cdn.com"],
        },
    },
}));

// *******************
// Session Middleware
// *******************
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: process.env.NODE_ENV === "production" }, // Secure in production
    })
);

// *******************
// Rate Limiting
// *******************
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",
});
app.use(limiter);

// *******************
// Passport Middleware
// *******************
app.use(passport.initialize());
app.use(passport.session());

// *******************
// CORS Middleware
// *******************
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

// *******************
// Body Parsing Middleware
// *******************
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// *******************
// Static Files Middleware
// *******************
app.use(express.static("public"));

// *******************
// Cookie Parser Middleware
// *******************
app.use(cookieParser());

// *******************
// Health Check Endpoint
// *******************
app.get("/health", (req, res) => {
    logger.info("Health check endpoint called");
    res.status(200).json({ status: "OK" });
});

// *******************
// Swagger Documentation
// *******************
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// *******************
// Routes
// *******************
app.use("/api/v1/users", userRoute);
app.use("/api/v1/subscription", subscribeRouter);

// *******************
// Error Handling Middleware
// *******************
app.use(errorHandler);

export { app };