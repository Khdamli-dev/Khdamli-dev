import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary"; // Import Cloudinary instance

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const fileType = file.mimetype.split("/")[0]; 
    
    return {
      folder :`request/${fileType === "image" ? "images" : "videos"}`, 
      format: file.mimetype.split("/")[1], 
      resource_type: fileType === "image" ? "image" : "video", 
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
