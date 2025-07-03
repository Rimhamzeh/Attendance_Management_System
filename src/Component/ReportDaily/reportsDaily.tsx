import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../../Utils/supabaseClient";
import {
  format,
  isSameDay,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import { useTheme } from "../../Utils/context";
import ThemeToggle from "../../shared/ThemeToggle";
import { DateSelector } from "./Calendar/dateSelector";
import SearchInput from "../../shared/SearchInput";
import { Calendar } from "./Calendar/calendar";
import { AttendanceListMobile } from "./AttendanceViews/attendanceListMobile";
import { AttendanceTableDesktop } from "./AttendanceViews/attendanceTableDesktop"; 
import { calculateHours, formatHours } from "../../Utils/reportHelper";
import type { AttendanceRecord, DailyGrouped } from "../../Utils/interfaces";
import { FaCalendarDays } from "react-icons/fa6";

export default function AttendanceSummaryTable() {
  const { theme, toggleTheme } = useTheme();

 
  const [employeeMap, setEmployeeMap] = useState(new Map<string, any>());
  const [attendanceByDate, setAttendanceByDate] = useState<
    Record<string, AttendanceRecord[]>
  >({});
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  const paddedCalendarDays = useMemo(
    () => [...Array(startDay).fill(null), ...calendarDays],
    [calendarDays, startDay]
  );

  
  useEffect(() => {
    async function fetchEmployees() {
      const { data, error } = await supabase.from("employee").select("*");
      if (error) return console.error(error);
      const map = new Map(data.map((emp) => [emp.id, emp]));
      setEmployeeMap(map);
    }
    fetchEmployees();
  }, []);

  
  useEffect(() => {
    async function fetchDates() {
      const { data, error } = await supabase
        .from("attendance")
        .select("date")
        .order("date", { ascending: false })
        .limit(1000);
      if (error) return console.error(error);
      const uniqueDates = Array.from(new Set(data.map((d) => d.date)));
      setAvailableDates(uniqueDates.map((dateStr) => new Date(dateStr)));
    }
    fetchDates();
  }, []);

  
  useEffect(() => {
    const fetchAttendance = async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      if (attendanceByDate[dateStr]) return;

      const { data, error } = await supabase
        .from("attendance")
        .select("*, employee(first_name, last_name)")
        .eq("date", dateStr)
        .order("time_in", { ascending: true });

      if (error) return console.error(error);
      setAttendanceByDate((prev) => ({ ...prev, [dateStr]: data || [] }));
    };
    fetchAttendance();
  }, [selectedDate, attendanceByDate]);


  const groupedData: DailyGrouped | null = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const records = attendanceByDate[dateStr];
    if (!records || !records.length) return null;

    const employeeTimes: Record<string, any> = {};

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
          dateStr,
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
          over_time: times.overtime,
        };
      }
    );

    return { date: dateStr, records: recordsGrouped };
  }, [attendanceByDate, employeeMap, selectedDate]);

  const filteredRecords = useMemo(
    () =>
      groupedData?.records.filter((r) =>
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [],
    [groupedData, searchTerm]
  );

  // Handlers
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleDateSelect = (day: Date) => {
    if (availableDates.some((date) => isSameDay(date, day))) {
      setSelectedDate(day);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div
      className={`mx-auto w-[390px] lg:w-[1410px] p-2 md:p-4 rounded-lg shadow transition-colors duration-200 border ${
        theme === "dark"
          ? "bg-gray-900 border-gray-700 text-gray-100"
          : "bg-white border-gray-200 text-gray-800"
      }`}
    >
   <div className="flex flex-col items-center mt-5 mb-[20px]">
        <div className="flex items-center mb-[20px]  justify-center w-full relative mb-3">
       <div className="p-2 rounded-full absolute left-0">
         <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

       </div>
        
        <h2 className="flex items-center mr-[100px] text-xl ml-[50px] md:text-2xl font-bold text-center">
          <FaCalendarDays className="mr-[100px]" />
           Daily Attendance Report
        
        </h2>
        </div>
       
          <div className="flex items-center justify-center gap-4 mb-4">
        <DateSelector
          theme={theme}
          selectedDate={selectedDate}
          onToggleCalendar={() => setIsCalendarOpen(!isCalendarOpen)}
          isCalendarOpen={isCalendarOpen}
          currentMonth={currentMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          paddedCalendarDays={paddedCalendarDays}
          onDateSelect={handleDateSelect}
          hasAttendanceData={(day) =>
            availableDates.some((date) => isSameDay(date, day))
          }
        />
        </div>
        
        
       {isCalendarOpen && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    onClick={() => setIsCalendarOpen(false)} // Close modal on clicking outside calendar box
  >
    <div
      className="bg-white rounded-lg shadow-lg p-6 relative max-w-md w-full"
      onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside calendar
    >
    
      <button
        onClick={() => setIsCalendarOpen(false)}
        className="absolute  top-2 right-5 text-gray-600 hover:text-gray  text-lg font-bold leading-none"
        aria-label="Close calendar"
      >
        &times;
      </button>

      <Calendar
        theme={theme}
            currentMonth={currentMonth}
            paddedCalendarDays={paddedCalendarDays}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
        onDateSelect={(day) => {
          handleDateSelect(day);
          setIsCalendarOpen(false); // Close modal on date select
        }}
        hasAttendanceData={(day) =>
          availableDates.some((date) => isSameDay(date, day))
        }
        selectedDate={selectedDate}
      />
    </div>
  </div>
)}


       


       <div className="mr-[50px]">
         <SearchInput
          theme={theme}
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search employee..."
        />
       </div>

      </div>

      {!groupedData ? (
        <p
          className={`text-center h-32 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          No records found for {format(selectedDate, "MMMM d, yyyy")}
        </p>
      ) : (
        <>
          <AttendanceListMobile
            theme={theme}
            records={filteredRecords}
            formatHours={formatHours}
          />
          <AttendanceTableDesktop
            theme={theme}
            records={filteredRecords}
            formatHours={formatHours}
          />
        </>
      )}
    </div>
  );
}
