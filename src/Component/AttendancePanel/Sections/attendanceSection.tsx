import React, { useCallback } from "react";
import Swal from "sweetalert2";
import { supabase } from "../../../Utils/supabaseClient";
import AttendanceTable from "../Tables/attendanceTable";
import type { AttendanceWithEmployee } from "../../../Utils/interfaces";

interface AttendanceSectionProps {
  theme: string;
  records: AttendanceWithEmployee[];
  searchQuery: string;
  isMobile: boolean;
  todayDate: string;
  setEditingRecord: React.Dispatch<
    React.SetStateAction<AttendanceWithEmployee | null>
  >;
  setRecords: React.Dispatch<React.SetStateAction<AttendanceWithEmployee[]>>;
}

export default function AttendanceSection({
  theme,
  records,
  searchQuery,
  isMobile,
  todayDate,
  setEditingRecord,
  setRecords,
}: AttendanceSectionProps) {
  const handleDeleteAttendance = useCallback(
    async (id: string) => {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this attendance record?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });
      if (!confirm.isConfirmed) return;

      const { error } = await supabase.from("attendance").delete().eq("id", id);
      if (error) {
        Swal.fire("Error", error.message, "error");
        return;
      }
      setRecords((prev) => prev.filter((r) => r.id !== id));
      Swal.fire("Deleted!", "The record has been deleted.", "success");
    },
    [setRecords]
  );

  const handleDeleteBreak = useCallback(
    async (breakId: string) => {
      const { error } = await supabase
        .from("breaks")
        .delete()
        .eq("id", breakId);
      if (error) {
        Swal.fire("Error", error.message, "error");
        return;
      }
      setRecords((prev) =>
        prev.map((rec) => ({
          ...rec,
          breaks: rec.breaks?.filter((br) => br.id !== breakId) || [],
        }))
      );
    },
    [setRecords]
  );

  const handleEdit = useCallback(
    (record: AttendanceWithEmployee) => {
      setEditingRecord(record);
    },
    [setEditingRecord]
  );

  return (
    <div
      className={`rounded-lg shadow flex-grow mb-6 max-w-full transition-colors duration-200 ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h2
        className={`text-lg md:text-xl font-bold px-4 py-3 ${
          theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-50"
        }`}
      >
        Attendance Records for {todayDate}
      </h2>
      <AttendanceTable
        records={records}
        searchQuery={searchQuery}
        isMobile={isMobile}
        todayDate={todayDate}
        onDelete={handleDeleteAttendance}
        onEdit={handleEdit}
        onDeleteBreak={handleDeleteBreak}
        theme={theme}
      />
    </div>
  );
}
