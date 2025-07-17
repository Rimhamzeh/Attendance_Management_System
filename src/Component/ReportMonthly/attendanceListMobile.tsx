interface AttendanceRecordDisplay {
  date: string;
  employeeName: string;
  time_in: string;
  time_out: string;
  regular: number;
  overtime: number;
  total: number;
}

interface AttendanceListMobileProps {
  records: AttendanceRecordDisplay[];
  theme: string;
}

export default function AttendanceListMobile({ records, theme }: AttendanceListMobileProps) {
  return (
    <div className="md:hidden space-y-4">
      {records.map((rec, idx) => (
        <div
          key={`mobile-${rec.employeeName}-${idx}`}
          className={`p-4 rounded-lg ${
            theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border border-gray-200"
          }`}
        >
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                Date
              </p>
              <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{rec.date}</p>
            </div>
            <div>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                Employee
              </p>
              <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{rec.employeeName}</p>
            </div>
          </div>

          {rec.time_in === 'Absent' ? (
            <div className="text-center text-red-500 font-semibold">Absent</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Time In
                  </p>
                  <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    {rec.time_in}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Time Out
                  </p>
                  <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    {rec.time_out}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Regular
                  </p>
                  <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{rec.regular}h</p>
                </div>
                <div>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Overtime
                  </p>
                  <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{rec.overtime}h</p>
                </div>
                <div>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Total
                  </p>
                  <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    {rec.total}h
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
