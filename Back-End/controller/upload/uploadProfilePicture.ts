import { Request, Response } from "express";
import upload from "../../utils/cloud/imageMulter";
import { updateProfilePicture } from "../../utils/update/updateProfilePicture";

export const uploadProfilePicture = async (req: Request, res: Response) => {
    upload.single("file")(req, res, async (err) => {
      if (err) {
        res.status(500).json({
          message: "Error uploading file",
          success: false,
          error: err.message,
        });
        return ;
      }

      if (!req.file) {
        res.status(400).json({
          message: "No file uploaded",
          success: false,
        });
        return ;
      }
      const id : number = Number(req.params.id);
      await updateProfilePicture(req.file.path , id);
      res.status(201).json({
        message: "image uploaded successfully",
        success: true,
        fileUrl: req.file.path, // Cloudinary file URL
      });
    });

};
