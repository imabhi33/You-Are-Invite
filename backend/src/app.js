import cors from "cors";
import express from "express";
import { env } from "./lib/env.js";
import apiRoutes from "./routes/api.js";

const app = express();

const allowedOrigins = (env.frontendOrigin || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes("*")) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  }
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use("/api", apiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.code === 11000) {
    return res.status(409).json({ message: "Duplicate data conflict. Please try again." });
  }
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS blocked for this origin" });
  }
  res.status(500).json({ message: "Internal server error" });
});

export default app;
