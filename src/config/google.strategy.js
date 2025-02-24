import passport from "passport";
import pkg from "passport-google-oauth20";
const { Strategy: GoogleStrategy } = pkg;
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;

                // Check if a user with this email already exists
                const existingUser = await User.findOne({ email });

                if (existingUser) {
                    // If the user exists, check if they signed up via Google OAuth
                    if (existingUser.googleId) {
                        // User signed up via Google OAuth, allow login
                        return done(null, existingUser);
                    } else {
                        // User signed up traditionally, return an error
                        return done(
                            new ApiError(400, "This email is already associated with an account. Please log in using your email and password."),
                            null
                        );
                    }
                }

                // If the user doesn't exist, create a new user
                const newUser = await User.create({
                    fullName: profile.displayName,
                    email: email,
                    username: email.split("@")[0],
                    avatar: profile.photos[0].value,
                    isVerified: true,
                    googleId: profile.id, // Store Google ID for future logins
                });

                return done(null, newUser);
            } catch (error) {
                console.error("Google authentication error:", error);
                return done(new ApiError(500, "Google authentication failed"), null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});