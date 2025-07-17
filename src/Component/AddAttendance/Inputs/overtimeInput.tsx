// import React from "react";

// interface Props {
//   overTime: string;
//   setOverTime: (time: string) => void;
//   loading: boolean;
//   theme: string;
// }

// export default function OvertimeInput({ overTime, setOverTime, loading, theme }: Props) {
//   const themeClass = theme === "dark"
//     ? "bg-gray-700 border-gray-600 text-white"
//     : "bg-white border-gray-300";

//   const labelClass = theme === "dark" ? "text-gray-300" : "text-gray-700";

//   return (
//     <div className="mb-6">
//       <label className={`block mb-2 ${labelClass}`}>
//         Overtime (hours)
//       </label>
//       <input
//         type="time"
//         className={`w-full border rounded-lg p-2 ${themeClass}`}
//         value={overTime}
//         onChange={(e) => setOverTime(e.target.value)}
//         disabled={loading}
//         placeholder="0.5"
//       />
//     </div>
//   );
// }
