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
  employeeMonthlyTotals?: Record<string, number>;
}

export default function AttendanceTable({ records, theme, employeeMonthlyTotals }: AttendanceTableProps) {
  return (
    <>
      {employeeMonthlyTotals && (
        <div className="mb-4">
          <h3 className={`font-bold mb-2 ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>Monthly Total Hours</h3>
          <table className="w-full border-collapse">
            <thead className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
              <tr>
                <th className={`border px-4 py-2 text-center ${theme === "dark" ? "border-gray-600 text-gray-100" : "border-gray-300 text-gray-800"}`}>Employee</th>
                <th className={`border px-4 py-2 text-center ${theme === "dark" ? "border-gray-600 text-gray-100" : "border-gray-300 text-gray-800"}`}>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(employeeMonthlyTotals || {}).map(([employeeName, total]) => (
                <tr key={employeeName}>
                  <td className={`border px-4 py-2 text-center font-semibold ${theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"}`}>{employeeName}</td>
                  <td className={`border px-4 py-2 text-center font-semibold ${theme === "dark" ? "border-gray-700 text-blue-300" : "border-gray-300 text-blue-700"}`}>{total}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
              <td className={`border px-4 py-2 text-center ${theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"}`}>{rec.date}</td>
              <td className={`border px-4 py-2 text-center ${theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"}`}>{rec.employeeName}</td>
              {rec.time_in === 'Absent' ? (
                <td colSpan={5} className={`border px-4 py-2 text-center font-semibold ${theme === "dark" ? "border-gray-700 text-red-400" : "border-gray-300 text-red-600"}`}>Absent</td>
              ) : (
                <>
                  <td className={`border px-4 py-2 text-center ${theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"}`}>{rec.time_in}</td>
                  <td className={`border px-4 py-2 text-center ${theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"}`}>{rec.time_out}</td>
                  <td className={`border px-4 py-2 text-right ${theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"}`}>{rec.regular}h</td>
                  <td className={`border px-4 py-2 text-right ${theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"}`}>{rec.overtime}h</td>
                  <td className={`border px-4 py-2 text-right ${theme === "dark" ? "border-gray-700 text-gray-100" : "border-gray-300 text-gray-800"}`}>{rec.total}h</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
