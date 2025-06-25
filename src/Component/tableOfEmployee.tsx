import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { IoCloseSharp } from "react-icons/io5";
import type { Employee, AttendanceWithEmployee } from "../interfaces";
import Swal from "sweetalert2";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

export default function EmployeeTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [records, setRecords] = useState<AttendanceWithEmployee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<AttendanceWithEmployee | null>(null);

  const [inputs, setInputs] = useState({
    time_in: "",
    time_out: "",
    breakStart: "",
    breakEnd: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: employeesData, error: employeesError } = await supabase.from("employee").select("*");
    if (employeesError) {
      await Swal.fire("Error", "Error fetching employees: " + employeesError.message, "error");
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
      await Swal.fire("Error", "Error fetching attendance: " + attendanceError.message, "error");
      setLoading(false);
      return;
    }

    const attendedEmployeeIds = new Set(attendanceData?.map((att) => att.employee_id));
    const employeesMissingAttendance = employeesData?.filter(
      (emp) => !attendedEmployeeIds.has(emp.id)
    ) || [];

    if (employeesMissingAttendance.length > 0) {
      const insertData = employeesMissingAttendance.map((emp) => ({
        employee_id: emp.id,
        date: todayDate,
        time_in: null,
        time_out: null,
        breakStart: null,
        breakEnd: null,
      }));

      const { error: insertError } = await supabase.from("attendance").insert(insertData);

      if (insertError) {
        await Swal.fire("Error", "Error inserting attendance records: " + insertError.message, "error");
        setLoading(false);
        return;
      }
    }

    const { data: updatedAttendanceData, error: updatedAttendanceError } = await supabase
      .from("attendance")
      .select("*")
      .eq("date", todayDate);

    if (updatedAttendanceError) {
      await Swal.fire("Error", "Error fetching updated attendance: " + updatedAttendanceError.message, "error");
      setLoading(false);
      return;
    }

    const employeeMap = new Map<string, Employee>();
    employeesData?.forEach((emp) => {
      employeeMap.set(emp.id, emp);
    });

    const mergedRecords: AttendanceWithEmployee[] =
      updatedAttendanceData?.map((att) => {
        const emp = employeeMap.get(att.employee_id);
        return {
          ...att,
          employeeName: emp ? `${emp.first_name} ${emp.last_name}` : "Unknown",
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
      breakStart: record.breakStart || "",
      breakEnd: record.breakEnd || "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!editingRecord) return;

    const { error } = await supabase
      .from("attendance")
      .update({
        time_in: inputs.time_in,
        time_out: inputs.time_out,
        breakStart: inputs.breakStart,
        breakEnd: inputs.breakEnd,
      })
      .eq("id", editingRecord.id);

    if (error) {
      await Swal.fire("Error", "Error updating record: " + error.message, "error");
      return;
    }

    setRecords((prev) =>
      prev.map((r) => (r.id === editingRecord.id ? { ...r, ...inputs } : r))
    );
    setEditingRecord(null);
    await Swal.fire("Success", "Record updated successfully.", "success");
  };

  const todayDate = new Date().toISOString().split("T")[0];

  const filteredRecords = records
    .filter((rec) => rec.date === todayDate)
    .filter((rec) => rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredEmployees = employees.filter((emp) =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(employeeSearchQuery.toLowerCase())
  );

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 space-y-10 h-[80vh] overflow-y-auto">
    
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Search by employee name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-4 py-2 rounded w-full max-w-xs"
        />
      </div>

      <div className="overflow-x-auto">
        <h2 className="text-xl font-bold mb-2">Attendance Records for {todayDate}</h2>
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Employee Name</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">In Time</th>
              <th className="border px-4 py-2">Out Time</th>
              <th className="border px-4 py-2">Breaks</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((rec) => {
              const breaks =
                rec.breakStart && rec.breakEnd
                  ? `${rec.breakStart} - ${rec.breakEnd}`
                  : "—";

              return (
                <tr key={rec.id} className="hover:bg-gray-100">
                  <td className="border px-4 py-2 text-center">{rec.id}</td>
                  <td className="border px-4 py-2">{rec.employeeName}</td>
                  <td className="border px-4 py-2 text-center">{rec.date}</td>
                  <td className="border px-4 py-2 text-center">{rec.time_in || "—"}</td>
                  <td className="border px-4 py-2 text-center">{rec.time_out || "—"}</td>
                  <td className="border px-4 py-2 text-center">{breaks}</td>
                  <td className="border px-4 py-2">
                    <div className="flex justify-center space-x-2">
                      <button
                        className="text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white text-sm px-2 py-1 rounded"
                        onClick={() => handleEdit(rec)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-500 border border-red-500 hover:bg-red-500 hover:text-white text-sm px-2 py-1 rounded"
                        onClick={() => handleDeleteAttendance(rec.id)}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Search employees"
          value={employeeSearchQuery}
          onChange={(e) => setEmployeeSearchQuery(e.target.value)}
          className="border px-4 py-2 rounded w-full max-w-xs"
        />
      </div>

      <div className="overflow-x-auto">
        <h2 className="text-xl font-bold mb-2">Employees</h2>
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">First Name</th>
              <th className="border px-4 py-2">Last Name</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2 text-center">{emp.id}</td>
                <td className="border px-4 py-2">{emp.first_name}</td>
                <td className="border px-4 py-2">{emp.last_name}</td>
                <td className="border px-4 py-2 text-center">
                  <button
                    className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white"
                    onClick={() => handleDeleteEmployee(emp.id)}
                  >
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Edit Attendance</h2>
                <p className="text-sm text-gray-500">Update the selected record</p>
              </div>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => setEditingRecord(null)}
              >
                <IoCloseSharp size={24} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                name="time_in"
                value={inputs.time_in}
                onChange={handleChange}
                placeholder="Time In (HH:mm:ss)"
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                name="time_out"
                value={inputs.time_out}
                onChange={handleChange}
                placeholder="Time Out (HH:mm:ss)"
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                name="breakStart"
                value={inputs.breakStart}
                onChange={handleChange}
                placeholder="Break Start (HH:mm:ss)"
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                name="breakEnd"
                value={inputs.breakEnd}
                onChange={handleChange}
                placeholder="Break End (HH:mm:ss)"
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setEditingRecord(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
