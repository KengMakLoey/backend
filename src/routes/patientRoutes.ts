import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import * as schema from "../../db/schema.js";
import { buildQueueData } from "../services/queueService.js";

const router = Router();

/**
 * GET /api/queue/:vn
 * Get queue information by VN (Visit Number)
 */
router.get("/:vn", async (req: Request, res: Response) => {
  try {
    const { vn } = req.params;

    // Find visit with patient and queue information
    const visit = await db.query.visit.findFirst({
      where: eq(schema.visit.vn, vn),
      with: {
        patient: true,
        queue: { with: { department: true } },
      },
    });

    if (!visit || !visit.queue) {
      res.status(404).json({ error: "Queue not found" });
      return;
    }

    // Build complete queue data
    const queueData = await buildQueueData(visit.queue.queueId);
    res.json(queueData);
  } catch (error) {
    console.error("Error in GET /api/queue/:vn:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;