const express = require("express");
const jwt = require("jsonwebtoken");

const cca = require("./entraAuth");
const prisma = require("../config/prisma");

const router = express.Router();

// Start Microsoft login
router.get("/login", async (req, res) => {
  try {
    const authCodeUrlParameters = {
      scopes: ["openid", "profile", "email"],
      redirectUri: "http://localhost:3000/auth/callback"
    };

    const authUrl = await cca.getAuthCodeUrl(authCodeUrlParameters);

    res.redirect(authUrl);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to start Microsoft login"
    });
  }
});

// Microsoft login callback
router.get("/callback", async (req, res) => {
  try {
    const tokenRequest = {
      code: req.query.code,
      scopes: ["openid", "profile", "email"],
      redirectUri: "http://localhost:3000/auth/callback"
    };

    const response = await cca.acquireTokenByCode(tokenRequest);

    const claims = response.idTokenClaims;

    const adObjectId = claims.oid;
    const email = claims.preferred_username || claims.email;
    const fullName = claims.name;

    // Find the user in our database
    let user = await prisma.user.findUnique({
      where: {
        adObjectId: adObjectId
      },
      include: {
        role: true
      }
    });

    // Create a new user if they do not exist
    if (!user) {
      const studentRole = await prisma.role.findUnique({
        where: {
          name: "Student"
        }
      });

      if (!studentRole) {
        return res.status(500).json({
          message: "Student role not found"
        });
      }

      user = await prisma.user.create({
        data: {
          roleId: studentRole.id,
          adObjectId: adObjectId,
          email: email,
          fullName: fullName,
          department: null
        },
        include: {
          role: true
        }
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role.name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    // User information for React
    const userData = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role.name
    };

    // Send JWT and user information to React
    const params = new URLSearchParams({
      token: token,
      user: JSON.stringify(userData)
    });

    res.redirect(
      `http://localhost:5173/auth/callback?${params.toString()}`
    );

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Microsoft login failed"
    });
  }
});

// Login success page
router.get("/success", (req, res) => {
  res.json({
    message: "Microsoft login successful"
  });
});

module.exports = router;