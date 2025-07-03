import React from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface Props {
  theme: string;
  selectedDate: Date;
  onToggleCalendar: () => void;
  isCalendarOpen: boolean;
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  paddedCalendarDays: (Date | null)[];
  onDateSelect: (day: Date) => void;
  hasAttendanceData: (day: Date) => boolean;
}

export function DateSelector({
  theme,
  selectedDate,
  onToggleCalendar,
  isCalendarOpen,
}: Props) {
  return (
    <div
      className={`px-4 py-2 rounded-lg cursor-pointer flex items-center ${
        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
      }`}
      onClick={onToggleCalendar}
      role="button"
      tabIndex={0}
      aria-expanded={isCalendarOpen}
    >
      {format(selectedDate, "MMMM d, yyyy")}
      <Calendar className="ml-2 h-4 w-4" />
    </div>
  );
}
