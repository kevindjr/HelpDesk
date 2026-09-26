import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import CreateTicket from "./pages/CreateTicket";
import TicketDetails from "./pages/TicketDetails";
import AdminDashboard from "./pages/AdminDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/auth/callback"
          element={<AuthCallback />}
        />

        {/* Student / Faculty Dashboard */}
        <Route
          path="/dashboard"
          element={
            <RoleRoute
              allowedRoles={["Student", "Faculty"]}
            >
              <Dashboard />
            </RoleRoute>
          }
        />

        {/* Create Ticket */}
        <Route
          path="/tickets/create"
          element={
            <RoleRoute
              allowedRoles={["Student", "Faculty", "Technician"]}
            >
              <CreateTicket />
            </RoleRoute>
          }
        />

        {/* Ticket Details */}
        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <TicketDetails />
            </ProtectedRoute>
          }
        />

        {/* Administrator */}
        <Route
          path="/admin"
          element={
            <RoleRoute
              allowedRoles={["Administrator"]}
            >
              <AdminDashboard />
            </RoleRoute>
          }
        />

        {/* Technician */}
        <Route
          path="/technician"
          element={
            <RoleRoute
              allowedRoles={["Technician"]}
            >
              <TechnicianDashboard />
            </RoleRoute>
          }
        />

        {/* Default */}
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;