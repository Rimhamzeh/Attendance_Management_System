import { FaHome } from "react-icons/fa";
import { IoAddCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { Outlet, Link } from "react-router-dom";
import { TbReportAnalytics } from "react-icons/tb";
function AdminDashboard() {
  const navigate = useNavigate();
  const handleLogout = () => {
    navigate("/");
  };
  return (
    <div className="flex">
      <div className="fixed top-0 left-0 w-screen h-screen flex">
        <aside className="w-64 bg-indigo-600 text-white min-h-screen p-4 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
            <nav className="space-y-4">
              <Link to="/adminDashboard" className="flex items-center text-white hover:underline">
              <FaHome className="mr-2" />
              Dashboard
            </Link>
             <Link to="/adminDashboard/addEmployee" className="flex items-center text-white hover:underline">
              <IoAddCircleSharp className="mr-2" />
              Add Employee
            </Link>
            <Link to="/adminDashboard/addAttendance" className="flex items-center text-white hover:underline">
              <IoAddCircleSharp className="mr-2" />
              Add Attendance
            </Link>
            <Link to="/adminDashboard/reportDate" className="flex items-center text-white hover:underline">
              <TbReportAnalytics  className="mr-2" />
              Report 
            </Link>
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full text-black hover:underline mt-4 focus:outline-none"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </aside>

        <main className="flex-1 p-8 bg-gray-100 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export default AdminDashboard;
