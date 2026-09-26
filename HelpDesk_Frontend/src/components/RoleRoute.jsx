import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ allowedRoles, children }) => {
  const { user, token } = useAuth();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "Administrator") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "Technician") {
      return <Navigate to="/technician" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;