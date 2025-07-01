import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import type { Employee, AttendanceWithEmployee, Break } from "../interfaces";
import Swal from "sweetalert2";
import UpdateAttendance from "./updateAttendance";
import AttendanceTable from "./attendanceTable";
import EmployeeTable from "./employeeTable";
import { useTheme } from "../context";
import { Moon, Sun } from "lucide-react";

export default function EmployeePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [records, setRecords] = useState<AttendanceWithEmployee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] =
    useState<AttendanceWithEmployee | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { theme, toggleTheme } = useTheme();

  const [inputs, setInputs] = useState({
    time_in: "",
    time_out: "",
  });

  useEffect(() => {
    fetchData();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: employeesData, error: employeesError } = await supabase
      .from("employee")
      .select("*");
    if (employeesError) {
      await Swal.fire(
        "Error",
        "Error fetching employees: " + employeesError.message,
        "error"
      );
      setLoading(false);
      return;
    }
    setEmployees(employeesData || []);

    const todayDate = new Date().toISOString().split("T")[0];

    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("*")
      .eq("date", todayDate);

    if (attendanceError) {
      await Swal.fire(
        "Error",
        "Error fetching attendance: " + attendanceError.message,
        "error"
      );
      setLoading(false);
      return;
    }

    const attendedEmployeeIds = new Set(
      attendanceData?.map((att) => att.employee_id)
    );
    const employeesMissingAttendance =
      employeesData?.filter((emp) => !attendedEmployeeIds.has(emp.id)) || [];

    if (employeesMissingAttendance.length > 0) {
      const insertData = employeesMissingAttendance.map((emp) => ({
        employee_id: emp.id,
        date: todayDate,
        time_in: null,
        time_out: null,
      }));

      const { error: insertError } = await supabase
        .from("attendance")
        .insert(insertData);

      if (insertError) {
        await Swal.fire(
          "Error",
          "Error inserting attendance records: " + insertError.message,
          "error"
        );
        setLoading(false);
        return;
      }
    }

    // Fetch updated attendance
    const { data: updatedAttendanceData, error: updatedAttendanceError } =
      await supabase.from("attendance").select("*").eq("date", todayDate);

    if (updatedAttendanceError) {
      await Swal.fire(
        "Error",
        "Error fetching updated attendance: " + updatedAttendanceError.message,
        "error"
      );
      setLoading(false);
      return;
    }

    // Fetch breaks
    const { data: breaksData, error: breaksError } = await supabase
      .from("breaks")
      .select("*");

    if (breaksError) {
      await Swal.fire(
        "Error",
        "Error fetching breaks: " + breaksError.message,
        "error"
      );
      setLoading(false);
      return;
    }

    // Group breaks by attendance_id
    const breaksMap: Record<string, Break[]> = {};
    breaksData?.forEach((br) => {
      if (!breaksMap[br.attendance_id]) {
        breaksMap[br.attendance_id] = [];
      }
      breaksMap[br.attendance_id].push(br);
    });

    // Map employeeId to employee
    const employeeMap = new Map<string, Employee>();
    employeesData?.forEach((emp) => {
      employeeMap.set(emp.id, emp);
    });

    // Merge attendance + employee + breaks
    const mergedRecords: AttendanceWithEmployee[] =
      updatedAttendanceData?.map((att) => {
        const emp = employeeMap.get(att.employee_id);
        return {
          ...att,
          employeeName: emp ? `${emp.first_name} ${emp.last_name}` : "Unknown",
          breaks: breaksMap[att.id] || [],
        };
      }) || [];

    setRecords(mergedRecords);
    setLoading(false);
  };

  const handleDeleteAttendance = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this attendance record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase.from("attendance").delete().eq("id", id);
    if (error) {
      await Swal.fire("Error", "Error deleting record: " + error.message, "error");
      return;
    }

    setRecords((prev) => prev.filter((r) => r.id !== id));
    await Swal.fire("Deleted!", "The record has been deleted.", "success");
  };

  const handleDeleteEmployee = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete employee?",
      text: "Are you sure? This will remove the employee from the system.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase.from("employee").delete().eq("id", id);
    if (error) {
      await Swal.fire("Error", "Failed to delete employee: " + error.message, "error");
      return;
    }

    await supabase.from("attendance").delete().eq("employee_id", id);

    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setRecords((prev) => prev.filter((r) => r.employee_id !== id));
    await Swal.fire("Deleted!", "Employee removed.", "success");
  };

  const handleEdit = (record: AttendanceWithEmployee) => {
    setEditingRecord(record);
    setInputs({
      time_in: record.time_in || "",
      time_out: record.time_out || "",
    });
  };

  const handleDeleteBreak = async (breakId: string) => {
    const { error } = await supabase.from("breaks").delete().eq("id", breakId);
    if (error) {
      alert("Failed to delete break: " + error.message);
      return;
    }

    setRecords((prev) =>
      prev.map((rec) => ({
        ...rec,
        breaks: rec.breaks?.filter((br) => br.id !== breakId) || [],
      }))
    );
  };
  const todayDate = new Date().toISOString().split("T")[0];

  if (loading) return <p className="text-center mt-10 ml-[500px]">Loading...</p>;

  return (
  <div
    className={`w-full flex flex-col flex-grow min-h-0 px-4 sm:px-6 lg:w-[1200px] lg:px-8 py-4 overflow-x-hidden ${
      theme === "dark" ? "bg-gray-900" : "bg-gray-50"
    } transition-colors duration-200`}
  >
    {/* Controls (theme toggle + search) */}
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
      <input
        type="text"
        placeholder="Search by employee name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`border px-3 py-2 rounded w-full max-w-md focus:outline-blue-500 ${
          theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white"
        }`}
      />
    </div>

    {/* Attendance section */}
    <div className="w-full overflow-x-auto">
      {/* Remove fixed width here and replace with max-w-full */}
      <div
        className={`rounded-lg shadow flex-grow mb-6 max-w-full ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } transition-colors duration-200`}
      >
        <h2
          className={`text-lg md:text-xl font-bold px-4 py-3 ${
            theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-50"
          }`}
        >
          Attendance Records for {todayDate}
        </h2>
        <div className="w-full">
          <AttendanceTable
            records={records}
            searchQuery={searchQuery}
            isMobile={isMobile}
            todayDate={todayDate}
            onDelete={handleDeleteAttendance}
            onEdit={handleEdit}
            onDeleteBreak={handleDeleteBreak}
            theme={theme}
          />
        </div>
      </div>
    </div>

    {/* Employee search */}
    <div className="flex justify-end mb-4">
      <input
        type="text"
        placeholder="Search employees"
        value={employeeSearchQuery}
        onChange={(e) => setEmployeeSearchQuery(e.target.value)}
        className={`border px-3 py-2 rounded w-full max-w-md focus:outline-blue-500 ${
          theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white"
        }`}
      />
    </div>

    {/* Employees section */}
    <div className="w-full overflow-x-auto">
      <div
        className={`rounded-lg shadow flex-grow max-w-full ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } transition-colors duration-200`}
      >
        <h2
          className={`text-lg md:text-xl font-bold px-4 py-3 ${
            theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-50"
          }`}
        >
          Employees
        </h2>
        <div className="w-full">
          <EmployeeTable
            employees={employees}
            searchQuery={employeeSearchQuery}
            isMobile={isMobile}
            onDelete={handleDeleteEmployee}
            theme={theme}
          />
        </div>
      </div>
    </div>

    {/* Edit modal */}
    {editingRecord && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
        <UpdateAttendance
          recordToEdit={editingRecord}
          handleClose={() => setEditingRecord(null)}
          onUpdate={(updatedRecord) => {
            setRecords((prev) =>
              prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
            );
            setEditingRecord(null);
          }}
          theme={theme}
        />
      </div>
    )}
  </div>
);

}
