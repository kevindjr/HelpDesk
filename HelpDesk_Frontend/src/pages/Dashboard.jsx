import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const response = await api.get("/api/tickets");

        console.log("Tickets:", response.data);

        setTickets(response.data);
      } catch (error) {
        console.error(
          "Ticket load error:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

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
      <header className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            IT HelpDesk
          </h1>

          <p className="text-sm text-blue-100">
            University IT Support System
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium">
              {user?.name}
            </p>

            <p className="text-sm text-blue-100">
              {user?.role}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-50"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            Dashboard
          </h2>

          <button
            onClick={() => navigate("/tickets/create")}
            className="bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-800"
          >
            + Create Ticket
          </button>
        </div>

        {/* Ticket Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-slate-500">
              Open Tickets
            </p>

            <p className="text-3xl font-bold text-slate-800 mt-2">
              {loading ? "..." : openTickets}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-slate-500">
              In Progress
            </p>

            <p className="text-3xl font-bold text-slate-800 mt-2">
              {loading ? "..." : inProgressTickets}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-slate-500">
              Resolved
            </p>

            <p className="text-3xl font-bold text-slate-800 mt-2">
              {loading ? "..." : resolvedTickets}
            </p>
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-xl shadow-sm mt-6">
          <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">
              Recent Tickets
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Your latest support requests
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
                  className="px-6 py-5 flex items-center justify-between hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {ticket.title}
                    </p>

                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-slate-500">
                        Ticket #{ticket.id}
                      </p>

                      <span className="text-slate-300">
                        •
                      </span>

                      <p className="text-sm text-slate-500">
                        {ticket.category?.name || "Uncategorized"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ticket.status === "Open"
                          ? "bg-blue-100 text-blue-700"
                          : ticket.status === "InProgress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {ticket.status === "InProgress"
                        ? "In Progress"
                        : ticket.status}
                    </span>

                    <button
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
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

export default Dashboard;