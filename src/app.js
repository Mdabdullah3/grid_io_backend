import express from "express";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./config/google.strategy.js";
const app = express();
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Set to true if using HTTPS
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Middlewares to parse the body of the request
app.use(express.json({
    limit: "16kb"
}));

// Middlewares to parse the body of the request with urlencoded
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));

// Middleware to serve static files
app.use(express.static("public"));

// Middleware to parse cookies
app.use(cookieParser());


/// Routes import
import userRoute from "./routes/user.route.js";
import errorHandler from "./middlewares/errorHandler.js";
import subscribeRouter from "./routes/subscription.route.js"


// routes declaration
app.use("/api/v1/users", userRoute);
app.use("/api/v1/subscription", subscribeRouter);
app.use(errorHandler);
export { app };