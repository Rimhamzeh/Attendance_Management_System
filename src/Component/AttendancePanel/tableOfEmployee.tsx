import { useState, useEffect, useCallback } from "react";
import { useAttendanceData } from "../../hooks/useAttendanceData";
import Swal from "sweetalert2";
import UpdateAttendance from "../UpdateAttendance/updateAttendance";

import { useTheme } from "../../Utils/context";
import { useIsMobile } from "../../hooks/useIsMobile";
import type { AttendanceWithEmployee } from "../../Utils/interfaces";

import ThemeToggle from "../../shared/ThemeToggle";
import LoadingSpinner from "../../shared/LoadingSpinner";
import SearchInput from "../../shared/SearchInput";
import EmployeeSection from "../AttendancePanel/Sections/employeeSection";
import AttendanceSection from "../AttendancePanel/Sections/attendanceSection";

export default function EmployeePage() {
  const { records, employees, loading, fetchData, setRecords, setEmployees } =
    useAttendanceData();
  const [editingRecord, setEditingRecord] =
    useState<AttendanceWithEmployee | null>(null);
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  const [searchQuery, setSearchQuery] = useState("");
  
  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchData().catch(async (err) => {
      await Swal.fire("Error", err.message || "Unknown error", "error");
    });
  }, [fetchData]);

  

  if (loading) return <LoadingSpinner theme={theme} />;

 return (
    <div className={` flex flex-col flex-grow min-h-0 px-4 sm:px-6 lg:w-[900px] lg:px-8 py-4 overflow-x-hidden
      ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-200`}>
        <div>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
     
        </div>
       
      
      <div className="flex justify-end mb-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by employee name" theme={theme} />
      </div>

      <AttendanceSection
        theme={theme}
        records={records}
        searchQuery={searchQuery}
        isMobile={isMobile}
        todayDate={todayDate}
        setEditingRecord={setEditingRecord}
        setRecords={setRecords}
      />

      <div>
        <EmployeeSection
        theme={theme}
        employees={employees}
        searchQuery={searchQuery}
        isMobile={isMobile}
        setEmployees={setEmployees}
        setRecords={setRecords}
      />
      </div>

     
     {editingRecord && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
    <UpdateAttendance
      record={editingRecord}
      onClose={() => setEditingRecord(null)}
      onSaved={(updatedRecord) => {
        setRecords((prev) =>
          prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
        );
        setEditingRecord(null);
      }}
      theme={theme}
    />
  </div>
)}

    </div>
  );
}
