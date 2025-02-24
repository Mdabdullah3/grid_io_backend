import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    shortDes: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    variants: [
        {
            price: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            color: {
                type: String,
            },
            size: {
                type: String,
                required: true,
            },
            image: {
                type: String,
            },
            gender: {
                type: String,
                enum: ["men", "women", "unisex"],
                default: "unisex",
            }
        }
    ],

})

export default mongoose.model("Product", ProductSchema);