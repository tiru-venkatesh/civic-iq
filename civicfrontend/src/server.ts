/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * CivicIQ AI Copilot backend — plain Express API server (no Vite/frontend
 * serving here). The frontend (civic-iq-frontend) calls this over HTTP.
 *
 * Env vars required (.env at repo root, never committed — see .env.example):
 *   GROQ_API_KEY=your_key_here
 *   PORT=3001
 *   CORS_ORIGIN=http://localhost:5173  (comma-separated for multiple origins)
 */
import "dotenv/config"; // MUST be first — loads .env before any other import runs
import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat";
import uploadRoutes from "./routes/upload";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const allowedOrigins = (process.env.CORS_ORIGIN || "civic-iq-demo-final.vercel.app")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// All copilot chat endpoints live under /api/copilot (see routes/chat.ts)
app.use("/api/copilot", chatRoutes);
app.use("/api/reports", uploadRoutes);

app.listen(PORT, () => {
  console.log(`🚀 CivicIQ Copilot running on http://localhost:${PORT}`);
});
