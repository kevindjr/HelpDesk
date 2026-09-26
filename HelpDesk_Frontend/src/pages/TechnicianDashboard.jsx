import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const TechnicianDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const response = await api.get("/api/tickets");

        setTickets(response.data);
      } catch (error) {
        console.error(
          "Technician dashboard error:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load tickets."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await api.put(`/api/tickets/${ticketId}`, {
        status: newStatus
      });

      setTickets((currentTickets) =>
        currentTickets.map((ticket) => {
          if (ticket.id !== ticketId) {
            return ticket;
          }

          return {
            ...ticket,
            status: newStatus
          };
        })
      );
    } catch (error) {
      console.error(
        "Status update error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to update ticket status."
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
              Technician Dashboard
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
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">
              Assigned Tickets
            </h2>

            <p className="text-slate-500 mt-1">
              Review and manage your assigned IT support requests.
            </p>
          </div>

          <button
            onClick={() => navigate("/tickets/create")}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800"
          >
            Create Ticket
          </button>
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
              My Tickets
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Tickets assigned to your account.
            </p>
          </div>

          {loading ? (
            <div className="p-6 text-slate-500">
              Loading tickets...
            </div>
          ) : error ? (
            <div className="p-6 text-red-600">
              {error}
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-6 text-slate-500">
              No assigned tickets yet.
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
                    <select
                      value={ticket.status}
                      onChange={(event) =>
                        handleStatusChange(
                          ticket.id,
                          event.target.value
                        )
                      }
                      disabled={
                        ticket.status === "Resolved" ||
                        ticket.status === "Cancelled"
                      }
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value={ticket.status}>
                        {ticket.status === "InProgress"
                          ? "In Progress"
                          : ticket.status}
                      </option>

                      {ticket.status === "Open" && (
                        <option value="InProgress">
                          In Progress
                        </option>
                      )}

                      {ticket.status === "InProgress" && (
                        <option value="Resolved">
                          Resolved
                        </option>
                      )}
                    </select>

                    <button
                      onClick={() =>
                        navigate(`/tickets/${ticket.id}`)
                      }
                      className="text-blue-700 font-medium hover:underline"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TechnicianDashboard;