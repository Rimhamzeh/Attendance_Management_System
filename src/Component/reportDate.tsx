import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { parse, differenceInMinutes, addDays } from "date-fns";
import type { Employee } from "../interfaces";

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
}

interface DailyGrouped {
  date: string;
  records: {
    employeeName: string;
    hours: number;
  }[];
}

const PAGE_SIZE_DATES = 3;

export default function AttendanceSummaryTable() {
  const [employeeMap, setEmployeeMap] = useState<Map<string, Employee>>(new Map());
  const [dates, setDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [visibleDatePage, setVisibleDatePage] = useState(1);
  const [attendanceByDate, setAttendanceByDate] = useState<Record<string, AttendanceRecord[]>>({});

  const totalPages = Math.ceil(dates.length / PAGE_SIZE_DATES);
  const visibleDates = dates.slice(
    (visibleDatePage - 1) * PAGE_SIZE_DATES,
    visibleDatePage * PAGE_SIZE_DATES
  );

  useEffect(() => {
    async function fetchEmployees() {
      const { data, error } = await supabase.from("employee").select("*");
      if (error) {
        console.error("Error fetching employees:", error);
        return;
      }

      const map = new Map<string, Employee>();
      data?.forEach((emp) => {
        map.set(emp.id, emp);
      });
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

      if (error) {
        console.error("Error fetching dates:", error);
        setLoadingDates(false);
        return;
      }

      const uniqueDates = Array.from(new Set(data.map((d) => d.date)));
      setDates(uniqueDates);
      setLoadingDates(false);
    }

    fetchDistinctDates();
  }, []);

  useEffect(() => {
    const fetchAttendanceForVisibleDates = async () => {
      const datesToLoad = visibleDates.filter((date) => !attendanceByDate[date]);

      for (const date of datesToLoad) {
        const { data, error } = await supabase
          .from("attendance")
          .select("*")
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
    outTime: string | null
  ): number => {
    if (!inTime || !outTime) return 0;

    try {
      const baseDate = new Date(dateStr);
      let inDate = parse(inTime, "HH:mm:ss", baseDate);
      let outDate = parse(outTime, "HH:mm:ss", baseDate);

      if (outDate < inDate) outDate = addDays(outDate, 1);

      let minutes = differenceInMinutes(outDate, inDate);
      if (minutes > 720) minutes = 720;

      return minutes > 0 ? parseFloat((minutes / 60).toFixed(2)) : 0;
    } catch (err) {
      console.error("Error calculating hours:", err);
      return 0;
    }
  };

  const getGroupedDataForDate = (date: string): DailyGrouped | null => {
    const records = attendanceByDate[date];
    if (!records || records.length === 0) return null;

    const employeeTimes: Record<string, { earliestIn: string | null; latestOut: string | null }> = {};

    records.forEach((rec) => {
      const emp = employeeMap.get(rec.employee_id);
      const employeeName = emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";

      if (!employeeTimes[employeeName]) {
        employeeTimes[employeeName] = {
          earliestIn: rec.time_in,
          latestOut: rec.time_out,
        };
      } else {
        const baseDate = new Date(date);
        const currentEarliest = employeeTimes[employeeName].earliestIn
          ? parse(employeeTimes[employeeName].earliestIn!, "HH:mm:ss", baseDate)
          : null;
        const currentLatest = employeeTimes[employeeName].latestOut
          ? parse(employeeTimes[employeeName].latestOut!, "HH:mm:ss", baseDate)
          : null;
        const recIn = rec.time_in ? parse(rec.time_in, "HH:mm:ss", baseDate) : null;
        const recOut = rec.time_out ? parse(rec.time_out, "HH:mm:ss", baseDate) : null;

        if (recIn && (!currentEarliest || recIn < currentEarliest)) {
          employeeTimes[employeeName].earliestIn = rec.time_in;
        }
        if (recOut && (!currentLatest || recOut > currentLatest)) {
          employeeTimes[employeeName].latestOut = rec.time_out;
        }
      }
    });

    const recordsGrouped = Object.entries(employeeTimes).map(([employeeName, times]) => ({
      employeeName,
      hours: calculateHours(date, times.earliestIn, times.latestOut),
    }));

    return { date, records: recordsGrouped };
  };

  return (
    <div className="max-w-5xl mx-auto p-4 border rounded shadow">
      <h2 className="text-2xl font-bold mb-2 text-center">🗓️ Attendance Summary Report</h2>

      {totalPages > 1 && (
        <div className="flex justify-start items-center mb-4 gap-4">
          <button
            onClick={() => setVisibleDatePage((p) => Math.max(p - 1, 1))}
            disabled={visibleDatePage === 1}
            className="px-3 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            ◀ Prev
          </button>
          <span className="text-sm">
            Page {visibleDatePage} of {totalPages}
          </span>
          <button
            onClick={() => setVisibleDatePage((p) => Math.min(p + 1, totalPages))}
            disabled={visibleDatePage === totalPages}
            className="px-3 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next ▶
          </button>
        </div>
      )}

      {loadingDates ? (
        <p className="text-center mt-10">Loading dates...</p>
      ) : (
        <div style={{ maxHeight: "600px", overflowY: "auto" }} className="border rounded p-4">
          {visibleDates.length === 0 ? (
            <p className="text-center p-4">No attendance records found.</p>
          ) : (
            visibleDates.map((date) => {
              const grouped = getGroupedDataForDate(date);

              if (!attendanceByDate[date]) {
                return (
                  <div key={date} className="mb-8">
                    <h3 className="font-semibold mb-2">{date}</h3>
                    <p className="text-gray-500">Loading attendance data...</p>
                  </div>
                );
              }

              if (!grouped) {
                return (
                  <div key={date} className="mb-8">
                    <h3 className="font-semibold mb-2">{date}</h3>
                    <p className="text-red-500">No attendance data for this date.</p>
                  </div>
                );
              }

              return (
                <div key={date} className="mb-8">
                  <h3 className="font-semibold mb-2">{date}</h3>
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="border px-4 py-2 text-left">Employee Name</th>
                        <th className="border px-4 py-2 text-right">Hours Worked</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.records.map((rec, idx) => (
                        <tr key={`${date}-${rec.employeeName}-${idx}`} className="hover:bg-gray-50">
                          <td className="border px-4 py-2">{rec.employeeName}</td>
                          <td className="border px-4 py-2 text-right">
                            {rec.hours > 0
                              ? `${Math.floor(rec.hours)}h${Math.round((rec.hours % 1) * 60)}m`
                              : "—"}
                          </td>
                        </tr>
                      ))}
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
