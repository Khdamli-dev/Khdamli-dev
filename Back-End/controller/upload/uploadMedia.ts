import { Request, Response } from "express";
import upload from "../../utils/cloud/mediaMulter";
import pool from "../../database/dbConnection";
import { updateRequestMedia } from "../../utils/update/updateRequestMedia";

export const uploadMedia = async (req: Request, res: Response) => {
  const requestId: number = +req.params.requestId;
  if (isNaN(requestId)){
    res.status(400).json({
    message : 'requestId of wrong format',
    success : false
    });
    return
  }
  upload.array("file", 5)(req, res, async (err) => {
    if (err) {
      console.log(err)
      return res.status(400).json({
        message: err.message || "Error uploading files",
        success: false,
        requestId
      });
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({
        message:'no media is provided',
        requestId,
        success: false
      });
    }
    const uploadedFiles = (req.files as Express.Multer.File[]).map((file) => ({
      fileUrl: file.path, // Cloudinary file URL
      fileType: file.mimetype.startsWith("image/") ? "image" : "video",
    }));
    await pool.query('DELETE FROM "request_media" WHERE "request" = $1;',[requestId]);
    uploadedFiles.forEach(async (File) => {
      await updateRequestMedia(File , requestId);
    })

    return res.status(201).json({
      message: 'Media uploaded successfully',
      requestId,
      success: true,
      files: uploadedFiles,
    });
  });
};
