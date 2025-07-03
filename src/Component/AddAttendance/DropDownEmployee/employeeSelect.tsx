import React from "react";
import type { Employee } from "../../../Utils/interfaces";

interface Props {
  employees: Employee[];
  selectedEmployee: string;
  setSelectedEmployee: (id: string) => void;
  loading: boolean;
  theme: string;
}

export default function EmployeeSelect({
  employees,
  selectedEmployee,
  setSelectedEmployee,
  loading,
  theme,
}: Props) {
  const themeClass = theme === "dark"
    ? "bg-gray-700 border-gray-600 text-white focus:ring-indigo-500"
    : "bg-white border-gray-300 focus:ring-indigo-400";

  return (
    <div className="mb-4">
      <label className={`block mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
        Employee
      </label>
      <select
        className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 ${themeClass}`}
        value={selectedEmployee}
        onChange={(e) => setSelectedEmployee(e.target.value)}
        disabled={loading}
      >
        <option value="">Select Employee</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.first_name} {emp.last_name}
          </option>
        ))}
      </select>
    </div>
  );
}
