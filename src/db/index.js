// src/db/index.js
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionString = `${process.env.MONGODB_URL}/${DB_NAME}`;
        const connectionInstance = await mongoose.connect(connectionString);
        console.log(
            `\nConnected to MongoDB at ${connectionInstance.connection.host}:${connectionInstance.connection.port}/${connectionInstance.connection.name}\n`
        );
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
        process.exit(1);
    }
};

export default connectDB;
