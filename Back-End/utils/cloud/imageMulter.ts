import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary"; // Import Cloudinary instance
import { Request } from "express";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file) => {
    const id = req.params.id; 
    return {
      folder: "profile pictures", 
      public_id: id, 
      resource_type: "image", 
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




