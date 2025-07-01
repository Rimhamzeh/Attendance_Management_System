 import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../context";
import { Moon, Sun } from "lucide-react";
import type { Break } from "../interfaces";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

export default function AddAttendance() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [date, setDate] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [breakStart, setBreakStart] = useState("");
  const [breakEnd, setBreakEnd] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [overTime, setOverTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [isAddingBreak, setIsAddingBreak] = useState(false);
  const [newBreak, setNewBreak] = useState({ start: "", end: "" });

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    async function fetchEmployees() {
      setLoading(true);
      const { data, error } = await supabase
        .from("employee")
        .select("id, first_name, last_name")
        .order("first_name", { ascending: true });

      if (error) {
        toast.error(error.message);
      } else if (data) {
        const formatted = data.map((emp) => ({
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
        }));
        setEmployees(formatted);
      }
      setLoading(false);
    }

    fetchEmployees();
  }, []);

  const parseTime = (time: string) => {
    if (!time || !date) return null;
    const [h, m] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const validateTimes = () => {
    if (!selectedEmployee) {
      toast.warning("Please select an employee");
      return false;
    }

    if (!timeIn || !timeOut) {
      toast.warning("Please enter both Time In and Time Out");
      return false;
    }

    const timeInDate = parseTime(timeIn);
    const timeOutDate = parseTime(timeOut);

    if (!timeInDate || !timeOutDate) {
      toast.warning("Invalid time format");
      return false;
    }

    if (timeOutDate <= timeInDate) {
      toast.warning("Time Out must be later than Time In");
      return false;
    }

    if (breakStart && breakEnd) {
      const breakStartDate = parseTime(breakStart);
      const breakEndDate = parseTime(breakEnd);

      if (!breakStartDate || !breakEndDate) {
        toast.warning("Invalid break time format");
        return false;
      }

      if (breakStartDate < timeInDate || breakEndDate > timeOutDate) {
        toast.warning("Break times must be between Time In and Time Out");
        return false;
      }

      if (breakEndDate <= breakStartDate) {
        toast.warning("Break End must be later than Break Start");
        return false;
      }
    }

    return true;
  };

const handleAdd = async () => {
  if (!validateTimes()) return;

  // Ensure over_time is greater than time_out (if over_time is provided)
  if (overTime && overTime <= timeOut) {
    toast.error("Overtime must be greater than time out.");
    return;
  }

  setLoading(true);
  try {
    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .insert([
        {
          employee_id: selectedEmployee,
          date,
          time_in: timeIn,
          time_out: timeOut,
          over_time: overTime || null,
        },
      ])
      .select();

    if (attendanceError) {
      throw attendanceError;
    }

    if (breaks.length > 0 && attendanceData?.[0]?.id) {
      const { error: breaksError } = await supabase.from("breaks").insert(
        breaks.map((brk) => ({
          attendance_id: attendanceData[0].id,
          start_time: brk.start_time,
          end_time: brk.end_time,
        }))
      );

      if (breaksError) {
        throw breaksError;
      }
    }

    toast.success("Attendance added successfully!");
    resetForm();
  } catch (error: any) {
    console.error("Error adding attendance:", error);
    toast.error(error.message || "Failed to add attendance");
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setSelectedEmployee("");
    setDate(new Date().toISOString().split("T")[0]); 
    setTimeIn("");
    setTimeOut("");
    setOverTime("");
    setBreaks([]);
    setNewBreak({ start: "", end: "" });
  };

  const handleAddBreak = () => {
    if (!newBreak.start || !newBreak.end) {
      toast.warning("Please enter both start and end times for the break");
      return;
    }
  if(overTime>timeOut){
  toast.warning(
        "Please set Over Time greater than Time Out"
      );
}
    if (!timeIn || !timeOut) {
      toast.warning(
        "Please set both Time In and Time Out before adding a break"
      );
      return;
    }

    const breakStartDate = parseTime(newBreak.start);
    const breakEndDate = parseTime(newBreak.end);
    const timeInDate = parseTime(timeIn);
    const timeOutDate = parseTime(timeOut);

    if (!breakStartDate || !breakEndDate || !timeInDate || !timeOutDate) {
      toast.warning("Invalid time format");
      return;
    }

    if (breakEndDate <= breakStartDate) {
      toast.warning("Break end time must be after break start time");
      return;
    }

    if (breakStartDate < timeInDate || breakEndDate > timeOutDate) {
      toast.warning("Break time must be between Time In and Time Out");
      return;
    }

    // Check for overlaps with existing breaks
    for (const existingBreak of breaks) {
      const existingStart = parseTime(existingBreak.start_time);
      const existingEnd = parseTime(existingBreak.end_time);

      if (existingStart && existingEnd) {
        if (
          (breakStartDate >= existingStart && breakStartDate < existingEnd) ||
          (breakEndDate > existingStart && breakEndDate <= existingEnd) ||
          (breakStartDate <= existingStart && breakEndDate >= existingEnd)
        ) {
          toast.warning("This break overlaps with an existing break");
          return;
        }
      }
    }

    setBreaks([
      ...breaks,
      {
        start_time: newBreak.start,
        end_time: newBreak.end,
        id: "",
      },
    ]);
    setNewBreak({ start: "", end: "" });
    setIsAddingBreak(false);
  };

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  return (
    <div
  className={`max-w-xl mx-auto p-6 mt-6 rounded-xl shadow-md transition-colors duration-200
  lg:w-[570px] lg:h-[650px] lg:ml-[300px] overflow-x-hidden
  ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
>

  
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full focus:outline-none"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-yellow-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-700" />
          )}
        </button>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />

      <h2
        className={`text-2xl font-bold mb-6 text-center ${
          theme === "dark" ? "text-indigo-400" : "text-indigo-600"
        }`}
      >
        Add Attendance
      </h2>

      <div className="mb-4">
        <label
          className={`block mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Employee
        </label>
        <select
          className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white focus:ring-indigo-500"
              : "bg-white border-gray-300 focus:ring-indigo-400"
          }`}
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          disabled={loading}
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          className={`block mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Date
        </label>
        <input
          type="date"
          className={`w-full border rounded-lg p-2 ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300"
          }`}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label
            className={`block mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Time In
          </label>
          <input
            type="time"
            className={`w-full border rounded-lg p-2 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300"
            }`}
            value={timeIn}
            onChange={(e) => setTimeIn(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label
            className={`block mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Time Out
          </label>
          <input
            type="time"
            className={`w-full border rounded-lg p-2 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300"
            }`}
            value={timeOut}
            onChange={(e) => setTimeOut(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label
            className={`${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Breaks
          </label>
          <button
            type="button"
            className={`text-sm px-3 py-1 rounded ${
              theme === "dark"
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            } text-white`}
            onClick={() => setIsAddingBreak(true)}
            disabled={loading}
          >
            Add Break
          </button>
        </div>

        {isAddingBreak && (
          <div className="mb-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label
                  className={`block mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Start
                </label>
                <input
                  type="time"
                  className={`w-full border rounded-lg p-2 ${
                    theme === "dark"
                      ? "bg-gray-600 border-gray-500 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  value={newBreak.start}
                  onChange={(e) =>
                    setNewBreak({ ...newBreak, start: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  className={`block mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  End
                </label>
                <input
                  type="time"
                  className={`w-full border rounded-lg p-2 ${
                    theme === "dark"
                      ? "bg-gray-600 border-gray-500 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  value={newBreak.end}
                  onChange={(e) =>
                    setNewBreak({ ...newBreak, end: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className={`px-3 py-1 rounded ${
                  theme === "dark"
                    ? "bg-gray-600 hover:bg-gray-500"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => setIsAddingBreak(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded text-white ${
                  theme === "dark"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
                onClick={handleAddBreak}
              >
                Save Break
              </button>
            </div>
          </div>
        )}

        {breaks.length > 0 && (
          <div className="mt-2">
            <ul className="space-y-2">
              {breaks.map((brk, index) => (
                <li
                  key={index}
                  className={`flex justify-between items-center p-2 rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <span>
                    {brk.start_time} - {brk.end_time}
                  </span>
                  <button
                    type="button"
                    className={`text-red-500 hover:text-red-700 ${
                      theme === "dark" ? "hover:text-red-400" : ""
                    }`}
                    onClick={() =>
                      setBreaks(breaks.filter((_, i) => i !== index))
                    }
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mb-6">
        <label
          className={`block mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Overtime (hours)
        </label>
        <input
          type="time"
          
          className={`w-full border rounded-lg p-2 ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300"
          }`}
          value={overTime}
          onChange={(e) => setOverTime(e.target.value)}
          disabled={loading}
          placeholder="0.5"
        />
      </div>
      <button
        className={`w-full py-3 rounded-lg transition ${
          theme === "dark"
            ? "bg-indigo-600 hover:bg-indigo-700"
            : "bg-indigo-600 hover:bg-indigo-700"
        } text-white font-medium flex items-center justify-center`}
        onClick={handleAdd}
        disabled={loading}
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
            Processing...
          </>
        ) : (
          "Add Attendance"
        )}
      </button>
    </div>
  );
}
