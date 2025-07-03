
interface Props {
  timeIn: string;
  setTimeIn: (time: string) => void;
  timeOut: string;
  setTimeOut: (time: string) => void;
  loading: boolean;
  theme: string;
}

export default function TimeInputGroup({
  timeIn,
  setTimeIn,
  timeOut,
  setTimeOut,
  loading,
  theme,
}: Props) {
  const themeClass = theme === "dark"
    ? "bg-gray-700 border-gray-600 text-white"
    : "bg-white border-gray-300";

  const labelClass = theme === "dark" ? "text-gray-300" : "text-gray-700";

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label className={`block mb-2 ${labelClass}`}>Time In</label>
        <input
          type="time"
          className={`w-full border rounded-lg p-2 ${themeClass}`}
          value={timeIn}
          onChange={(e) => setTimeIn(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <label className={`block mb-2 ${labelClass}`}>Time Out</label>
        <input
          type="time"
          className={`w-full border rounded-lg p-2 ${themeClass}`}
          value={timeOut}
          onChange={(e) => setTimeOut(e.target.value)}
          disabled={loading}
        />
      </div>
    </div>
  );
}
