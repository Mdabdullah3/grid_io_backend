import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

// Middlewares cors and body parser
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
export { app };