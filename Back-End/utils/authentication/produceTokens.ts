import JwtToken from '../../interface/jwtToken';
import makeJwtToken from './makeJwtToken';

const produceTokens = (id: number, role: number) : {accessToken : string, refreshToken : string} => {
  if (!id || !role)
    return {accessToken : "", refreshToken : ""};

  let info: JwtToken = {
    userId: id.toString(),
    role: role.toString(),
    time: '30m', // 30 minute
    secret: process.env.Access_Token_Secret || '',
  };
  const accessToken = makeJwtToken(info);
  // update time and secret for refresh token
  info.time = '7d'; // 7 days
  info.secret = process.env.Refresh_Token_Secret || '';
  const refreshToken = makeJwtToken(info);
  return {accessToken, refreshToken};
};

export default produceTokens;
