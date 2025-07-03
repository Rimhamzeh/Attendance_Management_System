interface AttendanceRecordDisplay {
  date: string;
  employeeName: string;
  time_in: string;
  time_out: string;
  regular: number;
  overtime: number;
  total: number;
}

interface AttendanceTableProps {
  records: AttendanceRecordDisplay[];
  theme: string;
}

export default function AttendanceTable({ records, theme }: AttendanceTableProps) {
  return (
    <table className="hidden md:table w-full border-collapse">
      <thead className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
        <tr>
          {["Date", "Employee", "Time In", "Time Out", "Regular", "Overtime", "Total"].map((header) => (
            <th
              key={header}
              className={`border px-4 py-2 text-center ${
                theme === "dark"
                  ? "border-gray-600 text-gray-100"
                  : "border-gray-300 text-gray-800"
              }`}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((rec, idx) => (
          <tr
            key={`${rec.employeeName}-${idx}`}
            className={`${
              idx % 2 === 0
                ? theme === "dark"
                  ? "bg-gray-800"
                  : "bg-white"
                : theme === "dark"
                ? "bg-gray-800/50"
                : "bg-gray-50"
            } ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
          >
            <td
              className={`border px-4 py-2 text-center ${
                theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"
              }`}
            >
              {rec.date}
            </td>
            <td
              className={`border px-4 py-2 text-center ${
                theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"
              }`}
            >
              {rec.employeeName}
            </td>
            <td
              className={`border px-4 py-2 text-center ${
                theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"
              }`}
            >
              {rec.time_in}
            </td>
            <td
              className={`border px-4 py-2 text-center ${
                theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"
              }`}
            >
              {rec.time_out}
            </td>
            <td
              className={`border px-4 py-2 text-right ${
                theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"
              }`}
            >
              {rec.regular}h
            </td>
            <td
              className={`border px-4 py-2 text-right ${
                theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"
              }`}
            >
              {rec.overtime}h
            </td>
            <td
              className={`border px-4 py-2 text-right ${
                theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"
              }`}
            >
              {rec.total}h
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
