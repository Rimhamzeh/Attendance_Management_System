import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "./Component/login";
import AdminDashboard from "./Page/adminDashboard";
import EmployeeTable from "./Component/tableOfEmployee";
import AddEmployee from "./Component/addEmployee";
import AddAttendance from "./Component/addAttendance";
import HoursProgress from "./Component/reportDate";
import MonthlyAttendanceReport from "./Component/reportMonthly";
import { ThemeProvider } from "./context"; // Import the ThemeProvider
import Layout from "./Component/Layout"; // New layout component

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
            <Route path="reportDate" element={<HoursProgress />} />
             <Route path="reportMonthly" element={<MonthlyAttendanceReport  />} />
            
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;