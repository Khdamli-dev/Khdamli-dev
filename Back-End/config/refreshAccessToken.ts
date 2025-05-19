import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import makeJwtToken from "../utils/authentication/makeJwtToken";
import { JwtToken, JwtUserPayload } from "../interface/jwtToken";

dotenv.config();

const refreshAccessToken = (req: Request, res: Response) => {
  const refreshTokenSecret: string | undefined =
    process.env.Refresh_Token_Secret;
  if (!refreshTokenSecret) {
    res.status(500).json({
      message: "internal error",
      success: false,
    });
    return;
  }

  const refreshHeader = req.headers["x-refresh-token"] as string;
  const refreshToken: string =
    req.cookies?.refreshToken || refreshHeader?.split(" ")[1];
  if (!refreshToken) {
    res.status(403).json({
      message: "you are forbidden, dont have refresh token",
      success: false,
    });
    return;
  }

  // check refresh token
  jwt.verify(refreshToken, refreshTokenSecret, (err, decode) => {
    if (err) {
      res.status(403).json({
        message: "you are forbidden, fake refresh token",
        success: false,
      });
      return;
    }

    // generate new access token
    const decodedToken: JwtUserPayload = decode as JwtUserPayload;
    const { userId, role }: { userId: string; role: string } =
      decodedToken.userInfo;
    let info: JwtToken = {
      userId,
      role,
      time: "30m",
      secret: process.env.Access_Token_Secret || "",
    };
    const accessToken = makeJwtToken(info);
    res.status(200).json({
      success: true,
      message: "generate new access token with success",
      accessToken,
    });
  });
};

export default refreshAccessToken;
