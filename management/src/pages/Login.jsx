import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = "admin@gmail.com";
    const password = "admin123";

    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    } else {
      console.error("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Admin Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field (Read-Only) */}
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value="admin@gmail.com"
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-200 cursor-not-allowed"
            />
          </div>

          {/* Password Field (Read-Only) */}
          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              value="admin123"
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-200 cursor-not-allowed"
            />
          </div>

          {/* Auto-Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
