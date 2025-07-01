import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { parse, differenceInMinutes, addDays } from "date-fns";
import type { Employee } from "../interfaces";
import { useTheme } from "../context";
import { Moon, Sun } from "lucide-react";

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  over_time: string | null; // ✅ fixed type from number to string
  employee?: {
    first_name: string;
    last_name: string;
  };
}

interface DailyGrouped {
  date: string;
  records: {
    employeeName: string;
    regularHours: number;
    overtimeHours: number;
    totalHours: number;
    extraTimeWorked: number;
  }[];
}

const PAGE_SIZE_DATES = 3;
const STANDARD_WORK_HOURS = 9;
const MAX_WORK_HOURS = 12;

const timeStringToHours = (time: string): number => {
  const [hh, mm, ss] = time.split(":").map(Number);
  return hh + mm / 60 + ss / 3600;
};

export default function AttendanceSummaryTable() {
  const [employeeMap, setEmployeeMap] = useState<Map<string, Employee>>(
    new Map()
  );
  const [dates, setDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [visibleDatePage, setVisibleDatePage] = useState(1);
  const [attendanceByDate, setAttendanceByDate] = useState<
    Record<string, AttendanceRecord[]>
  >({});
  const { theme, toggleTheme } = useTheme();

  // New state for search term
  const [searchTerm, setSearchTerm] = useState("");

  const totalPages = Math.ceil(dates.length / PAGE_SIZE_DATES);
  const visibleDates = dates.slice(
    (visibleDatePage - 1) * PAGE_SIZE_DATES,
    visibleDatePage * PAGE_SIZE_DATES
  );

  useEffect(() => {
    async function fetchEmployees() {
      const { data, error } = await supabase.from("employee").select("*");
      if (error) return console.error("Error fetching employees:", error);
      const map = new Map<string, Employee>();
      data?.forEach((emp) => map.set(emp.id, emp));
      setEmployeeMap(map);
    }
    fetchEmployees();
  }, []);

  useEffect(() => {
    async function fetchDistinctDates() {
      setLoadingDates(true);
      const { data, error } = await supabase
        .from("attendance")
        .select("date")
        .order("date", { ascending: false })
        .limit(1000);
      if (error) return console.error("Error fetching dates:", error);
      const uniqueDates = Array.from(new Set(data.map((d) => d.date)));
      setDates(uniqueDates);
      setLoadingDates(false);
    }
    fetchDistinctDates();
  }, []);

  useEffect(() => {
    const fetchAttendanceForVisibleDates = async () => {
      const datesToLoad = visibleDates.filter(
        (date) => !attendanceByDate[date]
      );
      for (const date of datesToLoad) {
        const { data, error } = await supabase
          .from("attendance")
          .select("*, employee(first_name, last_name)")
          .eq("date", date)
          .order("time_in", { ascending: true });
        if (error) {
          console.error("Error fetching attendance for", date, error);
          continue;
        }
        setAttendanceByDate((prev) => ({ ...prev, [date]: data || [] }));
      }
    };
    if (visibleDates.length > 0) {
      fetchAttendanceForVisibleDates();
    }
  }, [visibleDatePage, dates]);

  const calculateHours = (
    dateStr: string,
    inTime: string | null,
    outTime: string | null,
    dbOverTime: string | null
  ) => {
    if (!inTime || !outTime) {
      return { regularHours: 0, overtimeHours: 0, extraTimeWorked: 0 };
    }

    try {
      const baseDate = new Date(dateStr);
      let inDate = parse(inTime, "HH:mm:ss", baseDate);
      let outDate = parse(outTime, "HH:mm:ss", baseDate);
      if (outDate < inDate) outDate = addDays(outDate, 1);

      let overtimeHours = 0;

      if (dbOverTime) {
        let overtimeEnd = parse(dbOverTime, "HH:mm:ss", baseDate);
        if (overtimeEnd < outDate) {
          overtimeEnd = addDays(overtimeEnd, 1);
        }
        const overtimeMinutes = differenceInMinutes(overtimeEnd, outDate);
        overtimeHours = Math.max(0, overtimeMinutes / 60);
      }

      const totalMinutes = differenceInMinutes(outDate, inDate);
      const totalHours = totalMinutes / 60;
      const regularHours = Math.min(totalHours, STANDARD_WORK_HOURS);

      return {
        regularHours: parseFloat(regularHours.toFixed(2)),
        overtimeHours: parseFloat(overtimeHours.toFixed(2)),
        extraTimeWorked: parseFloat(overtimeHours.toFixed(2)),
      };
    } catch (err) {
      console.error("Error calculating hours:", err);
      return { regularHours: 0, overtimeHours: 0, extraTimeWorked: 0 };
    }
  };

  const formatHours = (hours: number): string => {
    if (isNaN(hours) || hours <= 0) return "—";
    const hoursPart = Math.floor(hours);
    const minutesPart = Math.round((hours % 1) * 60);
    return `${hoursPart}h${minutesPart.toString().padStart(2, "0")}m`;
  };

  const getGroupedDataForDate = (date: string): DailyGrouped | null => {
    const records = attendanceByDate[date];
    if (!records || records.length === 0) return null;
    const employeeTimes: Record<
      string,
      {
        earliestIn: string | null;
        latestOut: string | null;
        overtime: string | null;
      }
    > = {};
    records.forEach((rec) => {
      const emp = rec.employee || employeeMap.get(rec.employee_id);
      const employeeName = emp
        ? `${emp.first_name} ${emp.last_name}`
        : "Unknown";
      if (!employeeTimes[employeeName]) {
        employeeTimes[employeeName] = {
          earliestIn: rec.time_in,
          latestOut: rec.time_out,
          overtime: rec.over_time,
        };
      } else {
        if (
          rec.time_in &&
          (!employeeTimes[employeeName].earliestIn ||
            rec.time_in < employeeTimes[employeeName].earliestIn)
        ) {
          employeeTimes[employeeName].earliestIn = rec.time_in;
        }
        if (
          rec.time_out &&
          (!employeeTimes[employeeName].latestOut ||
            rec.time_out > employeeTimes[employeeName].latestOut)
        ) {
          employeeTimes[employeeName].latestOut = rec.time_out;
        }
        if (rec.over_time !== null) {
          employeeTimes[employeeName].overtime = rec.over_time;
        }
      }
    });
    const recordsGrouped = Object.entries(employeeTimes).map(
      ([employeeName, times]) => {
        const { regularHours, overtimeHours, extraTimeWorked } = calculateHours(
          date,
          times.earliestIn,
          times.latestOut,
          times.overtime
        );
        return {
          employeeName,
          regularHours,
          overtimeHours,
          totalHours: regularHours + overtimeHours,
          extraTimeWorked,
        };
      }
    );
    return { date, records: recordsGrouped };
  };

  return (
    <div
      className={`max-w-5xl mx-auto p-4 rounded-lg shadow transition-colors duration-200 lg:w-[2900px] lg:mr-[50px] ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      } border`}
    >
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
      </div>
      <h2
        className={`text-2xl font-bold mb-2 text-center ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}
      >
        🗓️ Attendance Summary Report
      </h2>

      <div className="mt-[40px] flex justify-center">
        <input
          type="text"
          placeholder="Search by employee name..."
          className={`p-2 border rounded w-full max-w-sm ${
            theme === "dark"
              ? "bg-gray-700 text-white border-gray-600"
              : "bg-white border-gray-300"
          }`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {totalPages > 1 && (
        <div className="flex justify-start items-center mb-4 gap-4">
          <button
            onClick={() => setVisibleDatePage((p) => Math.max(p - 1, 1))}
            disabled={visibleDatePage === 1}
            className={`px-3 py-2 rounded disabled:opacity-50 ${
              theme === "dark"
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            ◀ Prev
          </button>
          <span
            className={`text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Page {visibleDatePage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setVisibleDatePage((p) => Math.min(p + 1, totalPages))
            }
            disabled={visibleDatePage === totalPages}
            className={`px-3 py-2 rounded disabled:opacity-50 ${
              theme === "dark"
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Next ▶
          </button>
        </div>
      )}
      {loadingDates ? (
        <p
          className={`text-center mt-10 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Loading dates...
        </p>
      ) : (
        <div
          className={`rounded-lg p-4 ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}
          style={{ maxHeight: "600px" }}
        >
          {visibleDates.length === 0 ? (
            <p
              className={`text-center p-4 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No attendance records found.
            </p>
          ) : (
            visibleDates.map((date) => {
              const grouped = getGroupedDataForDate(date);
              if (!attendanceByDate[date])
                return (
                  <div key={date}>
                    <h3>{date}</h3>
                    <p>Loading attendance data...</p>
                  </div>
                );
              if (!grouped)
                return (
                  <div key={date}>
                    <h3>{date}</h3>
                    <p>No attendance data for this date.</p>
                  </div>
                );
              return (
                <div key={date} className="mb-8">
                  <h3
                    className={`font-semibold mb-2 ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {date}
                  </h3>
                  <table
                    className={`min-w-full border-collapse ${
                      theme === "dark" ? "border-gray-600" : "border-gray-300"
                    } border`}
                  >
                    <thead
                      className={`${
                        theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                      }`}
                    >
                      <tr>
                        <th className="border px-4 py-2 text-left">
                          Employee Name
                        </th>
                        <th className="border px-4 py-2 text-right">Time In</th>
                        <th className="border px-4 py-2 text-right">
                          Time Out
                        </th>
                        <th className="border px-4 py-2 text-right">
                          Overtime (DB)
                        </th>
                        <th className="border px-4 py-2 text-right">
                          Regular Hours
                        </th>
                        <th className="border px-4 py-2 text-right">
                          Calculated Overtime
                        </th>
                        <th className="border px-4 py-2 text-right">
                          Total Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.records
                        .filter((rec) =>
                          rec.employeeName
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                        .map((rec, idx) => {
                          const originalRecord = attendanceByDate[date].find(
                            (r) =>
                              `${r.employee?.first_name} ${r.employee?.last_name}` ===
                              rec.employeeName
                          );

                          return (
                            <tr
                              key={`${date}-${rec.employeeName}-${idx}`}
                              className="border"
                            >
                              <td className="border px-4 py-2">
                                {rec.employeeName}
                              </td>
                              <td className="border px-4 py-2 text-right">
                                {originalRecord?.time_in || "—"}
                              </td>
                              <td className="border px-4 py-2 text-right">
                                {originalRecord?.time_out || "—"}
                              </td>

                              <td className="border px-4 py-2 text-right">
                                {originalRecord?.over_time}
                              </td>
                              <td className="border px-4 py-2 text-right">
                                {formatHours(rec.regularHours)}
                              </td>
                              <td className="border px-4 py-2 text-right">
                                {formatHours(rec.overtimeHours)}
                              </td>
                              <td className="border px-4 py-2 text-right">
                                {formatHours(rec.totalHours)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
