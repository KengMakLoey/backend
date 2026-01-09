import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import * as schema from "../../db/schema.js";

const router = Router();

/**
 * POST /api/staff/login
 * Staff authentication endpoint
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password required" });
      return;
    }

    // Find staff user
    const staffUser = await db.query.staff.findFirst({
      where: eq(schema.staff.username, username),
      with: { department: true },
    });

    // Validate credentials
    if (!staffUser || staffUser.password !== password) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Return staff information
    res.json({
      success: true,
      staffId: staffUser.staffId,
      staffName: staffUser.staffName,
      role: staffUser.role,
      departmentId: staffUser.departmentId,
      departmentName: staffUser.department?.departmentName,
    });
  } catch (error) {
    console.error("Error in POST /api/staff/login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;