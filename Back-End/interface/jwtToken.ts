export interface JwtToken {
  userId: string;
  role: string;
  time: number | string;
  secret: string;
}

export interface JwtUserPayload {
  userInfo: {
    userId: string;
    role: string;
  };
}