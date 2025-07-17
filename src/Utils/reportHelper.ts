import { parse, differenceInMinutes, addDays, setHours, setMinutes } from "date-fns";

const STANDARD_START_TIME = { hours: 9, minutes: 0 }; // 9:00 AM
const STANDARD_END_TIME = { hours: 18, minutes: 0 };  // 6:00 PM
const STANDARD_WORK_HOURS = 9; // 9h workday

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

    // 1. Calculate total minutes worked (time_out - time_in)
    const totalMinutesWorked = differenceInMinutes(outDate, inDate);

    // 2. Calculate regular hours as time_out - time_in (no break deduction)
    const regularHours = totalMinutesWorked / 60;

    // 3. Calculate standard working window
    const standardStart = setMinutes(setHours(baseDate, STANDARD_START_TIME.hours), STANDARD_START_TIME.minutes);
    const standardEnd = setMinutes(setHours(baseDate, STANDARD_END_TIME.hours), STANDARD_END_TIME.minutes);

    // Clamp work period to standard hours to get standardMinutes
    const workStart = inDate < standardStart ? standardStart : inDate;
    const workEnd = outDate > standardEnd ? standardEnd : outDate;
    let standardMinutes = differenceInMinutes(workEnd, workStart);
    if (standardMinutes < 0) standardMinutes = 0;

    // 4. Calculate overtime as net minutes beyond standard working minutes
    // Overtime = max(0, totalMinutesWorked - standardMinutes)
    const overtimeMinutes = Math.max(0, totalMinutesWorked - standardMinutes);
    const overtimeHours = overtimeMinutes / 60;

    // 5. Calculate effective break time beyond 30 min allowance
    const effectiveBreaks = breaksInMinutes > 30 ? breaksInMinutes - 30 : 0;

    // 6. Total hours worked = regular + overtime - effective breaks
  const totalHoursWorked = Math.max(0, (regularHours + overtimeHours) - (effectiveBreaks / 60));


    return {
      regularHours: parseFloat(regularHours.toFixed(2)),
      overtimeHours: parseFloat(overtimeHours.toFixed(2)),
      totalHoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
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
