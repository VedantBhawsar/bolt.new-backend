import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CONSTANTS } from "../constants";
import { User } from "../models/User";

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token;

    // Check for token in authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Extract token
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      res.status(401).json({ message: "Not authorized, no token provided" });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, CONSTANTS.JWT_SECRET) as { id: string };

    // Check if user exists
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401).json({ message: "Not authorized, user not found" });
      return;
    }

    // Attach user to request
    // @ts-ignore
    req.user = { id: user._id.toString() };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};
