import React, { useCallback } from "react";
import Swal from "sweetalert2";
import { supabase } from "../../../Utils/supabaseClient";
import EmployeeTable from "../Tables/employeeTable";
import type { Employee, AttendanceWithEmployee } from "../../../Utils/interfaces"; 

interface EmployeeSectionProps {
  theme: string;
  employees: Employee[];
  searchQuery: string;
  isMobile: boolean;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  setRecords: React.Dispatch<React.SetStateAction<AttendanceWithEmployee[]>>;
}

export default function EmployeeSection({
  theme,
  employees,
  searchQuery,
  isMobile,
  setEmployees,
  setRecords,
}: EmployeeSectionProps) {
  const handleDeleteEmployee = useCallback(
    async (id: string) => {
      const confirm = await Swal.fire({
        title: "Delete employee?",
        text: "Are you sure? This will remove the employee from the system.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete",
      });
      if (!confirm.isConfirmed) return;

      try {
        const { data: attendanceRecords, error } = await supabase
          .from("attendance")
          .select("id")
          .eq("employee_id", id);
        if (error) throw error;

        for (const attendance of attendanceRecords || []) {
          const { error: breakError } = await supabase
            .from("breaks")
            .delete()
            .eq("attendance_id", attendance.id);
          if (breakError) throw breakError;
        }

        const { error: attendanceDeleteError } = await supabase
          .from("attendance")
          .delete()
          .eq("employee_id", id);
        if (attendanceDeleteError) throw attendanceDeleteError;

        const { error: employeeDeleteError } = await supabase
          .from("employee")
          .delete()
          .eq("id", id);
        if (employeeDeleteError) throw employeeDeleteError;

        setEmployees((prev) => prev.filter((e) => e.id !== id));
        setRecords((prev) => prev.filter((r) => r.employee_id !== id));

        Swal.fire("Deleted!", "Employee removed.", "success");
      } catch (error: any) {
        Swal.fire("Error", "Failed to delete employee: " + error.message, "error");
      }
    },
    [setEmployees, setRecords]
  );

  return (
    <div
      className={`rounded-lg shadow flex-grow max-w-full transition-colors duration-200 ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h2
        className={`text-lg md:text-xl font-bold px-4 py-3 ${
          theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-50"
        }`}
      >
        Employees
      </h2>
      <EmployeeTable
        employees={employees}
        searchQuery={searchQuery}
        isMobile={isMobile}
        onDelete={handleDeleteEmployee}
        theme={theme}
      />
    </div>
  );
}
