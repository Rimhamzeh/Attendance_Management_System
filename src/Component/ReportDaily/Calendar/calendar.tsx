import React from "react";
import { format, isSameDay, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  theme: string;
  currentMonth: Date;
  paddedCalendarDays: (Date | null)[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateSelect: (day: Date) => void;
  hasAttendanceData: (day: Date) => boolean;
  selectedDate: Date;
}

export function Calendar({
  theme,
  currentMonth,
  paddedCalendarDays,
  onPrevMonth,
  onNextMonth,
  onDateSelect,
  hasAttendanceData,
  selectedDate,
}: Props) {
  return (
    <div
      className={`w-full max-w-md mb-6 p-4 rounded-lg ${
        theme === "dark" ? "bg-gray-800" : "bg-gray-50"
      }`}
      role="dialog"
      aria-modal="true"
    >

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          className={`p-2 rounded-full ${
            theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
          }`}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-medium">{format(currentMonth, "MMMM yyyy")}</h3>

        <button
          onClick={onNextMonth}
          className={`p-2 rounded-full color-black ${
            theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
          }`}
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>


      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {paddedCalendarDays.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="h-8"></div>;

          const hasData = hasAttendanceData(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={day.toString()}
              onClick={() => hasData && onDateSelect(day)}
              disabled={!hasData}
              className={`relative h-8 rounded-full flex items-center justify-center text-sm
                ${
                  isSelected
                    ? theme === "dark"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : hasData
                    ? theme === "dark"
                      ? "hover:bg-gray-700 text-gray-100"
                      : "hover:bg-gray-200 text-gray-800"
                    : theme === "dark"
                    ? "text-gray-600"
                    : "text-gray-400"
                }
                ${
                  !isCurrentMonth && (theme === "dark" ? "text-gray-600" : "text-gray-300")
                }
              `}
              aria-current={isSelected ? "date" : undefined}
              aria-disabled={!hasData}
            >
              {format(day, "d")}
              {hasData && (
                <span
                  className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                    isSelected ? "bg-white" : theme === "dark" ? "bg-blue-500" : "bg-blue-400"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
