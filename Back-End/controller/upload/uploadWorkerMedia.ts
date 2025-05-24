import { Request, Response } from "express";
import upload from "../../utils/cloud/workerMediaMulter";
import { updateWorkerMedia } from "../../utils/update/updateWorkerMedia";
export const uploadWorkerMedia = async (req: Request, res: Response) => {
  const workerId: number = +req.params.id;
  if (isNaN(workerId)){
    res.status(400).json({
    message : 'id of wrong format',
    success : false
    });
    return
  }
  upload.array("file", 5)(req, res, async (err) => {
    if (err) {
       res.status(400).json({
        message: err.message || "Error uploading files",
        success: false,
      });
      return;
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
       res.status(400).json({
        message:'no media is provided',
        success: false
      });
      return
    }
    const uploadedFiles = (req.files as Express.Multer.File[]).map((file) => ({
      fileUrl: file.path, // Cloudinary file URL
      fileType: file.mimetype.startsWith("image/") ? "image" : "video",
    }));
    uploadedFiles.forEach(async (File) => {
      await updateWorkerMedia(File , workerId);
    })
     res.status(201).json({
      message: 'Media uploaded successfully',
      success: true,
      files: uploadedFiles,
    });
    return
  });
};
