import { Request, Response } from "express";
import upload from "../../utils/cloud/mediaMulter";

export const uploadMedia = (req: Request, res: Response) => {
  upload.array("file", 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || "Error uploading files",
        success: false,
      });
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({
        message: "No files uploaded",
        success: false,
      });
    }

    const uploadedFiles = (req.files as Express.Multer.File[]).map((file) => ({
      fileUrl: file.path, // Cloudinary file URL
      fileType: file.mimetype.startsWith("image/") ? "image" : "video",
    }));

    return res.status(201).json({
      message: "Files uploaded successfully",
      success: true,
      files: uploadedFiles,
    });
  });
};
