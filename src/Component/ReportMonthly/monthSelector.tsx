import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface MonthSelectorProps {
  selectedMonth: Date;
  showMonthPicker: boolean;
  setShowMonthPicker: (show: boolean) => void;
  onMonthChange: (month: Date) => void;
  onIncrementMonth: (inc: number) => void;
  theme: string;
}

export default function MonthSelector({
  selectedMonth,
  showMonthPicker,
  setShowMonthPicker,
  onMonthChange,
  onIncrementMonth,
  theme,
}: MonthSelectorProps) {
  const generateMonths = () => {
    const months = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      for (let month = 0; month < 12; month++) {
        months.push(new Date(year, month, 1));
      }
    }
    return months;
  };

  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      <button
        onClick={() => onIncrementMonth(-1)}
        className={`p-2 rounded-full ${
          theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="relative">
        <button
          onClick={() => setShowMonthPicker(!showMonthPicker)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            theme === "dark"
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>{format(selectedMonth, "MMMM yyyy")}</span>
        </button>

        {showMonthPicker && (
          <div
            className={`absolute z-10 mt-2 w-64 p-4 rounded-lg shadow-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="grid grid-cols-4 gap-2">
              {generateMonths().map((month) => (
                <button
                  key={month.toString()}
                  onClick={() => {
                    onMonthChange(month);
                    setShowMonthPicker(false);
                  }}
                  className={`p-2 text-sm rounded ${
                    format(month, "yyyy-MM") === format(selectedMonth, "yyyy-MM")
                      ? theme === "dark"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-500 text-white"
                      : theme === "dark"
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {format(month, "MMM")} {format(month, "yy")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => onIncrementMonth(1)}
        className={`p-2 rounded-full ${
          theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
