import React, { useState } from "react";
import Swal from "sweetalert2";  // import SweetAlert2
import type { Break } from "../../../Utils/interfaces";

interface Props {
  breaks: Break[];
  setBreaks: React.Dispatch<React.SetStateAction<Break[]>>;
  timeIn: string;
  timeOut: string;
  loading: boolean;
  theme: string;
}

export default function BreaksSection({
  breaks,
  setBreaks,
  timeIn,
  timeOut,
  loading,
  theme,
}: Props) {
  const [isAddingBreak, setIsAddingBreak] = useState(false);
  const [newBreak, setNewBreak] = useState({ start: "", end: "" });

  // Helper to compare times in "HH:mm" format
  const isTimeBefore = (a: string, b: string) => a < b;

  const handleSave = () => {
    if (!newBreak.start || !newBreak.end) {
      Swal.fire({
        icon: "warning",
        title: "Missing time",
        text: "Please enter both start and end times.",
      });
      return;
    }
    if (!isTimeBefore(newBreak.start, newBreak.end)) {
      Swal.fire({
        icon: "error",
        title: "Invalid time range",
        text: "Break start time must be before end time.",
      });
      return;
    }

    // Check if break is within timeIn and timeOut
    if (newBreak.start < timeIn || newBreak.end > timeOut) {
      Swal.fire({
        icon: "error",
        title: "Break outside attendance time",
        text: `Break must be between ${timeIn} and ${timeOut}.`,
      });
      return;
    }

    // Optional: Check overlap with existing breaks
    const overlaps = breaks.some((brk) => {
      return (
        // Overlap if newBreak.start < brk.end_time AND newBreak.end > brk.start_time
        newBreak.start < brk.end_time && newBreak.end > brk.start_time
      );
    });
    if (overlaps) {
      Swal.fire({
        icon: "error",
        title: "Overlap detected",
        text: "This break overlaps with an existing break.",
      });
      return;
    }

    setBreaks([
      ...breaks,
      {
        start_time: newBreak.start,
        end_time: newBreak.end,
        id: "", // adjust as needed
      },
    ]);

    setNewBreak({ start: "", end: "" });
    setIsAddingBreak(false);
  };

  const themeClass = theme === "dark"
    ? "bg-gray-700 border-gray-600 text-white"
    : "bg-white border-gray-300";

  const labelClass = theme === "dark" ? "text-gray-300" : "text-gray-700";

  return (
    <div className="mb-4 overflow-x-hidden">
      <div className="flex justify-between items-center ">
        <label className={labelClass}>Breaks</label>
        <button
          type="button"
          className="text-sm px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white overflow-x-hidden"
          onClick={() => setIsAddingBreak(true)}
          disabled={loading}
        >
          Add Break
        </button>
      </div>

      {isAddingBreak && (
        <div className="mb-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className={`block mb-1 ${labelClass}`}>Start</label>
              <input
                type="time"
                className={`w-full border rounded-lg p-2 ${themeClass}`}
                value={newBreak.start}
                onChange={(e) =>
                  setNewBreak({ ...newBreak, start: e.target.value })
                }
              />
            </div>
            <div>
              <label className={`block mb-1 ${labelClass}`}>End</label>
              <input
                type="time"
                className={`w-full border rounded-lg p-2 ${themeClass}`}
                value={newBreak.end}
                onChange={(e) =>
                  setNewBreak({ ...newBreak, end: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className={`px-3 py-1 rounded ${
                theme === "dark"
                  ? "bg-gray-600 hover:bg-gray-500"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              onClick={() => setIsAddingBreak(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded text-white bg-indigo-600 hover:bg-indigo-700"
              onClick={handleSave}
            >
              Save Break
            </button>
          </div>
        </div>
      )}

      {breaks.length > 0 && (
        <ul className="space-y-2 mt-2">
          {breaks.map((brk, index) => (
            <li
              key={index}
              className={`flex justify-between items-center p-2 rounded ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <span>
                {brk.start_time} - {brk.end_time}
              </span>
              <button
                type="button"
                className={`text-red-500 hover:text-red-700 ${
                  theme === "dark" ? "hover:text-red-400" : ""
                }`}
                onClick={() => setBreaks(breaks.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
