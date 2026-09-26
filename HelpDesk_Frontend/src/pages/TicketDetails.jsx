import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const dashboardPath =
    user?.role === "Administrator"
      ? "/admin"
      : user?.role === "Technician"
      ? "/technician"
      : "/dashboard";

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      setSendingComment(true);

      const response = await api.post(
        `/api/tickets/${id}/comments`,
        {
          body: newComment.trim()
        }
      );

      setComments((currentComments) => [
        ...currentComments,
        response.data
      ]);

      setNewComment("");
    } catch (error) {
      console.error(
        "Comment error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to add comment."
      );
    } finally {
      setSendingComment(false);
    }
  };

  const handleCancelTicket = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this ticket?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);

      const response = await api.post(
        `/api/tickets/${id}/cancel`
      );

      setTicket(response.data.ticket);

      const historyResponse = await api.get(
        `/api/tickets/${id}/history`
      );

      setHistory(historyResponse.data);
    } catch (error) {
      console.error(
        "Cancel ticket error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to cancel ticket."
      );
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const ticketResponse = await api.get(
          `/api/tickets/${id}`
        );

        const historyResponse = await api.get(
          `/api/tickets/${id}/history`
        );

        const commentsResponse = await api.get(
          `/api/tickets/${id}/comments`
        );

        setTicket(ticketResponse.data);
        setHistory(historyResponse.data);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error(
          "Ticket details error:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load ticket."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500">
          Loading ticket...
        </p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "Ticket not found."}
          </p>

          <button
            onClick={() => navigate(dashboardPath)}
            className="text-blue-700 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const canCancel =
    (user?.role === "Student" ||
      user?.role === "Faculty") &&
    ticket.requesterId === user?.id &&
    ticket.status === "Open";

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-blue-700 text-white px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-semibold">
            IT HelpDesk
          </h1>

          <p className="text-sm text-blue-100">
            University IT Support System
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(dashboardPath)}
          className="text-sm text-slate-500 hover:text-slate-800 mb-6"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Ticket Header */}
          <div className="p-8 border-b border-slate-200">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-2">
                  Ticket #{ticket.id}
                </p>

                <h2 className="text-2xl font-semibold text-slate-800">
                  {ticket.title}
                </h2>
              </div>

              <span
                className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium ${
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
            </div>
          </div>

          {/* Ticket Information */}
          <div className="p-8">
            <div className="mb-8">
              <p className="text-sm font-medium text-slate-500 mb-2">
                Description
              </p>

              <p className="text-slate-700 leading-7">
                {ticket.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
              <div>
                <p className="text-sm text-slate-500">
                  Category
                </p>

                <p className="font-medium text-slate-800 mt-1">
                  {ticket.category?.name ||
                    "Uncategorized"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Created
                </p>

                <p className="font-medium text-slate-800 mt-1">
                  {new Date(
                    ticket.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Cancel Ticket */}
            {canCancel && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-slate-800">
                      Need to cancel this request?
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      You can cancel this ticket while it is still open.
                    </p>
                  </div>

                  <button
                    onClick={handleCancelTicket}
                    disabled={cancelling}
                    className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling
                      ? "Cancelling..."
                      : "Cancel Ticket"}
                  </button>
                </div>
              </div>
            )}

            {/* Activity */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Activity
              </h3>

              {history.length === 0 ? (
                <p className="text-sm text-slate-500 mt-4">
                  No activity yet.
                </p>
              ) : (
                <div className="mt-5 space-y-5">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />

                      <div>
                        <p className="font-medium text-slate-800">
                          {item.action}
                        </p>

                        {item.previousStatus &&
                          item.newStatus && (
                            <p className="text-sm text-slate-500 mt-1">
                              {item.previousStatus ===
                              "InProgress"
                                ? "In Progress"
                                : item.previousStatus}{" "}
                              →{" "}
                              {item.newStatus ===
                              "InProgress"
                                ? "In Progress"
                                : item.newStatus}
                            </p>
                          )}

                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(
                            item.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Comments
              </h3>

              {comments.length === 0 ? (
                <p className="text-sm text-slate-500 mt-4">
                  No comments yet.
                </p>
              ) : (
                <div className="mt-5 space-y-5">
                  {comments.map((comment) => (
                    <div key={comment.id}>
                      <p className="font-medium text-slate-800">
                        {comment.author?.fullName ||
                          "User"}
                      </p>

                      <p className="text-sm text-slate-600 mt-1">
                        {comment.body}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(
                          comment.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="mt-6">
                <textarea
                  value={newComment}
                  onChange={(event) =>
                    setNewComment(event.target.value)
                  }
                  placeholder="Add a comment..."
                  rows="3"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />

                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleAddComment}
                    disabled={
                      sendingComment ||
                      !newComment.trim()
                    }
                    className="px-5 py-2.5 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingComment
                      ? "Sending..."
                      : "Send"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TicketDetails;