
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
}
export interface AttendanceBreak {
  start: string;
  end: string;
}
export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  over_time:string | null;
}

export interface AttendanceWithEmployee extends AttendanceRecord {
  breaks?: Break[];
  employeeName: string;
}
export interface Break {
  id: string;
  start_time: string;
  end_time: string;
 
}