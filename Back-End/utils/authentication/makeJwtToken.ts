import jwt, {SignOptions} from 'jsonwebtoken';
import { JwtToken } from '../../interface/jwtToken';

const makeJwtToken = (info: JwtToken): string => {
  const { userId, role, time, secret }: JwtToken = info;
  if (!userId || !role || !time || !secret)
    return "";

  const options : SignOptions = {
    expiresIn: time as any
  };
  return jwt.sign(
    {
      userInfo: {
        userId,
        role,
      },
    },
    secret,
    options
  );
};

export default makeJwtToken;
