import { parse, differenceInMinutes, addDays, setHours, setMinutes } from "date-fns";

const STANDARD_START_TIME = { hours: 9, minutes: 0 }; 
const STANDARD_END_TIME = { hours: 18, minutes: 0 };  
const STANDARD_WORK_HOURS = 9; 

export function calculateHours(
  dateStr: string,
  inTime: string | null,
  outTime: string | null,
  breaksInMinutes: number = 0
) {
  if (!inTime || !outTime) {
    return {
      regularHours: 0,
      overtimeHours: 0,
      totalHoursWorked: 0,
    };
  }

  try {
    const baseDate = new Date(dateStr);
    let inDate = parse(inTime, "HH:mm:ss", baseDate);
    let outDate = parse(outTime, "HH:mm:ss", baseDate);
    if (outDate < inDate) outDate = addDays(outDate, 1);

    
    const totalMinutesWorked = differenceInMinutes(outDate, inDate);

 
    const netMinutesWorked = totalMinutesWorked - breaksInMinutes;
    const totalWorkedHours = netMinutesWorked / 60;

   
    const overtimeHours = totalWorkedHours > 9 ? totalWorkedHours - 9 : 0;
    const regularHours = totalWorkedHours - overtimeHours;

    return {
      regularHours: parseFloat(regularHours.toFixed(2)),
      overtimeHours: parseFloat(overtimeHours.toFixed(2)),
      totalHoursWorked: parseFloat(totalWorkedHours.toFixed(2)),
    };
  } catch (err) {
    console.error("Error calculating hours:", err);
    return {
      regularHours: 0,
      overtimeHours: 0,
      totalHoursWorked: 0,
    };
  }
}

export function formatHours(hours: number): string {
  if (isNaN(hours)) return "—";
  const hoursPart = Math.floor(hours);
  const minutesPart = Math.round((hours % 1) * 60);
  return `${hoursPart}h${minutesPart.toString().padStart(2, "0")}m`;
}
