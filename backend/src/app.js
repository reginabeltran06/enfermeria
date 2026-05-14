// backend/src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Middleware de seguridad
app.use(helmet());

// CORS - Permitir solicitudes del frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rutas de salud
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Versión de API
app.get("/api/version", (req, res) => {
  res.json({ version: "1.0.0", name: "Pharmacy Inventory API" });
});

// Importar rutas
const authRoutes = require("./routes/auth");
const medicinesRoutes = require("./routes/medicines");
const inventoryRoutes = require("./routes/inventory");
const alertsRoutes = require("./routes/alerts");
const historyRoutes = require("./routes/history");

// Registrar rutas
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicinesRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/history", historyRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API del Sistema de Inventario de Enfermería funcionando",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      medicines: "/api/medicines",
      inventory: "/api/inventory",
      alerts: "/api/alerts",
    },
  });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";

  res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
