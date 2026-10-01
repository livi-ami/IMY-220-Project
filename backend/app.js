import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import friendRoutes from "./routes/friends.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import albumRoutes from "./routes/albums.js";
import feedRoutes from "./routes/feed.js";
import searchRoutes from "./routes/search.js";
import imageRoutes from "./routes/images.js";
import reportRoutes from "./routes/reports.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/friends", friendRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/comments", commentRoutes);
  app.use("/api/albums", albumRoutes);
  app.use("/api/feed", feedRoutes);
  app.use("/api/search", searchRoutes);
  app.use("/api/images", imageRoutes);
  app.use("/api", reportRoutes); // /api/report-reasons, /api/reports

  app.use(notFound);
  app.use(errorHandler);
  return app;
}