// backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // MODO DEMO: permite usar la app sin login
    if (process.env.DISABLE_AUTH === "true") {
      req.user = {
        id: process.env.DEMO_USER_ID || "00000000-0000-0000-0000-000000000000",
        email: "demo@enfermeria.up.edu",
        nombre: "Demo",
        rol: "admin",
      };

      return next();
    }

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No se proporcionó token de autenticación",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token inválido",
    });
  }
};

const authorize = (requiredRole) => {
  return (req, res, next) => {
    if (process.env.DISABLE_AUTH === "true") {
      return next();
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "No autenticado",
      });
    }

    if (requiredRole && req.user.rol !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: "Permisos insuficientes",
        required_role: requiredRole,
      });
    }

    next();
  };
};

module.exports = { auth, authorize };
