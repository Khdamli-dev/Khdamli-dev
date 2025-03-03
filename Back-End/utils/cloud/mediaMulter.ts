import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary"; // Import Cloudinary instance

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const fileType = file.mimetype.split("/")[0]; // Extract "image" or "video"
    
    return {
      folder: fileType === "image" ? "images" : "videos", // Separate folders
      format: file.mimetype.split("/")[1], // Keep original format
      resource_type: fileType === "image" ? "image" : "video", // Ensure Cloudinary treats it correctly
    };
  },
});

// ✅ **Allow Only Images & Videos**
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileType = file.mimetype.split("/")[0]; // Check if it's an image or video
    if (fileType === "image" || fileType === "video") {
      cb(null, true); // Accept images & videos
    } else {
      cb(new Error("Only images and videos are allowed!") as any, false); // Reject other files
    }
  },
});

export default upload;
