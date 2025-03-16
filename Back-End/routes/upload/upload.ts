import express, { Router }  from "express";
import { uploadProfilePicture } from "../../controller/upload/uploadProfilePicture";
import { uploadMedia } from "../../controller/upload/uploadMedia";

const upload : Router= express.Router();

upload.post('/profile-picture/:id',uploadProfilePicture);
upload.post('/media',uploadMedia);

export default upload;