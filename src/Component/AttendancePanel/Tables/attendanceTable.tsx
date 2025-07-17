import type { AttendanceWithEmployee, Break } from "../../../Utils/interfaces";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useTheme } from "../../../Utils/context";
import { IoCloseSharp } from "react-icons/io5";
import { useState } from "react";
import { supabase } from "../../../Utils/supabaseClient";
import {
  calculateTotalBreakMinutes,
  formatMinutesToTime,
} from "../../../Utils/timeHelper";
import { calculateHours } from "../../../Utils/reportHelper";

 export interface AttendanceTableProps {
  records: AttendanceWithEmployee[];
  searchQuery: string;
  isMobile: boolean;
  todayDate: string;
  onDelete: (id: string) => void;
  onEdit: (record: AttendanceWithEmployee) => void;
  onDeleteBreak?: (breakId: string) => void;
  theme?: string;
}

export default function AttendanceTable({
  records,
  searchQuery,
  isMobile,
  todayDate,
  onDelete,
  onEdit,
  onDeleteBreak = () => {},
  theme: propTheme,
}: AttendanceTableProps) {
  const [breaks, setBreaks] = useState<Break[]>([]);
  const { theme, toggleTheme } = useTheme();

  const filteredRecords = records
    .filter((rec) => rec.date === todayDate)
    .filter((rec) =>
      rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(
      (rec) =>
        (rec.time_in !== null && rec.time_in !== "") ||
        (rec.time_out !== null && rec.time_out !== "") ||
        (rec.over_time !== null && rec.over_time !== "")
    );

  const uniqueRecords = filteredRecords.filter(
    (rec, index, self) =>
      self.findIndex((r) => r.employee_id === rec.employee_id) === index
  );

  async function handleDeleteAttendance(attendanceId: string) {
    try {
      const { error: breaksError } = await supabase
        .from("breaks")
        .delete()
        .eq("attendance_id", attendanceId);

      if (breaksError) throw breaksError;

      const { error: attendanceError } = await supabase
        .from("attendance")
        .delete()
        .eq("id", attendanceId);

      if (attendanceError) throw attendanceError;

      onDelete(attendanceId);
    } catch (error: any) {
      alert("Error deleting record: " + error.message);
    }
  }

  if (isMobile) {
    return (
      <div
        className={`divide-y flex-grow h-full ${
          theme === "dark" ? "divide-gray-700" : "divide-gray-200"
        }`}
      >
        {uniqueRecords.length === 0 ? (
          <p className="p-4 text-center text-gray-500">
            No attendance records yet for today. Please add attendance.
          </p>
        ) : (
          uniqueRecords.map((rec) => (
            <div
              key={rec.id}
              className={`p-4 ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{rec.employeeName}</h3>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(rec)}
                      className={`${
                        theme === "dark"
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-500 hover:text-blue-700"
                      }`}
                      aria-label="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteAttendance(rec.id)}
                      className={`${
                        theme === "dark"
                          ? "text-red-400 hover:text-red-300"
                          : "text-red-500 hover:text-red-700"
                      }`}
                      aria-label="Delete"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }
                  >
                    In Time
                  </p>
                  <p>{rec.time_in || "—"}</p>
                </div>
                <div>
                  <p
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }
                  >
                    Out Time
                  </p>
                  <p>{rec.time_out || "—"}</p>
                </div>
                <div>
                  <p
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }
                  >
                    Overtime
                  </p>
                  <p>{rec.over_time || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }
                  >
                    Breaks
                  </p>
                  {rec.breaks?.length ? (
                    <div className="space-y-1">
                      {rec.breaks.map((br) => (
                        <div key={br.id} className="flex items-center">
                          <span>
                            {br.start_time} - {br.end_time}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteBreak(br.id);
                            }}
                            className={`ml-2 p-1 rounded-full ${
                              theme === "dark"
                                ? "text-red-400 hover:text-red-300"
                                : "text-red-500 hover:text-red-700"
                            }`}
                            aria-label="Delete break"
                          >
                            <IoCloseSharp size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>—</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow overflow-x-auto">
        <table
          className={`min-w-full divide-y ${
            theme === "dark" ? "divide-gray-700" : "divide-gray-200"
          }`}
        >
          <thead
            className={`sticky top-0 ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <tr>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/5 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Employee
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/6 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                }`}
              >
                In Time
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/6 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Out Time
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/6 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Overtime
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/5 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Breaks
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/5 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Total Breaks
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/6 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y  ${
              theme === "dark"
                ? "divide-gray-700 bg-gray-800"
                : "divide-gray-200 bg-white"
            }`}
          >
            {uniqueRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No attendance records yet for today. Please add attendance.
                </td>
              </tr>
            ) : (
              uniqueRecords.map((rec) => (
                <tr
                  key={rec.id}
                  className={
                    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }
                >
                  <td
                    className={`  px-6 py-4 text-sm font-medium w-1/5 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {rec.employeeName}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm w-1/6 ${
                      theme === "dark" ? "text-gray-200" : "text-gray-500"
                    }`}
                  >
                    {rec.time_in || "—"}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm w-1/6 ${
                      theme === "dark" ? "text-gray-200" : "text-gray-500"
                    }`}
                  >
                    {rec.time_out || "—"}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm w-1/6 ${
                      theme === "dark" ? "text-gray-200" : "text-gray-500"
                    }`}
                  >
                    <td
                      className={ ` px-6 py-4 text-sm w-1/6 ${
                        theme === "dark" ? "text-gray-200" : "text-gray-500"
                      }`}
                    >
                      {rec.time_in && rec.time_out
                        ? (() => {
                            const totalBreaks = calculateTotalBreakMinutes(
                              rec.breaks || []
                            );
                            const { overtimeHours } = calculateHours(
                              rec.date,
                              rec.time_in,
                              rec.time_out,
                              totalBreaks
                            );
                            return overtimeHours > 0
                              ? `${Math.floor(overtimeHours)}h${String(
                                  Math.round((overtimeHours % 1) * 60)
                                ).padStart(2, "0")}m`
                              : "0h00m";
                          })()
                        : "—"}
                    </td>
                  </td>
                  <td
                    className={`px-6 py-4 text-sm w-1/5 ${
                      theme === "dark" ? "text-gray-200" : "text-gray-500"
                    }`}
                  >
                    {rec.breaks?.length ? (
                      <div className="space-y-1">
                        {rec.breaks.map((br) => (
                          <div key={br.id} className="flex items-center">
                            <span>
                              {br.start_time} - {br.end_time}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteBreak(br.id);
                              }}
                              className={`ml-2 p-1 rounded-full ${
                                theme === "dark"
                                  ? "text-red-400 hover:text-red-300"
                                  : "text-red-500 hover:text-red-700"
                              }`}
                              aria-label="Delete break"
                            >
                              <IoCloseSharp size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm w-1/6 ${
                      theme === "dark" ? "text-gray-200" : "text-gray-500"
                    }`}
                  >
                    {rec.breaks?.length
                      ? formatMinutesToTime(
                          calculateTotalBreakMinutes(rec.breaks)
                        )
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium w-1/6">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => onEdit(rec)}
                        className={`${
                          theme === "dark"
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-blue-500 hover:text-blue-700"
                        }`}
                        aria-label="Edit"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteAttendance(rec.id)}
                        className={`${
                          theme === "dark"
                            ? "text-red-400 hover:text-red-300"
                            : "text-red-500 hover:text-red-700"
                        }`}
                        aria-label="Delete"
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
