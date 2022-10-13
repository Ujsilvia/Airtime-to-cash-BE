// import { Request, Response, NextFunction } from "express";
// import { verify } from "jsonwebtoken";

// import { UserInstance } from "../model/userModel";

// const secret = (process.env.JWT_SECRET as string) || "secret";
// export async function auth(req: Request, res: Response, next: NextFunction) {
//   try {
//     const authorization = req.headers.authorization;
//     if (!authorization && !req.cookies.token) {
//       return res
//         .status(401)
//         .json({ message: "Authentication required. Please login" });
//     }

//     const token =
//       authorization?.slice(7, authorization.length) ||
//       (req.cookies.token as string);
//     const verified = verify(token, secret);
//     if (!verified) {
//       return res
//         .status(401)
//         .json({ message: "Token expired/invalid. Please login" });
//     }

//     const { id } = verified as { [key: string]: string };

//     const usertype = req.cookies.usertype as string;
//     let user;
//     switch (usertype) {
//       case "user":
//         user = await UserInstance.findByPk(id);
//         if (!user) {
//           return res
//             .status(401)
//             .json({ message: "User not found. Please login" });
//         }
//         req.user = user.getDataValue("id");
//         break;

//       default:
//         return res
//           .status(401)
//           .json({ message: "Not authorized. Please login" });
//     }
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "User not logged in" });
//   }
// }
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET as string;
import { UserInstance } from '../model/userModel';
export async function auth(req: Request | any, res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).json({
        Error: 'Kindly sign in as a user',
      });
    }
    const token = authorization?.slice(7, authorization.length) as string;
    let verified = jwt.verify(token, secret);
    if (!verified) {
      return res.status(401).json({
        Error: 'User not verified, you cant access this route',
      });
    }
    const { id } = verified as { [key: string]: string };
    const user = await UserInstance.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({
        Error: 'User not verified',
      });
    }
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({
      Error: 'User not logged in',
    });
  }
}
