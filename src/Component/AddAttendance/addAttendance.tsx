import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../Utils/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../../Utils/context";
import ThemeToggle from "../../shared/ThemeToggle";

import EmployeeSelect from "./DropDownEmployee/employeeSelect";
import DateInput from "./Inputs/dateInput";
import TimeInputGroup from "./Inputs/timeInputGroup";
import BreaksSection from "./BreakSection/breaksSection";
// import OvertimeInput from "./Inputs/overtimeInput";
import SubmitButton from "./SubmitButton/submitButton";
import { validateTimes } from "../../Utils/attendanceValidation";
import type { Employee, Break } from "../../Utils/interfaces";

export default function AddAttendance() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [overTime, setOverTime] = useState("");
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [loading, setLoading] = useState(false);

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    async function fetchEmployees() {
      const { data, error } = await supabase
        .from("employee")
        .select("id, first_name, last_name");

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        const formatted = data.map((emp) => ({
          id: emp.id,
          first_name: emp.first_name,
          last_name: emp.last_name,
        }));
        setEmployees(formatted); 
      }
    }

    fetchEmployees();
  }, []);

  const handleSubmit = async () => {
    if (!validateTimes(selectedEmployee, date, timeIn, timeOut, breaks, toast))
      return;

    if (overTime && overTime <= timeOut) {
      toast.error("Overtime must be greater than time out.");
      return;
    }

    setLoading(true);
    try {
      const { data: existingRecords, error: fetchError } = await supabase
        .from("attendance")
        .select("id")
        .eq("employee_id", selectedEmployee)
        .eq("date", date)
        .limit(1);

      if (fetchError) throw fetchError;

    

      
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

      if (attendanceError) throw attendanceError;

    
      if (breaks.length > 0 && attendanceData?.[0]?.id) {
        const { error: breaksError } = await supabase.from("breaks").insert(
          breaks.map((brk) => ({
            attendance_id: attendanceData[0].id,
            start_time: brk.start_time,
            end_time: brk.end_time,
          }))
        );

        if (breaksError) throw breaksError;
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
  };

  return (
    
    <form
      onSubmit={(e) => {
        e.preventDefault(); 
        handleSubmit();
      }}
      className={`max-w-xl w-[390px] mx-auto p-6 mt-6 rounded-xl shadow-md transition-colors duration-200
      lg:w-[570px] lg:h-[650px] lg:ml-[300px] overflow-x-hidden
      ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
    >
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      <ToastContainer theme={theme} />

      <h2
        className={`text-2xl font-bold mb-6 text-center ${
          theme === "dark" ? "text-indigo-400" : "text-indigo-600"
        }`}
      >
        Add Attendance
      </h2>

      <EmployeeSelect
        employees={employees}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        loading={loading}
        theme={theme}
      />

      <DateInput
        date={date}
        setDate={setDate}
        loading={loading}
        theme={theme}
      />

      <TimeInputGroup
        timeIn={timeIn}
        setTimeIn={setTimeIn}
        timeOut={timeOut}
        setTimeOut={setTimeOut}
        loading={loading}
        theme={theme}
      />

      <BreaksSection 
        breaks={breaks}
        setBreaks={setBreaks}
        timeIn={timeIn}
        timeOut={timeOut}
        loading={loading}
        theme={theme}
      />

      {/* <OvertimeInput
        overTime={overTime}
        setOverTime={setOverTime}
        loading={loading}
        theme={theme}
      /> */}

      <SubmitButton loading={loading} onClick={handleSubmit} theme={theme} />
    </form>
  );
}
