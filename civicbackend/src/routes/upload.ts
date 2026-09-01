// src/routes/upload.ts
import { Router, Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { db } from "../services/firebaseAdmin";
import { analyzeHazardImage } from "../services/hazardDetection";
import type { UploadAnalysisResponse } from "../types/upload";

const router = Router();

// Store the incoming file in memory (not on disk) before forwarding to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Generates a ticket ID like "BLR-2026-004" by counting existing complaints
// for a given city prefix and incrementing. Falls back to a timestamp suffix
// if the counter read fails, so we never crash on ID generation.
async function generateComplaintId(cityPrefix: string): Promise<string> {
  const year = new Date().getFullYear();
  const counterRef = db.collection("counters").doc(cityPrefix.toLowerCase());

  try {
    const newCount = await db.runTransaction(async (tx) => {
      const doc = await tx.get(counterRef);
      const current = doc.exists ? (doc.data()?.count as number) || 0 : 0;
      const next = current + 1;
      tx.set(counterRef, { count: next }, { merge: true });
      return next;
    });
    return `${cityPrefix.toUpperCase()}-${year}-${String(newCount).padStart(3, "0")}`;
  } catch (err) {
    console.error("Ticket counter failed, falling back to timestamp ID:", err);
    return `${cityPrefix.toUpperCase()}-${year}-${Date.now().toString().slice(-6)}`;
  }
}

router.post("/upload", upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No image file provided" });
    }

    // 1. Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "civic-iq/complaints" },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file!.buffer);
    });

    // 2. Ask Groq to analyze the hazard from the uploaded image URL
    const category = (req.body?.category as string) || "Civic Issue";
    const analysis = await analyzeHazardImage(uploadResult.secure_url, category);

    // 3. Generate a ticket ID and save the full complaint to Firestore
    const cityPrefix = (req.body?.cityPrefix as string) || "GEN"; // e.g. "BLR", "MUM"
    const complaintId = await generateComplaintId(cityPrefix);

    const complaintDoc = {
      id: complaintId,
      title: analysis.detectedProblem,
      description: (req.body?.description as string) || analysis.reasoning,
      category,
      status: "Pending",
      address: (req.body?.address as string) || null,
      latitude: req.body?.latitude ? Number(req.body.latitude) : null,
      longitude: req.body?.longitude ? Number(req.body.longitude) : null,
      reportedBy: (req.body?.reportedBy as string) || "Citizen Portal",
      reportedAt: new Date().toISOString(),
      images: [uploadResult.secure_url],
      voiceTranscript: (req.body?.voiceTranscript as string) || null,
      assignedWorkerId: null,
      completionProof: null,
      aiAnalysis: analysis,
    };

    await db.collection("complaints").doc(complaintId).set(complaintDoc);

    const response: UploadAnalysisResponse = {
      success: true,
      complaintId,
      image: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        sizeBytes: uploadResult.bytes,
        fileName: req.file.originalname,
      },
      analysis,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error("Upload/analysis failed:", err);
    return res.status(500).json({ success: false, error: "Upload or analysis failed" });
  }
});

export default router;
