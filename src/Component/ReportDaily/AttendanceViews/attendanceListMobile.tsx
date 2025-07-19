import React from "react";
import {
  calculateTotalBreakMinutes,
  formatMinutesToTime,
} from "../../../Utils/timeHelper";

interface Break {
  id: string;
  start_time: string;
  end_time: string;
  attendance_id?: string;
}

interface Record {
  employeeName: string;
  time_in: string | null;
  time_out: string | null;
  over_time: string | null;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  breaks?: Break[];
  status?: string;
}

interface Props {
  theme: string;
  records: Record[];
  formatHours: (hours: number) => string;
}

export function AttendanceListMobile({ theme, records, formatHours }: Props) {
  return (
    <div className="md:hidden w-full space-y-3">
      {records.map((rec, idx) => {
        const totalBreaks = rec.breaks?.length
          ? calculateTotalBreakMinutes(rec.breaks)
          : 0;

        return (
          <div
            key={`${rec.employeeName}-${idx}`}
            className={`p-3 rounded-lg ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <div
              className={`font-medium mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              {rec.employeeName}
            </div>

            {rec.status === 'absent' ? (
              <div className="text-center text-red-500 font-semibold">Absent</div>
            ) : (
              <>
                <div className="space-y-1 mb-2">
                  {[
                    { label: "Time In", value: rec.time_in },
                    { label: "Time Out", value: rec.time_out },
                    { label: "Overtime", value: rec.over_time },
                  ].map(({ label, value }) => (
                    <div className="text-sm" key={label}>
                      <span
                        className={theme === "dark" ? "text-gray-400" : "text-gray-500"}
                      >
                        {label}:
                      </span>{" "}
                      <span
                        className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
                      >
                        {value || "—"}
                      </span>
                    </div>
                  ))}
                </div>

                {rec.breaks?.length ? (
                  <div className="text-sm mb-2">
                    <div
                      className={`font-semibold ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Breaks:
                    </div>
                    <ul className="pl-4 list-disc">
                      {rec.breaks.map((br) => (
                        <li key={br.id} className="text-xs">
                          {br.start_time} - {br.end_time}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-1">
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                        Total Breaks:
                      </span>{" "}
                      <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                        {formatMinutesToTime(totalBreaks)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mb-2">No breaks</div>
                )}

                <div className="flex justify-between text-sm">
                  <div>
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                      Regular:
                    </span>{" "}
                    <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                      {formatHours(rec.regularHours)}
                    </span>
                  </div>
                  <div>
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                      Overtime:
                    </span>{" "}
                    <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                      {formatHours(rec.overtimeHours)}
                    </span>
                  </div>
                  <div>
                    <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                      Total:
                    </span>{" "}
                    <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                      {formatHours(rec.totalHours)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
