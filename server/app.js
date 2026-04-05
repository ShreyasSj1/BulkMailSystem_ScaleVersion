import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import emailRoutes from "./routes/emailRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Email system is running."
  });
});

app.use("/api/email", emailRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

app.use((err, _req, res, _next) => {
  console.error(`[${new Date().toISOString()}] Unhandled error:`, err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error."
  });
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `[${new Date().toISOString()}] Server listening on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Failed to start server:`,
      error
    );
    process.exit(1);
  }
};

startServer();
