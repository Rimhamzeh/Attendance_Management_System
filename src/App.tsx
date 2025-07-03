import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "./Page/login";
import AdminDashboard from "./Page/adminDashboard";
import EmployeeTable from "./Component/AttendancePanel/tableOfEmployee";
import AddEmployee from "./Component/AddEmployee/addEmployee";
import AddAttendance from "./Component/AddAttendance/addAttendance";
import AttendanceSummaryTable from "./Component/ReportDaily/reportsDaily";
import MonthlyAttendanceReport from "./Component/ReportMonthly/reportMonthly";
import { ThemeProvider } from "./Utils/context"; 


function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route 
            path="/adminDashboard" 
            element={
             
                <AdminDashboard />
              
            }
          >
            <Route index element={<EmployeeTable />} />
            <Route path="addEmployee" element={<AddEmployee />} />
            <Route path="addAttendance" element={<AddAttendance />} />
            <Route path="reportDate" element={<AttendanceSummaryTable />} />
             <Route path="reportMonthly" element={<MonthlyAttendanceReport  />} />
            
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;