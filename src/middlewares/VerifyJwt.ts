import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest } from "../../types";
export default async function VerifyJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader: string | string[] | undefined =
    req.headers?.authorization || req.headers?.Authorization;
  const authValue = authHeader as string;
  if (!authValue?.startsWith("Bearer")) return res.status(401);
  const token = authValue.split(" ")[1];
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET!,
    (error: any, decode: any) => {
      if (error) {
        console.log(error);
        return res.status(403);
      }
      (req as CustomRequest).email = decode.UserInfo.email;
      (req as CustomRequest).id = decode.UserInfo.userId;
      (req as CustomRequest).type = decode.UserInfo.type;
      next();
    }
  );
}
