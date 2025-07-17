
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
  employee: any;
  id: string;
  employee_id: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  over_time:string | null;
    breaks?: Break[];
    
}
export interface DailyGrouped {
  date: string;
  records: {
    employeeName: string;
    regularHours: number;
    overtimeHours: number;
    totalHours: number;
    totalHoursWorked: number;
    time_in: string | null;
    time_out: string | null;
    over_time: string | null;
    breaks?: Break[];
  }[];
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