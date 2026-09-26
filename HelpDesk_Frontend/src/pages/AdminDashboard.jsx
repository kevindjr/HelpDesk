import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const ticketsResponse = await api.get("/api/tickets");

        const techniciansResponse = await api.get(
          "/api/users/technicians"
        );

        setTickets(ticketsResponse.data);
        setTechnicians(techniciansResponse.data);
      } catch (error) {
        console.error(
          "Admin dashboard error:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await api.get("/api/users");

        setUsers(response.data);
      } catch (error) {
        console.error(
          "Load users error:",
          error.response?.data || error.message
        );
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleAssignTechnician = async (
    ticketId,
    technicianId
  ) => {
    try {
      const assignedTechId =
        technicianId === ""
          ? null
          : Number(technicianId);

      await api.put(`/api/tickets/${ticketId}`, {
        assignedTechId
      });

      setTickets((currentTickets) =>
        currentTickets.map((ticket) => {
          if (ticket.id !== ticketId) {
            return ticket;
          }

          const technician = technicians.find(
            (tech) => tech.id === assignedTechId
          );

          return {
            ...ticket,
            assignedTech: technician || null
          };
        })
      );
    } catch (error) {
      console.error(
        "Assignment error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to update technician assignment."
      );
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this ticket?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/tickets/${ticketId}`);

      setTickets((currentTickets) =>
        currentTickets.filter(
          (ticket) => ticket.id !== ticketId
        )
      );
    } catch (error) {
      console.error(
        "Delete ticket error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete ticket."
      );
    }
  };

  const handleChangeUserRole = async (
    userId,
    roleId
  ) => {
    if (userId === user?.id) {
      alert("You cannot change your own role.");
      return;
    }

    const selectedRole = Number(roleId);

    const confirmed = window.confirm(
      "Are you sure you want to change this user's role?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.put(
        `/api/users/${userId}/role`,
        {
          roleId: selectedRole
        }
      );

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === userId
            ? {
                ...currentUser,
                role: response.data.user.role
              }
            : currentUser
        )
      );

      // Refresh technician list in case
      // the role change affected technician assignment.
      const techniciansResponse = await api.get(
        "/api/users/technicians"
      );

      setTechnicians(techniciansResponse.data);
    } catch (error) {
      console.error(
        "Role update error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to update user role."
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "InProgress"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "Resolved"
  ).length;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-blue-700 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">
              IT HelpDesk
            </h1>

            <p className="text-sm text-blue-100">
              Administrator Dashboard
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-sm font-medium">
                {user?.name}
              </p>

              <p className="text-xs text-blue-100">
                {user?.role}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="text-sm text-blue-100 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Page Heading */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800">
            Ticket Management
          </h2>

          <p className="text-slate-500 mt-1">
            Manage university IT support requests.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-slate-500">
              Open Tickets
            </p>

            <p className="text-3xl font-semibold text-slate-800 mt-2">
              {openTickets}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-slate-500">
              In Progress
            </p>

            <p className="text-3xl font-semibold text-slate-800 mt-2">
              {inProgressTickets}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-slate-500">
              Resolved
            </p>

            <p className="text-3xl font-semibold text-slate-800 mt-2">
              {resolvedTickets}
            </p>
          </div>
        </div>

        {/* Tickets */}
        <div className="bg-white rounded-xl shadow-sm mt-6 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">
              All Tickets
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              View and manage all support requests.
            </p>
          </div>

          {loading ? (
            <div className="p-6 text-slate-500">
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-6 text-slate-500">
              No tickets found.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="px-6 py-5 flex items-center justify-between gap-6 hover:bg-slate-50"
                >
                  {/* Ticket Information */}
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {ticket.title}
                    </p>

                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-slate-500">
                        #{ticket.id}
                      </p>

                      <span className="text-slate-300">
                        •
                      </span>

                      <p className="text-sm text-slate-500">
                        {ticket.category?.name ||
                          "Uncategorized"}
                      </p>

                      <span className="text-slate-300">
                        •
                      </span>

                      <p className="text-sm text-slate-500">
                        {ticket.requester?.fullName ||
                          "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Ticket Controls */}
                  <div className="flex items-center gap-4 shrink-0">
                    {/* Assign Technician */}
                    <select
                      value={ticket.assignedTech?.id || ""}
                      onChange={(event) =>
                        handleAssignTechnician(
                          ticket.id,
                          event.target.value
                        )
                      }
                      disabled={
                        ticket.status === "Cancelled"
                      }
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        Unassigned
                      </option>

                      {technicians.map((technician) => (
                        <option
                          key={technician.id}
                          value={technician.id}
                        >
                          {technician.fullName}
                        </option>
                      ))}
                    </select>

                    {/* Status */}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ticket.status === "Open"
                          ? "bg-blue-100 text-blue-700"
                          : ticket.status === "InProgress"
                          ? "bg-yellow-100 text-yellow-700"
                          : ticket.status === "Resolved"
                          ? "bg-green-100 text-green-700"
                          : ticket.status === "Cancelled"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {ticket.status === "InProgress"
                        ? "In Progress"
                        : ticket.status}
                    </span>

                    {/* View */}
                    <button
                      onClick={() =>
                        navigate(`/tickets/${ticket.id}`)
                      }
                      className="text-blue-700 font-medium hover:underline"
                    >
                      View
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() =>
                        handleDeleteTicket(ticket.id)
                      }
                      className="text-red-600 font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Technician Information */}
        <div className="bg-white rounded-xl shadow-sm mt-6 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">
              Technicians
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Available technicians for ticket assignment.
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {technicians.map((technician) => (
              <div
                key={technician.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {technician.fullName}
                  </p>

                  <p className="text-sm text-slate-500">
                    {technician.email}
                  </p>
                </div>

                <span className="text-sm text-slate-500">
                  {technician.department || "IT"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Manage Users */}
        <div className="bg-white rounded-xl shadow-sm mt-6 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">
              Manage Users
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              View users and manage their application roles.
            </p>
          </div>

          {usersLoading ? (
            <div className="p-6 text-slate-500">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {users.map((managedUser) => (
                <div
                  key={managedUser.id}
                  className="px-6 py-5 flex items-center justify-between gap-6 hover:bg-slate-50"
                >
                  {/* User Information */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800">
                        {managedUser.fullName}
                      </p>

                      {managedUser.id === user?.id && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-500 mt-1">
                      {managedUser.email}
                    </p>

                    <p className="text-sm text-slate-400 mt-1">
                      {managedUser.department || "No department"}
                    </p>
                  </div>

                  {/* Role */}
                  <select
                    value={managedUser.role.id}
                    onChange={(event) =>
                      handleChangeUserRole(
                        managedUser.id,
                        event.target.value
                      )
                    }
                    disabled={managedUser.id === user?.id}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <option value="1">
                      Student
                    </option>

                    <option value="2">
                      Faculty
                    </option>

                    <option value="3">
                      Technician
                    </option>

                    <option value="4">
                      Administrator
                    </option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;