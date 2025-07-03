import React from "react";

interface Record {
  employeeName: string;
  time_in: string | null;
  time_out: string | null;
  over_time: string | null;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
}

interface Props {
  theme: string;
  records: Record[];
  formatHours: (hours: number) => string;
}

export function AttendanceTableDesktop({ theme, records, formatHours }: Props) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table
        className={`w-full border-collapse ${
          theme === "dark" ? "border-gray-700" : "border-gray-300"
        }`}
      >
        <thead className={`${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
          <tr>
            {[
              "Employee",
              "Time In",
              "Time Out",
              "OverTime",
              "Regular",
              "Overtime",
              "Total",
            ].map((heading) => (
              <th
                key={heading}
                className={`border px-4 py-2 text-left ${
                  theme === "dark" ? "border-gray-700" : "border-gray-300"
                }`}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((rec, idx) => (
            <tr
              key={`${rec.employeeName}-${idx}`}
              className={`${
                theme === "dark" ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"
              } border-b`}
            >
              <td
                className={`border px-4 py-2 ${
                  theme === "dark" ? "border-gray-700" : "border-gray-300"
                }`}
              >
                {rec.employeeName}
              </td>
              <td className={`border px-4 py-2 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
                {rec.time_in || "—"}
              </td>
              <td className={`border px-4 py-2 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
                {rec.time_out || "—"}
              </td>
              <td className={`border px-4 py-2 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
                {rec.over_time || "—"}
              </td>
              <td className={`border px-4 py-2 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
                {formatHours(rec.regularHours)}
              </td>
              <td className={`border px-4 py-2 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
                {formatHours(rec.overtimeHours)}
              </td>
              <td className={`border px-4 py-2 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
                {formatHours(rec.totalHours)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
