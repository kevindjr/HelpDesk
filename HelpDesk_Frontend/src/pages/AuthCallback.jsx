import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const userData = searchParams.get("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(userData);

      login(user, token);

      if (user.role === "Administrator") {
        navigate("/admin");
      } else if (user.role === "Technician") {
        navigate("/technician");
      } else {
        navigate("/dashboard");
      }
      
    } catch (error) {
      console.error("Login callback error:", error);
      navigate("/login");
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>

        <p className="text-slate-600">
          Signing you in...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;