import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { parse, differenceInMinutes, addDays, format } from "date-fns";
import type { Employee } from "../interfaces";
import { useTheme } from "../context";
import { Moon, Sun } from "lucide-react";

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
    regular: number;
    overtime: number;
    total: number;
  }[];
}

const PAGE_SIZE_MONTHS = 3;

export default function MonthlyAttendanceReport() {
  const [employeeMap, setEmployeeMap] = useState<Map<string, Employee>>(new Map());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [groupedMonthlyData, setGroupedMonthlyData] = useState<MonthlyGroupedRecord[]>([]);
  const [visibleMonthPage, setVisibleMonthPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { theme, toggleTheme } = useTheme();

  const totalPages = Math.ceil(groupedMonthlyData.length / PAGE_SIZE_MONTHS);
  const visibleMonths = groupedMonthlyData.slice(
    (visibleMonthPage - 1) * PAGE_SIZE_MONTHS,
    visibleMonthPage * PAGE_SIZE_MONTHS
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
      const { data, error } = await supabase.from("attendance").select("*").order("date", { ascending: true });
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

  const calculateHours = (dateStr: string, inTime: string | null, outTime: string | null, overTimeStr: string | null) => {
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
      const employeeName = emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
      const { regular, overtime } = calculateHours(rec.date, rec.time_in, rec.time_out, rec.over_time);
      if (!grouped[month]) grouped[month] = { month, records: [] };
      grouped[month].records.push({ date, employeeName, regular, overtime, total: parseFloat((regular + overtime).toFixed(2)) });
    });
    return Object.values(grouped).sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
  };

  return (
    <div className={`max-w-5xl mx-auto p-4 rounded-lg shadow lg:w-[1750px] border ${theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
      <div className="flex justify-between items-center mb-4">
        <button onClick={toggleTheme} className="p-2 rounded-full focus:outline-none" aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-gray-700" />}
        </button>
      </div>
      <h2 className={`text-2xl font-bold mb-5 mr-[100px] text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>📆 Monthly Attendance Summary</h2>
      <div className="mr-[100px] flex justify-center">
        <input
          type="text"
          placeholder="Search by employee name..."
          className={`p-2 mb-[10px]  border rounded w-full max-w-sm ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white border-gray-300"}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {totalPages > 1 && (
        <div className="flex justify-start pt-[10px] items-center mb-4 gap-4">
          <button onClick={() => setVisibleMonthPage(p => Math.max(p - 1, 1))} disabled={visibleMonthPage === 1} className={`px-3 py-2 rounded disabled:opacity-50 ${theme === "dark" ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}>◀ Prev</button>
          <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Page {visibleMonthPage} of {totalPages}</span>
          <button onClick={() => setVisibleMonthPage(p => Math.min(p + 1, totalPages))} disabled={visibleMonthPage === totalPages} className={`px-3 py-2 rounded disabled:opacity-50 ${theme === "dark" ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}>Next ▶</button>
        </div>
      )}
      <div className={`rounded-lg p-4 ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
        {visibleMonths.length === 0 ? (
          <p className={`text-center p-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>No monthly records found.</p>
        ) : (
          visibleMonths.map(({ month, records }) => {
            const filtered = records.filter((rec) => rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));
            return (
              <div key={month} className="mb-10">
                <h3 className={`text-xl font-semibold mb-4 pb-2 border-b ${theme === "dark" ? "text-white border-gray-700" : "text-gray-800 border-gray-300"}`}>{format(new Date(`${month}-01`), "MMMM yyyy")}</h3>
                {filtered.length === 0 ? (
                  <p className={`p-4 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>No matching employee records found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className={`min-w-full border-collapse ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
                      <thead>
                        <tr className={`${theme === "dark" ? "bg-gray-700 text-gray-100" : "bg-gray-200 text-gray-800"}`}>
                          <th className="border px-4 py-3 text-left font-medium">Date</th>
                          <th className="border px-4 py-3 text-left font-medium">Employee Name</th>
                          <th className="border px-4 py-3 text-right font-medium">Regular Hours</th>
                          <th className="border px-4 py-3 text-right font-medium">Overtime Hours</th>
                          <th className="border px-4 py-3 text-right font-medium">Total Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((rec, idx) => (
                          <tr key={`${month}-${rec.employeeName}-${idx}`} className={`${idx % 2 === 0 ? (theme === "dark" ? "bg-gray-800" : "bg-white") : (theme === "dark" ? "bg-gray-800/50" : "bg-gray-50")} ${theme === "dark" ? "hover:bg-gray-700 border-gray-700" : "hover:bg-gray-100 border-gray-300"}`}>
                            <td className={`border px-4 py-2 ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>{rec.date}</td>
                            <td className={`border px-4 py-2 ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>{rec.employeeName}</td>
                            <td className={`border px-4 py-2 text-right ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>{rec.regular}h</td>
                            <td className={`border px-4 py-2 text-right ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>{rec.overtime}h</td>
                            <td className={`border px-4 py-2 text-right ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>{rec.total}h</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}