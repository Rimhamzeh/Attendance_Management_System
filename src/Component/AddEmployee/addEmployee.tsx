import { useState } from "react";
import { supabase } from "../../Utils/supabaseClient";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../../Utils/context";
import { Moon, Sun } from "lucide-react";
export default function AddEmployee() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  const handleAdd = async () => {
    if (!first_name.trim() || !last_name.trim()) {
      toast.warning("Please enter first and last name");
      return;
    }

    setLoading(true);

    try {
      
      const { data: existingEmployees, error: selectError } = await supabase
        .from("employee")
        .select("*")
        .ilike("first_name", first_name.trim())
        .ilike("last_name", last_name.trim());

      if (selectError) throw selectError;

      if (existingEmployees?.length) {
        Swal.fire({
          icon: "error",
          title: "Employee Exists",
          text: "An employee with this name already exists.",
          background: theme === "dark" ? "#1f2937" : "#fff",
          color: theme === "dark" ? "#fff" : "#000",
        });
        return;
      }

       
      const { data, error } = await supabase
        .from("employee")
        .insert([{ 
          first_name: first_name.trim(), 
          last_name: last_name.trim() 
        }])
        .select();

      if (error) throw error;

      toast.success("Employee added successfully!");
      setFirstName("");
      setLastName("");
      console.log("Inserted:", data);
    } catch (error) {
      toast.error( "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
<div
  className={`
  flex flex-col ml-2 w-[380px]  items-center  justify-center min-h-[calc(100vh-80px)] p-4 
  mt-[-20px] mr-4 
  lg:ml-[350px] lg:w-[500px] lg:h-[500px]
    ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
>

      <div
        className={`w-full max-w-md p-6 rounded-xl shadow-md transition-colors duration-200 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full focus:outline-none"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-700" />
          )}
        </button>
        </div>
        <h2
          className={`text-2xl font-bold mb-6 text-center ${
            theme === "dark" ? "text-indigo-400" : "text-indigo-600"
          }`}
        >
          Add New Employee
        </h2>

        <div className="mb-4">
          <label
            className={`block mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            First Name
          </label>
          <input
            type="text"
            placeholder="Enter first name"
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
            className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white focus:ring-indigo-500"
                : "bg-white border border-gray-300 focus:ring-indigo-400"
            }`}
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label
            className={`block mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Last Name
          </label>
          <input
            type="text"
            placeholder="Enter last name"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white focus:ring-indigo-500"
                : "bg-white border border-gray-300 focus:ring-indigo-400"
            }`}
            disabled={loading}
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={loading}
          className={`w-full py-3 text-white rounded-lg font-semibold transition duration-300 flex items-center justify-center ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : theme === "dark"
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Adding...
            </>
          ) : (
            "Add Employee"
          )}
        </button>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />
    </div>
  );
}