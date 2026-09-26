const express = require("express");
const prisma = require("../config/prisma");
const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all technicians
router.get(
  "/technicians",
  authenticateToken,
  authorizeRoles("Administrator"),
  async (req, res) => {
    try {
      const technicians = await prisma.user.findMany({
        where: {
          role: {
            name: "Technician"
          }
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          department: true
        },
        orderBy: {
          fullName: "asc"
        }
      });

      res.json(technicians);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to get technicians"
      });
    }
  }
);

// Get all users
router.get(
  "/",
  authenticateToken,
  authorizeRoles("Administrator"),
  async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          department: true,
          createdAt: true,
          role: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          fullName: "asc"
        }
      });

      res.json(users);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to get users"
      });
    }
  }
);

// Change user role
router.put(
  "/:id/role",
  authenticateToken,
  authorizeRoles("Administrator"),
  async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const { roleId } = req.body;

      // Validate user ID
      if (Number.isNaN(userId)) {
        return res.status(400).json({
          message: "Invalid user ID"
        });
      }

      // Validate role ID
      if (roleId === undefined || roleId === null) {
        return res.status(400).json({
          message: "Role ID is required"
        });
      }

      const newRoleId = Number(roleId);

      if (Number.isNaN(newRoleId)) {
        return res.status(400).json({
          message: "Invalid role ID"
        });
      }

      // Find the user
      const user = await prisma.user.findUnique({
        where: {
          id: userId
        },
        include: {
          role: true
        }
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      // Prevent Admin from changing their own role
      if (user.id === req.user.userId) {
        return res.status(400).json({
          message: "You cannot change your own role"
        });
      }

      // Find the new role
      const newRole = await prisma.role.findUnique({
        where: {
          id: newRoleId
        }
      });

      if (!newRole) {
        return res.status(400).json({
          message: "Role not found"
        });
      }

      // Update user role
      const updatedUser = await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          roleId: newRoleId
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          department: true,
          role: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      res.json({
        message: "User role updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to update user role"
      });
    }
  }
);

module.exports = router;