import jwt, { type JwtPayload } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";

/** vrací podepsaný access token (subject = userId) */
export function signAccessToken(sub: string): string {
  return jwt.sign({ sub }, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}

/** vrací podepsaný refresh token (subject = userId, jti volitelně) */
export function signRefreshToken(sub: string, jti?: string): string {
  const payload: JwtPayload = { sub, ...(jti ? { jti } : {}) };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}

export function verifyAccess(token: string): JwtPayload & { sub: string } {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload & { sub: string };
}

export function verifyRefresh(token: string): JwtPayload & { sub: string } {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload & { sub: string };
}
