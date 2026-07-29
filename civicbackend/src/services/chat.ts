import { Router, Request, Response } from "express";
import { db } from "../services/firebaseAdmin";
import {
  findSimilarComplaints,
  findSimilarToComplaint,
  storeComplaintEmbedding,
} from "../services/similarComplaints";   // ✅ correct

const router = Router();

// POST /api/complaints/similar  { text, category?, topK?, excludeId? }
router.post("/similar", async (req: Request, res: Response) => {
  try {
    const { text, category, topK, excludeId } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "`text` is required and must be a string." });
    }
    const matches = await findSimilarComplaints(text, { category, topK, excludeId });
    res.json({ success: true, matches });
  } catch (error: any) {
    console.error("Similar complaints error:", error);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

// POST /api/complaints/:id/similar — looks up the complaint's own text first
router.post("/:id/similar", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category, topK } = req.body;

    const doc = await db.collection("complaints").doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: `Complaint ${id} not found.` });
    const data = doc.data() as any;

    const matches = await findSimilarToComplaint(
      { id, title: data.title, description: data.description, category: data.category },
      { category, topK }
    );
    res.json({ success: true, matches });
  } catch (error: any) {
    console.error("Similar complaints error:", error);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

// POST /api/complaints/:id/embed — call this once when a complaint is created
router.post("/:id/embed", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "`title` and `description` are required." });
    }
    await storeComplaintEmbedding(id, { title, description, category });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Embed complaint error:", error);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

export default router;
