const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { loadSecrets } = require("./config/secrets");

const startServer = async () => {
  try {
    // Load secrets from Azure Key Vault first
    await loadSecrets();

    // Import Prisma only after secrets are loaded
    const prisma = require("./config/prisma");

    const ticketRoutes = require("./routes/ticketRoutes");
    const userRoutes = require("./routes/userRoutes");
    const authRoutes = require("./auth/authRoutes");

    const {
      authenticateToken,
      authorizeRoles
    } = require("./middleware/authMiddleware");

    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Authentication routes
    app.use("/auth", authRoutes);

    // Ticket routes
    app.use("/api/tickets", ticketRoutes);

    // User routes
    app.use("/api/users", userRoutes);

    // Test route
    app.get("/", (req, res) => {
      res.json({
        message: "IT HelpDesk API is running"
      });
    });

    // Database test route
    app.get("/api/test-db", async (req, res) => {
      try {
        await prisma.$queryRaw`SELECT 1`;

        res.json({
          message: "Database connection successful"
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          message: "Database connection failed"
        });
      }
    });

    // Protected test route
    app.get("/api/protected", authenticateToken, (req, res) => {
      res.json({
        message: "You accessed a protected API",
        user: req.user
      });
    });

    // Admin-only test route
    app.get(
      "/api/admin",
      authenticateToken,
      authorizeRoles("Administrator"),
      (req, res) => {
        res.json({
          message: "You accessed the Administrator API",
          user: req.user
        });
      }
    );

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:");
    console.error(error);
    process.exit(1);
  }
};

startServer();