import { parse, differenceInMinutes, addDays } from "date-fns";

const STANDARD_WORK_HOURS = 9;

export function calculateHours(
  dateStr: string,
  inTime: string | null,
  outTime: string | null,
  dbOverTime: string | null
) {
  if (!inTime || !outTime) {
    return { regularHours: 0, overtimeHours: 0, extraTimeWorked: 0 };
  }

  try {
    const baseDate = new Date(dateStr);
    let inDate = parse(inTime, "HH:mm:ss", baseDate);
    let outDate = parse(outTime, "HH:mm:ss", baseDate);
    if (outDate < inDate) outDate = addDays(outDate, 1);

    let overtimeHours = 0;

    if (dbOverTime) {
      let overtimeEnd = parse(dbOverTime, "HH:mm:ss", baseDate);
      if (overtimeEnd < outDate) overtimeEnd = addDays(overtimeEnd, 1);

      const overtimeMinutes = differenceInMinutes(overtimeEnd, outDate);
      overtimeHours = Math.max(0, overtimeMinutes / 60);
    }

    const totalMinutes = differenceInMinutes(outDate, inDate);
    const totalHours = totalMinutes / 60;
    const regularHours = Math.min(totalHours, STANDARD_WORK_HOURS);

    return {
      regularHours: parseFloat(regularHours.toFixed(2)),
      overtimeHours: parseFloat(overtimeHours.toFixed(2)),
      extraTimeWorked: parseFloat(overtimeHours.toFixed(2)),
    };
  } catch (err) {
    console.error("Error calculating hours:", err);
    return { regularHours: 0, overtimeHours: 0, extraTimeWorked: 0 };
  }
}

export function formatHours(hours: number): string {
  if (isNaN(hours)) return "—";
  const hoursPart = Math.floor(hours);
  const minutesPart = Math.round((hours % 1) * 60);
  return `${hoursPart}h${minutesPart.toString().padStart(2, "0")}m`;
}
