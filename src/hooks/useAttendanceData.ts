import { useState, useCallback } from "react";
import { supabase } from "../Utils/supabaseClient";
import type { Employee, AttendanceWithEmployee, Break } from "../Utils/interfaces";

export function useAttendanceData() {
  const [records, setRecords] = useState<AttendanceWithEmployee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
    
      const { data: employeesData, error: employeesError } = await supabase.from("employee").select("*");
      if (employeesError) throw new Error(employeesError.message);
      setEmployees(employeesData || []);

      const todayDate = new Date().toISOString().split("T")[0];

     
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .eq("date", todayDate);
      if (attendanceError) throw new Error(attendanceError.message);

      
      const attendedIds = new Set(attendanceData?.map(a => a.employee_id));
      const missingAttendance = employeesData?.filter(emp => !attendedIds.has(emp.id)) || [];

      if (missingAttendance.length > 0) {
        const insertData = missingAttendance.map(emp => ({
          employee_id: emp.id,
          date: todayDate,
          time_in: null,
          time_out: null,
        }));
        const { error: insertError } = await supabase.from("attendance").insert(insertData);
        if (insertError) throw new Error(insertError.message);
      }

    
      const { data: updatedAttendanceData, error: updatedAttendanceError } = await supabase
        .from("attendance")
        .select("*")
        .eq("date", todayDate);
      if (updatedAttendanceError) throw new Error(updatedAttendanceError.message);

      
      const { data: breaksData, error: breaksError } = await supabase.from("breaks").select("*");
      if (breaksError) throw new Error(breaksError.message);

     
      const breaksMap: Record<string, Break[]> = {};
      breaksData?.forEach(br => {
        if (!breaksMap[br.attendance_id]) breaksMap[br.attendance_id] = [];
        breaksMap[br.attendance_id].push(br);
      });

  
      const employeeMap = new Map<string, Employee>();
      employeesData?.forEach(emp => employeeMap.set(emp.id, emp));

      
      const mergedRecords: AttendanceWithEmployee[] = updatedAttendanceData?.map(att => {
        const emp = employeeMap.get(att.employee_id);
        return {
          ...att,
          employeeName: emp ? `${emp.first_name} ${emp.last_name}` : "Unknown",
          breaks: breaksMap[att.id] || [],
        };
      }) || [];

      setRecords(mergedRecords);
    } finally {
      setLoading(false);
    }
  }, []);

  return { records, employees, loading, fetchData, setRecords, setEmployees };
}
