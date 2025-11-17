import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your_jwt_secret_key_change_in_env";

// Extend Express Request to include custom properties
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      username?: string;
    }
  }
}

// Verify JWT token
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      username: string;
      role: string;
    };

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.username = decoded.username;

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

// Check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Admin access required" });
  }

  next();
};

// Check if user is authenticated
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.userId) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }

  next();
};
