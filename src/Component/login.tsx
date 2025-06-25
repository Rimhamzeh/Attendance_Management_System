import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data: userData, error: fetchError } = await supabase
      .from("admin_user")
      .select("*")
      .eq("username", username)
      .single();
    console.log(userData);
    if (fetchError || !userData) {
      setError("Invalid username or password");
      return;
    }
    if (password !== userData.password) {
      setError("Invalid username or password");
      return;
    }
    navigate("/adminDashboard");
  };
  return (
     <div className="h-screen  w-screen flex items-center justify-center bg-gray-100 p-4">
  <div className="relative py-3 sm:max-w-xl w-full  ">
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl" />
    <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-lg p-10">
            <form  onSubmit={handleLogin}>
              <h1 className="text-2xl font-semibold mb-8 text-center text-black">
                Login
              </h1>

              <div className="py-8 text-base leading-6 space-y-4 sm:text-lg sm:leading-7">
                <div className="relative">
                  <input
                    autoComplete="off"
                    id="userName"
                    name="userName"
                    type="text"
                    className="peer placeholder-transparent h-10 w-full border-gray-300 border-b-2 text-black bg-transparent focus:outline-none focus:border-rose-600"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <label
                    htmlFor="userName"
                    className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                  >
                    UserName
                  </label>
                </div>

                <div className="relative">
                  <input
                    autoComplete="off"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-black bg-transparent focus:outline-none focus:border-rose-600"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                  >
                    Password
                  </label>
                  <span
                    onClick={togglePasswordVisibility}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer select-none"
                    role="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        togglePasswordVisibility();
                      }
                    }}
                  >
                    {showPassword ? (
                      <EyeOff size={20} className="text-black" />
                    ) : (
                      <Eye size={20} className="text-black" />
                    )}
                  </span>
                </div>

                {error && (
                  <p className="text-red-600 mb-4 text-center font-medium">
                    {error}
                  </p>
                )}

                <div className="relative">
                  <button
                    type="submit"
                    className="bg-cyan-500 text-white rounded-md px-4 py-2 w-full"
                  >
                    Login
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminLogin;
