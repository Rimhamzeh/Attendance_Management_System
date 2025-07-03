import { useEffect, useState } from "react";
import { supabase } from "../../Utils/supabaseClient";
import { format, addMonths, addDays, parse, differenceInMinutes } from "date-fns";
import type { Employee } from "../../Utils/interfaces";
import { useTheme } from "../../Utils/context";

import MonthSelector from "./monthSelector";
import SearchBar from "../../shared/SearchInput";
import AttendanceTable from "./attendanceTable";
import AttendanceListMobile from "./attendanceListMobile";
import ThemeToggle from "../../shared/ThemeToggle";
import { FaCalendarDays } from "react-icons/fa6";

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
     const nonEmptyData = (data || []).filter(
  (rec) => rec.time_in !== null || rec.time_out !== null || rec.over_time !== null
);
setAttendance(nonEmptyData);

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
  const allMonths = new Set<string>();

 
  attendance.forEach((rec) => {
    const month = format(new Date(rec.date), "yyyy-MM");
    allMonths.add(month);
  });

  allMonths.forEach((month) => {
    const records: MonthlyGroupedRecord["records"] = [];

    
    employeeMap.forEach((emp, empId) => {
     
      const employeeRecs = attendance.filter((rec) => {
        return (
          rec.employee_id === empId &&
          format(new Date(rec.date), "yyyy-MM") === month
        );
      });

      if (employeeRecs.length > 0) {
        employeeRecs.forEach((rec) => {
          const { regular, overtime } = calculateHours(
            rec.date,
            rec.time_in,
            rec.time_out,
            rec.over_time
          );

          records.push({
            date: format(new Date(rec.date), "dd/MM/yyyy"),
            employeeName: `${emp.first_name} ${emp.last_name}`,
            time_in: rec.time_in || "__",
            time_out: rec.time_out || "__",
            regular,
            overtime,
            total: parseFloat((regular + overtime).toFixed(2)),
          });
        });
      } else {

        records.push({
          date: "__/__/____",
          employeeName: `${emp.first_name} ${emp.last_name}`,
          time_in: "__",
          time_out: "__",
          regular: 0,
          overtime: 0,
          total: 0,
        });
      }
    });

    grouped[month] = { month, records };
  });

  return Object.values(grouped).sort(
    (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()
  );
};

  const currentMonthData = groupedMonthlyData.find(
    (monthData) => monthData.month === format(selectedMonth, "yyyy-MM")
  );

  const filteredRecords =
    currentMonthData?.records.filter((rec) =>
      rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div
      className={`mx-auto w-[400px] lg:w-[1150px] p-4 min-h-screen ${
        theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      }`}
    >
        <div className="flex items-center mb-[20px] justify-center w-full relative mb-3">
             <div className="p-2 rounded-full absolute left-0">
               <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      
             </div>
              
              <h2 className="flex items-center mr-[100px] text-xl  md:text-2xl font-bold text-center">
                <FaCalendarDays className="mr-[100px]" />
                 Monthly Attendance Report
              
              </h2>
              </div>
      <div className="flex flex-col items-center mt-5 mb-6">
        <MonthSelector
          selectedMonth={selectedMonth}
          showMonthPicker={showMonthPicker}
          setShowMonthPicker={setShowMonthPicker}
          onMonthChange={setSelectedMonth}
          onIncrementMonth={(inc) => setSelectedMonth(addMonths(selectedMonth, inc))}
          theme={theme}
        />
        <div  className="mr-[50px]">
          <SearchBar
         theme={theme}
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search employee..."/>
        </div>
       
      </div>

      <div
        className={`rounded-lg p-4 ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-50"
        }`}
      >
        {!currentMonthData ? (
          <p
            className={`text-center p-4 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No records found for {format(selectedMonth, "MMMM yyyy")}.
          </p>
        ) : filteredRecords.length === 0 ? (
          <p
            className={`p-4 text-center ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No matching employee records found.
          </p>
        ) : (
          <>
            <AttendanceTable records={filteredRecords} theme={theme} />
            <AttendanceListMobile records={filteredRecords} theme={theme} />
          </>
        )}
      </div>
    </div>
  );
}
