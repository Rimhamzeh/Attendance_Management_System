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

export function AttendanceListMobile({ theme, records, formatHours }: Props) {
  return (
    <div className="md:hidden w-full space-y-3">
      {records.map((rec, idx) => (
        <div
          key={`${rec.employeeName}-${idx}`}
          className={`p-3 rounded-lg ${
            theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border border-gray-200"
          }`}
        >
          <div className={`font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            {rec.employeeName}
          </div>

          <div className="flex justify-between mb-2">
            <div className="space-y-1">
              {[
                { label: "Time In", value: rec.time_in },
                { label: "Time Out", value: rec.time_out },
                { label: "OverTime", value: rec.over_time },
              ].map(({ label, value }) => (
                <div className="text-sm" key={label}>
                  <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                    {label}:
                  </span>{" "}
                  <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                    {value || "—"}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-right">
              {[
                { label: "Regular", value: formatHours(rec.regularHours) },
                { label: "Overtime", value: formatHours(rec.overtimeHours) },
              ].map(({ label, value }) => (
                <div className="text-sm" key={label}>
                  <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                    {label}:
                  </span>{" "}
                  <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-2">
            <div
              className={`px-3 py-1 rounded-lg ${
                theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"
              }`}
            >
              <span className="font-medium">Total: </span>
              {formatHours(rec.totalHours)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
