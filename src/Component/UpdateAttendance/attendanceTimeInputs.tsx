import React from "react";
import { IoCloseSharp } from "react-icons/io5";

interface AttendanceTimeInputsProps {
  inputs: { time_in: string; time_out: string; over_time: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: (field: keyof AttendanceTimeInputsProps["inputs"]) => void;

  theme: string;
}

export default function AttendanceTimeInputs({
  inputs,
  onChange,
  onClear,
  theme,
}: AttendanceTimeInputsProps) {
  const inputClass = `w-full px-3 py-2 pr-10 rounded border transition-colors ${
    theme === "dark"
      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
      : "bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
  }`;

  const labelClass = `block text-sm font-medium mb-2 ${
    theme === "dark" ? "text-gray-300" : "text-gray-700"
  }`;

  return (
    <>
      {(["time_in", "time_out", "over_time"] as const).map((field) => (
        <div key={field}>
          <label className={labelClass}>
            {field === "time_in"
              ? "Time In"
              : field === "time_out"
              ? "Time Out"
              : "Overtime"}
          </label>
          <div className="relative flex items-center">
            <input
              name={field}
              type="time"
              className={`${inputClass} pr-10`}
              value={inputs[field]}
              onChange={onChange}
              placeholder="HH:MM"
            />
            {inputs[field] && (
              <button
                type="button"
                onClick={() => onClear(field)}
                className="absolute right-2 text-gray-400 hover:text-red-500"
                aria-label={`Clear ${field}`}
              >
                <IoCloseSharp size={18} />
              </button>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
