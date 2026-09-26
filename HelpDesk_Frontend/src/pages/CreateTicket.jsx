import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const CreateTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const dashboardPath =
    user?.role === "Technician"
      ? "/technician"
      : "/dashboard";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.post("/api/tickets", {
        title: title.trim(),
        description: description.trim(),
      });

      navigate(dashboardPath);
    } catch (error) {
      console.error(
        "Create ticket error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to create ticket."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-blue-700 text-white px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">
            IT HelpDesk
          </h1>

          <p className="text-sm text-blue-100">
            University IT Support System
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(dashboardPath)}
          className="text-sm text-slate-500 hover:text-slate-800 mb-6"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-slate-800">
            Create Ticket
          </h2>

          <p className="text-slate-500 mt-2 mb-8">
            Tell us what you need help with.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="What do you need help with?"
                className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe the problem..."
                rows="6"
                className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(dashboardPath)}
                className="px-5 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateTicket;