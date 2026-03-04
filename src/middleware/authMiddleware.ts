import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "nakornping-secret-key-2026"; // Default

export interface StaffJwtPayload {
  staffId: number;
  role: string;
  departmentId: number;
}

declare global {
  namespace Express {
    interface Request {
      staff?: StaffJwtPayload;
    }
  }
}

export function requireStaffAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET!) as StaffJwtPayload;
    req.staff = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}