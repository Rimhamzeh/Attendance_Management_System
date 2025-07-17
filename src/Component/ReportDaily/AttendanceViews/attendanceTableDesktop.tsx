import React from "react";
import {
  calculateTotalBreakMinutes,
  formatMinutesToTime,
} from "../../../Utils/timeHelper";
import { calculateHours } from "../../../Utils/reportHelper";

interface Record {
  employeeName: string;

  time_in: string | null;
  time_out: string | null;
  over_time: string | null;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  breaks?: Break[];
  totalHoursWorked?: number;
  status?: 'present' | 'absent'; 
}

interface Break {
  id: string;
  start_time: string;
  end_time: string;
  attendance_id?: string; 
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
        <thead
          className={`${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
        >
          <tr>
            {[
              "Employee",
              "Time In",
              "Time Out",
              "Breaks",
              "Total Breaks",
              "Regular Hours",
              "Overtime",
              "Total Hours Worked",
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
              className={`
                ${theme === "dark"
                  ? "border-gray-700 hover:bg-gray-800"
                  : "border-gray-200 hover:bg-gray-50"}
                border-b`}
            >
              <td className={`border px-4 py-2 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>{rec.employeeName}</td>
              {rec.status === 'absent' ? (
                <>
                  <td colSpan={7} className={`border px-4 py-2 text-center font-semibold ${theme === "dark" ? "border-gray-700 text-red-400" : "border-gray-300 text-red-600"}`}>Absent</td>
                </>
              ) : (
                <>
                  <td className={`border px-4 py-2 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>{rec.time_in || "—"}</td>
                  <td className={`border px-4 py-2 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>{rec.time_out || "—"}</td>
                  <td className={`border px-4 py-2 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>{rec.breaks?.length ? (<div className="space-y-1">{rec.breaks.map((br) => (<div key={br.id}>{br.start_time} - {br.end_time}</div>))}</div>) : ("—")}</td>
                  <td className={`border px-4 py-2 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>{rec.breaks?.length ? formatMinutesToTime(calculateTotalBreakMinutes(rec.breaks)) : "—"}</td>
                  <td className={`border px-4 py-2 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>{formatHours(rec.regularHours)}</td>
                  <td className={`border px-4 py-2 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>{typeof rec.overtimeHours === "number" ? formatHours(rec.overtimeHours) : "—"}</td>
                  <td className={`border px-4 py-2 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>{formatHours(typeof rec.totalHoursWorked === 'number' ? rec.totalHoursWorked : rec.totalHours)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
