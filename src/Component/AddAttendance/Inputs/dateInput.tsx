import React from "react";

interface Props {
  date: string;
  setDate: (date: string) => void;
  loading: boolean;
  theme: string;
}

export default function DateInput({ date, setDate, loading, theme }: Props) {
 
  const themeClass = theme === "dark"
    ? "bg-gray-700 border-gray-600 text-white"
    : "bg-white border-gray-300";

  return (
    <div className="mb-4">
      <label className={`block mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
        Date
      </label>
      <input
        type="date"
        className={`w-full border rounded-lg p-2 ${themeClass}`}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        disabled={loading}
      />
    </div>
  );
}
