import "dotenv/config";
import http from "node:http";
import path from "node:path";
import express from "express";
import cors from "cors";
import apiRouter from "./routes";
import { errorHandler } from "./middleware/error-handler";
import { setupVite } from "./utils/vite";

const app = express();

// --- Core middleware ---
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Simple request logger ---
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Health check ---
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// --- API routes ---
app.use("/api", apiRouter);
const clientDist = path.resolve(import.meta.dirname, "..", "..", "client", "dist");

if (process.env.NODE_ENV === "production") {
  console.log(`[Production] Serving static files from: ${clientDist}`);
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
const HOST =
  process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");

const server = http.createServer(app);

async function start() {
  if (process.env.NODE_ENV !== "production") {
    try {
      await setupVite(app, server);
    } catch (error) {
      console.error("Failed to initialize Vite middleware:", error);
      process.exit(1);
    }
  }

  server.listen(PORT, HOST, () => {
    console.log(`Server listening at http://${HOST}:${PORT}`);
  });
}

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Adjust PORT in .env.`);
  } else if (err.code === "ENOTSUP") {
    console.error(`Listen option not supported. Falling back to HOST=127.0.0.1.`);
  }
  console.error(err);
});

start();
