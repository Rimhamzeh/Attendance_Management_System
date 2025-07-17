
import type { Break } from "../Utils/interfaces";

export function formatTimeDisplay(time: string) {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  return `${parseInt(hours, 10)}:${minutes}`;
}

export function ensureTimeFormat(time: string) {
  if (!time) return "";
  if (time.includes(":")) {
    const [hours, minutes] = time.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  }
  return time;
}

export function toMinutes(time: string) {
  const formattedTime = ensureTimeFormat(time);
  const [h, m] = formattedTime.split(":").map(Number);
  return h * 60 + m;
}

export function isOverlap(
  start: string,
  end: string,
  breaksArray: Break[],
  excludeId?: string | null
) {
  const startM = toMinutes(start);
  const endM = toMinutes(end);

  return breaksArray.some((br) => {
    if (excludeId && br.id === excludeId) return false;
    const brStartM = toMinutes(br.start_time);
    const brEndM = toMinutes(br.end_time);
    return startM < brEndM && endM > brStartM;
  });
}
export function calculateTotalBreakMinutes(breaks: Break[]) {
  return breaks.reduce((total, br) => {
    const start = toMinutes(br.start_time);
    const end = toMinutes(br.end_time);
    if (end > start) {
      return total + (end - start);
    }
    return total;
  }, 0);
}
export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m.toString().padStart(2, "0")}m`;
}
