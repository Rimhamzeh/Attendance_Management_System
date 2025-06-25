import { useState } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddEmployee() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

const handleAdd = async () => {
  if (!first_name.trim() || !last_name.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Missing Data",
      text: "Please enter first and last name",
    });
    return;
  }

  setLoading(true);

  // Check if employee with same first_name and last_name exists
  const { data: existingEmployees, error: selectError } = await supabase
    .from("employee")
    .select("*")
    .eq("first_name", first_name.trim())
    .eq("last_name", last_name.trim());

  if (selectError) {
    setLoading(false);
    toast.error("Error checking existing employee: " + selectError.message);
    return;
  }

  if (existingEmployees && existingEmployees.length > 0) {
    setLoading(false);
    Swal.fire({
      icon: "error",
      title: "Employee Exists",
      text: "An employee with this first and last name already exists.",
    });
    return;
  }

  // Insert new employee if not exists
  const { data, error } = await supabase
    .from("employee")
    .insert([{ first_name: first_name.trim(), last_name: last_name.trim() }])
    .select();

  setLoading(false);

  if (error) {
    toast.error("Error adding employee: " + error.message);
  } else {
    toast.success("Employee added!");
    setFirstName("");
    setLastName("");
    console.log("Inserted:", data);
  }
};


  return (
    <>
      <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">
          Add New Employee
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">First Name</label>
          <input
            type="text"
            placeholder="Enter first name"
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Last Name</label>
          <input
            type="text"
            placeholder="Enter last name"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={loading}
          className={`w-full py-3 text-white rounded-lg font-semibold transition duration-300 ${
            loading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Adding..." : "Add Employee"}
        </button>
      </div>

      {/* React Toastify container */}
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
        theme="colored"
      />
    </>
  );
}
