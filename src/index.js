import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "./db/index.js";
import { app } from "./app.js";

// Connect to MongoDB and start the server
connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("Error connecting to MongoDB", error);
            throw error;
        })
        app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
    }).catch((err) => {
        console.log('Error connecting to database', err);
    })











// (async () => {
//     try {
//         await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`);
//         console.log("Connected to MongoDB");
//         app.on("error", (error) => {
//             console.log("Error connecting to MongoDB", error);
//             throw error;
//         })
//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//         })
//     } catch (error) {
//         console.log("Error connecting to MongoDB", error);
//         throw error;
//     }
// })