import { ShieldCheck } from "lucide-react";

const Login = () => {
  const handleMicrosoftLogin = () => {
    window.location.href = "http://localhost:3000/auth/login";
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            IT HelpDesk
          </h1>

          <p className="text-slate-500 mt-2">
            University IT Support System
          </p>
        </div>

        <button
          onClick={handleMicrosoftLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
        >
          Sign in with Microsoft
        </button>

        <p className="text-center text-sm text-slate-400 mt-6">
          Use your university Microsoft account to continue.
        </p>
      </div>
    </div>
  );
};

export default Login;