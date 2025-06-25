import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";

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

  useEffect(() => {
    async function fetchEmployees() {
      const { data, error } = await supabase
        .from("employee")
        .select("id, first_name, last_name");

      if (error) {
        Swal.fire("Error", error.message, "error");
      } else if (data) {
        const formatted = data.map((emp) => ({
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
        }));
        setEmployees(formatted);
      }
    }

    fetchEmployees();
  }, []);

  const handleAdd = async () => {
    if (!selectedEmployee) {
      Swal.fire("Missing Field", "Please select an employee", "warning");
      return;
    }

    if (!date) {
      Swal.fire("Missing Field", "Please select a date", "warning");
      return;
    }

    if (!timeIn) {
      Swal.fire("Missing Field", "Please enter Time In", "warning");
      return;
    }

    if (!timeOut) {
      Swal.fire("Missing Field", "Please enter Time Out", "warning");
      return;
    }

    // Parse times as Date objects for comparison
    const dateBase = new Date(date);
    const parseTime = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      const d = new Date(dateBase);
      d.setHours(h, m, 0, 0);
      return d;
    };

    const timeInDate = parseTime(timeIn);
    const timeOutDate = parseTime(timeOut);

    if (timeOutDate <= timeInDate) {
      Swal.fire(
        "Invalid Time",
        "Time Out must be later than Time In",
        "warning"
      );
      return;
    }

    if (breakStart && breakEnd) {
      const breakStartDate = parseTime(breakStart);
      const breakEndDate = parseTime(breakEnd);

      if (breakStartDate < timeInDate || breakEndDate > timeOutDate) {
        Swal.fire(
          "Invalid Break",
          "Break Start and Break End must be between Time In and Time Out",
          "warning"
        );
        return;
      }

      if (breakEndDate <= breakStartDate) {
        Swal.fire(
          "Invalid Break",
          "Break End must be later than Break Start",
          "warning"
        );
        return;
      }
    } else if ((breakStart && !breakEnd) || (!breakStart && breakEnd)) {
      Swal.fire(
        "Incomplete Break Time",
        "Please enter both Break Start and Break End times",
        "warning"
      );
      return;
    }

    const { error } = await supabase.from("attendance").insert([
      {
        employee_id: selectedEmployee,
        date,
        time_in: timeIn || null,
        breakStart: breakStart || null,
        breakEnd: breakEnd || null,
        time_out: timeOut || null,
      },
    ]);

    if (error) {
      Swal.fire("Error", error.message, "error");
    } else {
      toast.success("Attendance added successfully!");

      setSelectedEmployee("");
      setDate("");
      setTimeIn("");
      setTimeOut("");
      setBreakStart("");
      setBreakEnd("");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 mt-10 rounded-xl shadow-md">
      <ToastContainer />

      <h2 className="text-2xl font-bold mb-6 text-indigo-600 text-center">
        Add Attendance
      </h2>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Employee</label>
        <select
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
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
        <label className="block text-gray-700 mb-2">Date</label>
        <input
          type="date"
          className="w-full border border-gray-300 rounded-lg p-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 mb-2">Time In</label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded-lg p-2"
            value={timeIn}
            onChange={(e) => setTimeIn(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Time Out</label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded-lg p-2"
            value={timeOut}
            onChange={(e) => setTimeOut(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 mb-2">Break Start</label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded-lg p-2"
            value={breakStart}
            onChange={(e) => setBreakStart(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Break End</label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded-lg p-2"
            value={breakEnd}
            onChange={(e) => setBreakEnd(e.target.value)}
          />
        </div>
      </div>

      <button
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        onClick={handleAdd}
      >
        Add Attendance
      </button>
    </div>
  );
}
