import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { parse, differenceInMinutes, addDays, format, addMonths } from "date-fns";
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
}

interface MonthlyGroupedRecord {
  month: string;
  records: {
    date: string;
    employeeName: string;
    time_in: string;
    time_out: string;
    regular: number;
    overtime: number;
    total: number;
  }[];
}

export default function MonthlyAttendanceReport() {
  const [employeeMap, setEmployeeMap] = useState<Map<string, Employee>>(new Map());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [groupedMonthlyData, setGroupedMonthlyData] = useState<MonthlyGroupedRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const { theme, toggleTheme } = useTheme();

  const currentMonthData = groupedMonthlyData.find(
    (monthData) => monthData.month === format(selectedMonth, "yyyy-MM")
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
    async function fetchAttendance() {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .order("date", { ascending: true });
      if (error) return console.error("Error fetching attendance:", error);
      setAttendance(data || []);
    }
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (attendance.length && employeeMap.size) {
      setGroupedMonthlyData(groupByMonth());
    }
  }, [attendance, employeeMap]);

  const calculateHours = (
    dateStr: string,
    inTime: string | null,
    outTime: string | null,
    overTimeStr: string | null
  ) => {
    if (!inTime || !outTime) return { regular: 0, overtime: 0 };
    try {
      const baseDate = new Date(dateStr);
      let inDate = parse(inTime, "HH:mm:ss", baseDate);
      let outDate = parse(outTime, "HH:mm:ss", baseDate);
      if (outDate < inDate) outDate = addDays(outDate, 1);
      let totalMinutes = differenceInMinutes(outDate, inDate);
      if (totalMinutes > 720) totalMinutes = 720;
      let overtimeMinutes = 0;
      if (overTimeStr) {
        let overTimeEnd = parse(overTimeStr, "HH:mm:ss", baseDate);
        if (overTimeEnd < outDate) overTimeEnd = addDays(overTimeEnd, 1);
        overtimeMinutes = differenceInMinutes(overTimeEnd, outDate);
        if (overtimeMinutes < 0) overtimeMinutes = 0;
      }
      return {
        regular: parseFloat((totalMinutes / 60).toFixed(2)),
        overtime: parseFloat((overtimeMinutes / 60).toFixed(2)),
      };
    } catch {
      return { regular: 0, overtime: 0 };
    }
  };

  const groupByMonth = (): MonthlyGroupedRecord[] => {
    const grouped: Record<string, MonthlyGroupedRecord> = {};
    attendance.forEach((rec) => {
      const month = format(new Date(rec.date), "yyyy-MM");
      const date = format(new Date(rec.date), "dd/MM/yyyy");
      const emp = employeeMap.get(rec.employee_id);
      const employeeName = emp
        ? `${emp.first_name} ${emp.last_name}`
        : "Unknown";
      const { regular, overtime } = calculateHours(
        rec.date,
        rec.time_in,
        rec.time_out,
        rec.over_time
      );
      
      if (!grouped[month]) grouped[month] = { month, records: [] };
      
      grouped[month].records.push({
        date,
        employeeName,
        time_in: rec.time_in || "N/A",
        time_out: rec.time_out || "N/A",
        regular,
        overtime,
        total: parseFloat((regular + overtime).toFixed(2)),
      });
    });
    return Object.values(grouped).sort(
      (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()
    );
  };

  const handleMonthChange = (increment: number) => {
    setSelectedMonth(addMonths(selectedMonth, increment));
  };

  const selectMonth = (month: Date) => {
    setSelectedMonth(month);
    setShowMonthPicker(false);
  };

  const generateMonths = () => {
    const months = [];
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      for (let month = 0; month < 12; month++) {
        months.push(new Date(year, month, 1));
      }
    }
    
    return months;
  };

  const filteredRecords = currentMonthData?.records.filter(rec => 
    rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className={`mx-auto lg:w-[1250px] p-4 min-h-screen ${
      theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
    }`}>
      <div className="flex flex-col items-center mt-5 mb-6">
        <div className="flex items-center justify-center w-full relative mb-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full absolute left-0 ${
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

          <h1 className={`text-xl ml-[50px] md:text-2xl font-bold text-center ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}>
            📆 Monthly Attendance Report
          </h1>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => handleMonthChange(-1)}
            className={`p-2 rounded-full ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>{format(selectedMonth, "MMMM yyyy")}</span>
            </button>
            
            {showMonthPicker && (
              <div className={`absolute z-10 mt-2 w-64 p-4 rounded-lg shadow-lg ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}>
                <div className="grid grid-cols-4 gap-2">
                  {generateMonths().map((month) => (
                    <button
                      key={month.toString()}
                      onClick={() => selectMonth(month)}
                      className={`p-2 text-sm rounded ${
                        format(month, "yyyy-MM") === format(selectedMonth, "yyyy-MM")
                          ? theme === "dark" 
                            ? "bg-blue-600 text-white" 
                            : "bg-blue-500 text-white"
                          : theme === "dark" 
                            ? "hover:bg-gray-700" 
                            : "hover:bg-gray-100"
                      }`}
                    >
                      {format(month, "MMM")} {format(month, "yy")}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => handleMonthChange(1)}
            className={`p-2 rounded-full ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mt-5 w-full max-w-md">
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
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-gray-600 focus:ring-gray-600"
                : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
            } focus:outline-none focus:ring-1`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={`rounded-lg p-4 ${
        theme === "dark" ? "bg-gray-800" : "bg-gray-50"
      }`}>
        {!currentMonthData ? (
          <p className={`text-center p-4 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            No records found for {format(selectedMonth, "MMMM yyyy")}.
          </p>
        ) : (
          <div className="mb-8">
            <h2 className={`text-lg md:text-xl font-semibold mb-4 pb-2 border-b ${
              theme === "dark"
                ? "border-gray-700 text-white"
                : "border-gray-300 text-gray-800"
            }`}>
              {format(selectedMonth, "MMMM yyyy")}
            </h2>

            {filteredRecords.length === 0 ? (
              <p className={`p-4 text-center ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                No matching employee records found.
              </p>
            ) : (
              <div className="">
                <table className="hidden md:table w-full border-collapse">
                  <thead className={`${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}>
                    <tr>
                      <th className={`border px-4 py-2 text-center ${
                        theme === "dark" ? "border-gray-600 text-gray-100" : "border-gray-300 text-gray-800"
                      }`}>Date</th>
                      <th className={`border px-4 py-2 text-center ${
                        theme === "dark" ? "border-gray-600 text-gray-100" : "border-gray-300 text-gray-800"
                      }`}>Employee</th>
                      <th className={`border px-4 py-2 text-center ${
                        theme === "dark" ? "border-gray-700" : "border-gray-300"
                      }`}>Time In</th>
                      <th className={`border px-4 py-2 text-center ${
                        theme === "dark" ? "border-gray-700" : "border-gray-300"
                      }`}>Time Out</th>
                      <th className={`border px-4 py-2 text-center ${
                        theme === "dark" ? "border-gray-600 text-gray-100" : "border-gray-300 text-gray-800"
                      }`}>Regular</th>
                      <th className={`border px-4 py-2 text-center ${
                        theme === "dark" ? "border-gray-600 text-gray-100" : "border-gray-300 text-gray-800"
                      }`}>Overtime</th>
                      <th className={`border px-4 py-2 text-center ${
                        theme === "dark" ? "border-gray-600 text-gray-100" : "border-gray-300 text-gray-800"
                      }`}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((rec, idx) => (
                      <tr
                        key={`${rec.employeeName}-${idx}`}
                        className={`${
                          idx % 2 === 0
                            ? theme === "dark"
                              ? "bg-gray-800"
                              : "bg-white"
                            : theme === "dark"
                            ? "bg-gray-800/50"
                            : "bg-gray-50"
                        } ${
                          theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                      >
                        <td className={`border px-4 py-2 text-center ${
                          theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"
                        }`}>{rec.date}</td>
                        <td className={`border px-4 py-2 text-center ${
                          theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"
                        }`}>{rec.employeeName}</td>
                        <td className={`border px-4 py-2 text-center ${
                          theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"
                        }`}>{rec.time_in}</td>
                        <td className={`border px-4 py-2 text-center ${
                          theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"
                        }`}>{rec.time_out}</td>
                        <td className={`border px-4 py-2 text-right ${
                          theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"
                        }`}>{rec.regular}h</td>
                        <td className={`border px-4 py-2 text-right ${
                          theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"
                        }`}>{rec.overtime}h</td>
                        <td className={`border px-4 py-2 text-right ${
                          theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"
                        }`}>{rec.total}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                  {filteredRecords.map((rec, idx) => (
                    <div
                      key={`mobile-${rec.employeeName}-${idx}`}
                      className={`p-4 rounded-lg ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>Date</p>
                          <p className={theme === "dark" ? "text-white" : "text-gray-800"}>
                            {rec.date}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>Employee</p>
                          <p className={theme === "dark" ? "text-white" : "text-gray-800"}>
                            {rec.employeeName}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>Time In</p>
                          <p className={`font-medium ${
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }`}>{rec.time_in}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>Time Out</p>
                          <p className={`font-medium ${
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }`}>{rec.time_out}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>Regular</p>
                          <p className={theme === "dark" ? "text-white" : "text-gray-800"}>
                            {rec.regular}h
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>Overtime</p>
                          <p className={theme === "dark" ? "text-white" : "text-gray-800"}>
                            {rec.overtime}h
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>Total</p>
                          <p className={`font-medium ${
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }`}>{rec.total}h</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}