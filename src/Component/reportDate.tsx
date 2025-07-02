import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { parse, differenceInMinutes, addDays, format, isSameDay, isSameMonth, 
         addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, 
         isSameYear, getDay } from "date-fns";
import type { Employee } from "../interfaces";
import { useTheme } from "../context";
import { Moon, Sun, Search, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  over_time: string | null;
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
    time_in: string | null;
    time_out: string | null;
    over_time: string | null;
  }[];
}

const STANDARD_WORK_HOURS = 9;
const MAX_WORK_HOURS = 12;

export default function AttendanceSummaryTable() {
  const [employeeMap, setEmployeeMap] = useState<Map<string, Employee>>(new Map());
  const [dates, setDates] = useState<string[]>([]);
  const [attendanceByDate, setAttendanceByDate] = useState<Record<string, AttendanceRecord[]>>({});
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  // Generate calendar days for the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the calendar with empty days at the start to align weekday columns
  const startDay = getDay(monthStart);
  const paddedCalendarDays = [
    ...Array(startDay).fill(null),
    ...calendarDays
  ];

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
      const { data, error } = await supabase
        .from("attendance")
        .select("date")
        .order("date", { ascending: false })
        .limit(1000);
      if (error) return console.error("Error fetching dates:", error);
      
      const uniqueDates = Array.from(new Set(data.map((d) => d.date)));
      setDates(uniqueDates);
      
      // Create Date objects for the calendar picker
      const dateObjects = uniqueDates.map(dateStr => new Date(dateStr));
      setAvailableDates(dateObjects);
    }
    fetchDistinctDates();
  }, []);

  useEffect(() => {
    const fetchAttendanceForDate = async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      if (!attendanceByDate[dateStr]) {
        const { data, error } = await supabase
          .from("attendance")
          .select("*, employee(first_name, last_name)")
          .eq("date", dateStr)
          .order("time_in", { ascending: true });
        
        if (error) {
          console.error("Error fetching attendance for", dateStr, error);
          return;
        }
        
        setAttendanceByDate((prev) => ({ ...prev, [dateStr]: data || [] }));
      }
    };
    
    fetchAttendanceForDate();
  }, [selectedDate]);

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
    if (isNaN(hours)) return "—";
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
      const employeeName = emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
      
      if (!employeeTimes[employeeName]) {
        employeeTimes[employeeName] = {
          earliestIn: rec.time_in,
          latestOut: rec.time_out,
          overtime: rec.over_time,
        };
      } else {
        if (rec.time_in && (!employeeTimes[employeeName].earliestIn || rec.time_in < employeeTimes[employeeName].earliestIn)) {
          employeeTimes[employeeName].earliestIn = rec.time_in;
        }
        if (rec.time_out && (!employeeTimes[employeeName].latestOut || rec.time_out > employeeTimes[employeeName].latestOut)) {
          employeeTimes[employeeName].latestOut = rec.time_out;
        }
        if (rec.over_time !== null) {
          employeeTimes[employeeName].overtime = rec.over_time;
        }
      }
    });

    const recordsGrouped = Object.entries(employeeTimes).map(([employeeName, times]) => {
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
        time_in: times.earliestIn,
        time_out: times.latestOut,
        over_time: times.overtime
      };
    });

    return { date, records: recordsGrouped };
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateSelect = (day: Date) => {
    setSelectedDate(day);
  };

  const hasAttendanceData = (day: Date) => {
    return availableDates.some(date => isSameDay(date, day));
  };

  const groupedData = getGroupedDataForDate(format(selectedDate, "yyyy-MM-dd"));
  const filteredRecords = groupedData?.records.filter(rec => 
    rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className={`mx-auto lg:w-[1250px] sm:mt-[20px] sm:pt-[20px] p-2 md:p-4 rounded-lg shadow transition-colors duration-200 ${
      theme === "dark"
        ? "bg-gray-900 border-gray-700 text-gray-100"
        : "bg-white border-gray-200 text-gray-800"
    } border`}>
      
      <div className="flex flex-col items-center mb-4">
        {/* Theme Toggle and Title */}
        <div className="flex items-center justify-center w-full relative mb-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full focus:outline-none absolute left-0 ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </button>

          <h2 className="mt-5 text-xl md:text-2xl font-bold text-center">
            🗓️ Daily Attendance Report
          </h2>
        </div>

        {/* Calendar Picker */}
        <div className={`w-full max-w-md mb-6 p-4 rounded-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-50"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className={`p-2 rounded-full ${
                theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-medium">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <button
              onClick={handleNextMonth}
              className={`p-2 rounded-full ${
                theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium py-1">
                {day}
              </div>
            ))}

            {paddedCalendarDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="h-8"></div>;
              }

              const hasData = hasAttendanceData(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={day.toString()}
                  onClick={() => hasData && handleDateSelect(day)}
                  disabled={!hasData}
                  className={`h-8 rounded-full flex items-center justify-center text-sm ${
                    isSelected
                      ? theme === "dark"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-500 text-white"
                      : hasData
                        ? theme === "dark"
                          ? "hover:bg-gray-700 text-gray-100"
                          : "hover:bg-gray-200 text-gray-800"
                        : theme === "dark"
                          ? "text-gray-600"
                          : "text-gray-400"
                  } ${
                    !isCurrentMonth && theme === "dark" ? "text-gray-600" : ""
                  } ${
                    !isCurrentMonth && theme !== "dark" ? "text-gray-300" : ""
                  }`}
                >
                  {format(day, "d")}
                  {hasData && (
                    <span className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                      isSelected 
                        ? "bg-white" 
                        : theme === "dark" 
                          ? "bg-blue-500" 
                          : "bg-blue-400"
                    }`}></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date and Search */}
        <div className="flex items-center justify-between w-full max-w-md mb-4">
          <div className={`px-4 py-2 rounded-lg ${
            theme === "dark" ? "bg-gray-800" : "bg-gray-100"
          }`}>
            {format(selectedDate, "MMMM d, yyyy")}
          </div>

          <div className="relative flex-1 ml-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={`h-4 w-4 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`} />
            </div>
            <input
              type="text"
              placeholder="Search employee..."
              className={`w-full pl-10 p-2 border rounded ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-700 placeholder-gray-400 focus:border-gray-500"
                  : "bg-white border-gray-300 placeholder-gray-500 focus:border-gray-400"
              } focus:outline-none focus:ring-1 ${
                theme === "dark" ? "focus:ring-gray-600" : "focus:ring-gray-300"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {!groupedData ? (
        <div className="flex justify-center items-center h-32">
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            No records found for {format(selectedDate, "MMMM d, yyyy")}
          </p>
        </div>
      ) : (
        <div className="mb-6">
          {/* Mobile View - Cards */}
          <div className="md:hidden w-full space-y-3">
            {filteredRecords.map((rec, idx) => (
              <div
                key={`mobile-${rec.employeeName}-${idx}`}
                className={`p-3 rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className={`font-medium mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}>
                  {rec.employeeName}
                </div>

                <div className="flex justify-between mb-2">
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                        Time In:
                      </span>{" "}
                      <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                        {rec.time_in || "—"}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                        Time Out:
                      </span>{" "}
                      <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                        {rec.time_out || "—"}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                        OverTime:
                      </span>{" "}
                      <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                        {rec.over_time || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <div className="text-sm">
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                        Regular:
                      </span>{" "}
                      <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                        {formatHours(rec.regularHours)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                        Overtime:
                      </span>{" "}
                      <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                        {formatHours(rec.overtimeHours)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-2">
                  <div className={`px-3 py-1 rounded-lg ${
                    theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"
                  }`}>
                    <span className="font-medium">Total: </span>
                    {formatHours(rec.totalHours)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className={`w-full border-collapse ${
              theme === "dark" ? "border-gray-700" : "border-gray-300"
            }`}>
              <thead className={`${
                theme === "dark" ? "bg-gray-800" : "bg-gray-100"
              }`}>
                <tr>
                  <th className={`border px-4 py-2 text-left ${
                    theme === "dark" ? "border-gray-700" : "border-gray-300"
                  }`}>Employee</th>
                  <th className={`border px-4 py-2 ${
                    theme === "dark" ? "border-gray-700" : "border-gray-300"
                  }`}>Time In</th>
                  <th className={`border px-4 py-2 ${
                    theme === "dark" ? "border-gray-700" : "border-gray-300"
                  }`}>Time Out</th>
                  <th className={`border px-4 py-2 ${
                    theme === "dark" ? "border-gray-700" : "border-gray-300"
                  }`}>OverTime</th>
                  <th className={`border px-4 py-2 ${
                    theme === "dark" ? "border-gray-700" : "border-gray-300"
                  }`}>Regular</th>
                  <th className={`border px-4 py-2 ${
                    theme === "dark" ? "border-gray-700" : "border-gray-300"
                  }`}>Overtime</th>
                  <th className={`border px-4 py-2 ${
                    theme === "dark" ? "border-gray-700" : "border-gray-300"
                  }`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec, idx) => (
                  <tr
                    key={`desktop-${rec.employeeName}-${idx}`}
                    className={`${
                      theme === "dark" ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"
                    } border-b`}
                  >
                    <td className={`border px-4 py-2 ${
                      theme === "dark" ? "border-gray-700" : "border-gray-300"
                    }`}>{rec.employeeName}</td>
                    <td className={`border px-4 py-2 ${
                      theme === "dark" ? "border-gray-700" : "border-gray-300"
                    }`}>{rec.time_in || "—"}</td>
                    <td className={`border px-4 py-2 ${
                      theme === "dark" ? "border-gray-700" : "border-gray-300"
                    }`}>{rec.time_out || "—"}</td>
                    <td className={`border px-4 py-2 ${
                      theme === "dark" ? "border-gray-700" : "border-gray-300"
                    }`}>{rec.over_time || "—"}</td>
                    <td className={`border px-4 py-2 ${
                      theme === "dark" ? "border-gray-700" : "border-gray-300"
                    }`}>{formatHours(rec.regularHours)}</td>
                    <td className={`border px-4 py-2 ${
                      theme === "dark" ? "border-gray-700" : "border-gray-300"
                    }`}>{formatHours(rec.overtimeHours)}</td>
                    <td className={`border px-4 py-2 ${
                      theme === "dark" ? "border-gray-700" : "border-gray-300"
                    }`}>{formatHours(rec.totalHours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}