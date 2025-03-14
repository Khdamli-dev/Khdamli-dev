import dotenv from 'dotenv';
import cors from "cors";

dotenv.config();

const serverPort : string = process.env.PORT || '';
const frontPort : string = process.env.FRONTEND_PORT || '';
const whiteList : string[] = [
  `http://127.0.0.1:${serverPort}`,
  `http://127.0.0.1:${frontPort}`,
  `http://localhost:${serverPort}`,
  `http://localhost:${frontPort}`,
  `http://127.0.0.1:5500` // this origin used for test websocket
];

const corsOption : cors.CorsOptions = {
   origin : (origin, cb) => {
    if (origin && whiteList.indexOf(origin) !== -1)
        cb(null, true);
    else
        cb(new Error("not allowed by cors"));
   },
   methods : ["GET", "POST", "PUT", "DELETE"],
   allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
   credentials: true, // Allow cookies/auth headers
};

export default corsOption;