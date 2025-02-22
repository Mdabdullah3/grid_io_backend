import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: 'dzyniwtus',
    api_key: '692239129849586',
    api_secret: '9t419lmctXMrd1D9DhsunIV4WeM'
});

console.log("Cloudinary Config:", cloudinary.config(), process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        console.log("Uploading file to Cloudinary:", localFilePath);

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("Upload successful:", response.secure_url);

        fs.unlinkSync(localFilePath); // Delete local file after upload
        return response.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error.message);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Remove file if upload fails
        }
        return null;
    }
};

export { uploadOnCloudinary };