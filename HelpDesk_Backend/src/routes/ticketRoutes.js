const express = require("express");

const {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  cancelTicket,
  getTicketHistory,
  createTicketComment,
  getTicketComments
} = require("../controllers/ticketController");

const {
  authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", getAllTickets);

router.get("/:id/history", getTicketHistory);

router.get("/:id/comments", getTicketComments);

router.get("/:id", getTicketById);

router.post("/", createTicket);

router.post("/:id/comments", createTicketComment);

router.post("/:id/cancel", cancelTicket);

router.put("/:id", updateTicket);

router.delete("/:id", deleteTicket);

module.exports = router;