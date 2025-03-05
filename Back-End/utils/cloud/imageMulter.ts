import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary"; // Import Cloudinary instance
import { Request } from "express";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req : Request, file) => {
    return {
      folder: "images", // Store only in "images" folder
      format: file.mimetype.split("/")[1], // Keep original format
      resource_type: "image", // Ensure Cloudinary treats it as an image
    };
  },
});


const upload = multer({
  storage,
  fileFilter: (req : Request, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true); 
    } else {
      cb(new Error("Only image files are allowed!") as any, false); // Reject non-images
    }
  },
});

export default upload;




