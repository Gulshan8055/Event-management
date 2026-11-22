import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(
  helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }),
);
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.get("/", (_req, res) =>
  res.json({ status: "ok", success: false, messsage: "server is running " }),
);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);

// In production, serve the built React app from the same server
if (process.env.NODE_ENV === "production") {
  const dist = path.join(__dirname, "../client/dist");
  app.use(express.static(dist));
  app.get("*", (req, res, next) =>
    req.originalUrl.startsWith("/api")
      ? next()
      : res.sendFile(path.join(dist, "index.html")),
  );
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() =>
    app.listen(PORT, () =>
      console.log(`API running on http://localhost:${PORT}`),
    ),
  )
  .catch((err) => {
    console.error("Failed to start:", err.message);
    process.exit(1);
  });
