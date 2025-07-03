import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../shared/ThemeToggle";
import LoadingSpinner from "../shared/LoadingSpinner";
import { useAdminLogin } from "../hooks/useAdminLogin";
import { useTheme } from "../Utils/context";
import { InputField } from "../Component/Login/InputField";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { theme, toggleTheme } = useTheme(); 
  const { login, loading, error } = useAdminLogin();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result?.success) {
      navigate("/adminDashboard");
    }
  };

  if (loading) return <LoadingSpinner theme={theme} />;

  return (
    <div
      className={`h-screen w-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      } p-4 transition-colors duration-200`}
    >
      <div className="relative py-3 sm:max-w-xl w-full">
        <div
          className={`absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl ${
            theme === "dark" ? "opacity-80" : ""
          }`}
        />
        <div
          className={`relative px-4 py-10 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } shadow-lg sm:rounded-3xl sm:p-20 transition-colors duration-200`}
        >
          <div
            className={`relative w-full max-w-md ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } rounded-3xl shadow-lg p-10 transition-colors duration-200`}
          >
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <form onSubmit={handleLogin}>
              <h1
                className={`text-2xl font-semibold mb-8 text-center ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                Login
              </h1>

              <div className="space-y-6">
                <InputField
                  id="username"
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  theme={theme}
                />

                <InputField
                  id="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  showPasswordToggle
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  theme={theme}
                />
                
                {error && (
                  <p className="text-red-500 text-center font-medium">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className={`bg-cyan-500 hover:bg-cyan-600 text-white rounded-md px-4 py-2 w-full transition-colors ${
                    theme === "dark" ? "hover:bg-cyan-700" : "hover:bg-cyan-600"
                  }`}
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;