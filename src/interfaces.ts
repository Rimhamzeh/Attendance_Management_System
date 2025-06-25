
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  breakStart: string | null;
  breakEnd: string | null;
}

export interface AttendanceWithEmployee extends AttendanceRecord {
  employeeName: string;
}
