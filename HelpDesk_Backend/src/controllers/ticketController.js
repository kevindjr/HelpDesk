const prisma = require("../config/prisma");

const suggestCategory = require("../ai/categorySuggestion");

const canAccessTicket = (ticket, user) => {
  if (user.role === "Administrator") {
    return true;
  }

  if (
    (user.role === "Student" || user.role === "Faculty") &&
    ticket.requesterId === user.userId
  ) {
    return true;
  }

  if (
    user.role === "Technician" &&
    ticket.assignedTechId === user.userId
  ) {
    return true;
  }

  return false;
};

const getAllTickets = async (req, res) => {
  try {
    let where = {};

    if (
      req.user.role === "Student" ||
      req.user.role === "Faculty"
    ) {
      where = {
        requesterId: req.user.userId
      };
    } else if (req.user.role === "Technician") {
      where = {
        assignedTechId: req.user.userId
      };
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        category: true,
        requester: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        assignedTech: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(tickets);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get tickets"
    });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticketId = Number(req.params.id);

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId
      },
      include: {
        category: true
      }
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    // Students and Faculty can only view their own tickets
    if (
      (req.user.role === "Student" || req.user.role === "Faculty") &&
      ticket.requesterId !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Technicians can only view tickets assigned to them
    if (
      req.user.role === "Technician" &&
      ticket.assignedTechId !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Administrators can view any ticket

    res.json(ticket);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get ticket"
    });
  }
};

const createTicket = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      priority
    } = req.body;

    // Ask Gemini to suggest a category
    const suggestedCategory = await suggestCategory(
      title,
      description
    );

    // Find the matching category in the database
    const category = await prisma.category.findFirst({
      where: {
        name: {
          equals: suggestedCategory
        }
      }
    });

    if (!category) {
      return res.status(500).json({
        message: "Invalid category"
      });
    }

    // Create the ticket
    const ticket = await prisma.ticket.create({
      data: {
        requesterId: req.user.userId,
        title,
        description,
        location,
        priority,
        categoryId: category.id
      }
    });

    res.status(201).json({
      message: "Ticket created successfully",
      ticket,
      aiCategory: category.name
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create ticket"
    });
  }
};

const updateTicket = async (req, res) => {
  try {
    const ticketId = Number(req.params.id);

    const {
      assignedTechId,
      categoryId,
      status,
      priority,
      isUrgentFlag
    } = req.body;

    // Get the current ticket
    const oldTicket = await prisma.ticket.findUnique({
      where: {
        id: ticketId
      }
    });

    if (!oldTicket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    // Cancelled tickets cannot be modified
    if (oldTicket.status === "Cancelled") {
      return res.status(400).json({
        message: "Cancelled tickets cannot be modified"
      });
    }


    // Students and Faculty cannot update tickets
    if (
      req.user.role === "Student" ||
      req.user.role === "Faculty"
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Technicians can only update tickets assigned to them
    if (req.user.role === "Technician") {
      if (oldTicket.assignedTechId !== req.user.userId) {
        return res.status(403).json({
          message: "Access denied"
        });
      }

      // Technicians cannot assign or unassign technicians
      if (assignedTechId !== undefined) {
        return res.status(403).json({
          message: "Only Administrators can assign technicians"
        });
      }
    }

    // Only Administrators can assign or unassign technicians
    if (
      assignedTechId !== undefined &&
      req.user.role !== "Administrator"
    ) {
      return res.status(403).json({
        message: "Only Administrators can assign technicians"
      });
    }

    // Validate status transitions
    if (status !== undefined && status !== oldTicket.status) {
      const allowedTransitions = {
        Open: ["InProgress"],
        InProgress: ["Resolved"],
        Resolved: [],
        Cancelled: []
      };

      const allowedNextStatuses =
        allowedTransitions[oldTicket.status] || [];

      if (!allowedNextStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status transition from ${oldTicket.status} to ${status}`
        });
      }
    }

    // Update the ticket
    const ticket = await prisma.ticket.update({
      where: {
        id: ticketId
      },
      data: {
        ...(assignedTechId !== undefined && {
          assignedTechId:
            assignedTechId === null || assignedTechId === ""
              ? null
              : Number(assignedTechId)
        }),
        ...(categoryId !== undefined && {
          categoryId: Number(categoryId)
        }),
        ...(status !== undefined && {
          status
        }),
        ...(priority !== undefined && {
          priority
        }),
        ...(isUrgentFlag !== undefined && {
          isUrgentFlag
        })
      }
    });

    // Record status change
    if (status && status !== oldTicket.status) {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticketId,
          changedById: req.user.userId,
          action: "Status changed",
          previousStatus: oldTicket.status,
          newStatus: status
        }
      });
    }

    // Record technician assignment
    if (
      assignedTechId !== undefined &&
      (assignedTechId === null ||
        assignedTechId === "" ||
        Number(assignedTechId) !== oldTicket.assignedTechId)
    ) {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticketId,
          changedById: req.user.userId,
          action:
            assignedTechId === null || assignedTechId === ""
              ? "Technician unassigned"
              : "Technician assigned"
        }
      });
    }

    res.json(ticket);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update ticket"
    });
  }
};
const deleteTicket = async (req, res) => {
  try {
    const ticketId = Number(req.params.id);

    // Only Administrators can delete tickets
    if (req.user.role !== "Administrator") {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId
      }
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    await prisma.ticket.delete({
      where: {
        id: ticketId
      }
    });

    res.json({
      message: "Ticket deleted successfully",
      ticket
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete ticket"
    });
  }
};

const cancelTicket = async (req, res) => {
  try {
    const ticketId = Number(req.params.id);

    // Only Students and Faculty can cancel tickets
    if (
      req.user.role !== "Student" &&
      req.user.role !== "Faculty"
    ) {
      return res.status(403).json({
        message: "Only Students and Faculty can cancel tickets"
      });
    }

    // Find the ticket
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId
      }
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    // Users can only cancel their own tickets
    if (ticket.requesterId !== req.user.userId) {
      return res.status(403).json({
        message: "You can only cancel your own tickets"
      });
    }

    // Ticket can only be cancelled while it is still Open
    if (ticket.status !== "Open") {
      return res.status(400).json({
        message: "Only Open tickets can be cancelled"
      });
    }

    // Change status to Cancelled
    const cancelledTicket = await prisma.ticket.update({
      where: {
        id: ticketId
      },
      data: {
        status: "Cancelled"
      }
    });

    // Record cancellation in ticket history
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticketId,
        changedById: req.user.userId,
        action: "Ticket cancelled",
        previousStatus: "Open",
        newStatus: "Cancelled"
      }
    });

    res.json({
      message: "Ticket cancelled successfully",
      ticket: cancelledTicket
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to cancel ticket"
    });
  }
};

const getTicketHistory = async (req, res) => {
  try {
    const ticketId = Number(req.params.id);

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId
      }
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    if (!canAccessTicket(ticket, req.user)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const history = await prisma.ticketHistory.findMany({
      where: {
        ticketId: ticketId
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    res.json(history);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get ticket history"
    });
  }
};

const createTicketComment = async (req, res) => {
  try {
    const ticketId = Number(req.params.id);

    const {
      body
    } = req.body;

    // Check that the ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId
      }
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    // Students and Faculty can comment only on their own tickets
    if (
      (req.user.role === "Student" || req.user.role === "Faculty") &&
      ticket.requesterId !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Technicians can comment only on tickets assigned to them
    if (
      req.user.role === "Technician" &&
      ticket.assignedTechId !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId,
        authorId: req.user.userId,
        body
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create ticket comment"
    });
  }
};

const getTicketComments = async (req, res) => {
  try {
    const ticketId = Number(req.params.id);

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId
      }
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    if (!canAccessTicket(ticket, req.user)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const comments = await prisma.ticketComment.findMany({
      where: {
        ticketId: ticketId
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    res.json(comments);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get ticket comments"
    });
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  cancelTicket,
  getTicketHistory,
  createTicketComment,
  getTicketComments
};