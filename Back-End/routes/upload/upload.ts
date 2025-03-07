import express, { Router }  from "express";
import { uploadProfilePicture } from "../../controller/upload/uploadProfilePicture";
import { uploadMedia } from "../../controller/upload/uploadMedia";

const upload : Router= express.Router();

upload.post(`/upload-profile-picture/:id`,uploadProfilePicture);
upload.post('/upload-media',uploadMedia);

export default upload;