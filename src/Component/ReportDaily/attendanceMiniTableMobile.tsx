import React from "react";

interface Props {
  employeeMonthlyTotals: Record<string, number>;
  theme: string;
}

export default function AttendanceMiniTableMobile({ employeeMonthlyTotals, theme }: Props) {
  return (
    <div className="block md:hidden mb-4">
      <h3 className={`font-bold mb-2 ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>Total Hours</h3>
      <table className="w-full border-collapse text-xs">
        <thead className={theme === "dark" ? "bg-gray-700" : "bg-gray-200"}>
          <tr>
            <th className={`border px-2 py-1 text-center ${theme === "dark" ? "border-gray-600 text-gray-100" : "border-gray-300 text-gray-800"}`}>Employee</th>
            <th className={`border px-2 py-1 text-center ${theme === "dark" ? "border-gray-600 text-gray-100" : "border-gray-300 text-gray-800"}`}>Total Hours</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(employeeMonthlyTotals).map(([employeeName, total]) => (
            <tr key={employeeName}>
              <td className={`border px-2 py-1 text-center font-semibold ${theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"}`}>{employeeName}</td>
              <td className={`border px-2 py-1 text-center font-semibold ${theme === "dark" ? "border-gray-700 text-blue-300" : "border-gray-300 text-blue-700"}`}>{total}h</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 