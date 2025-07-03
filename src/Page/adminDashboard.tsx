import { FaHome, FaBars, FaTimes } from "react-icons/fa";
import { IoAddCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { Outlet, Link } from "react-router-dom";
import { TbReportAnalytics } from "react-icons/tb";
import { useState, useEffect } from "react";

function AdminDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };


    handleResize();


    window.addEventListener('resize', handleResize);

 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 bg-indigo-600 text-white p-4 z-20 flex justify-between items-center md:hidden">
          
          <button 
            onClick={toggleSidebar}
            className="text-white  focus:outline-none"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <FaTimes  color="black" size={24} /> : <FaBars color="black" size={24} />}
          </button>
        </header>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 bg-indigo-600 text-white h-screen p-4 flex flex-col justify-between z-10
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'} 
          ${isMobile ? 'mt-16' : 'mt-0'}`}
      >
        {isSidebarOpen && (
          <>
            <div>
              <div className="flex justify-between items-center  mb-6">
             <h1 className="text-2xl ml-[30px] font-bold mb-2 mt-[10px]">Admin Panel</h1>
              </div>
              <nav className="space-y-8">
                <Link 
                  to="/adminDashboard" 
                  className="flex text-lg items-center  text-white hover:bg-indigo-700 p-2 rounded transition"
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                >
                  <FaHome className="mr-2" />
                  Dashboard
                </Link>
                <Link 
                  to="/adminDashboard/addEmployee" 
                  className="flex text-lg items-center text-white hover:bg-indigo-700 p-2 rounded transition"
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                >
                  <IoAddCircleSharp className="mr-2" />
                  Add Employee
                </Link>
                <Link 
                  to="/adminDashboard/addAttendance" 
                  className="flex text-lg items-center text-white hover:bg-indigo-700 p-2 rounded transition"
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                >
                  <IoAddCircleSharp className="mr-2" />
                  Add Attendance
                </Link>
                <Link 
                  to="/adminDashboard/reportDate" 
                  className="flex text-lg items-center text-white hover:bg-indigo-700 p-2 rounded transition"
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                >
                  <TbReportAnalytics className="mr-2" />
                  Report Daily
                </Link>
                <Link 
                  to="/adminDashboard/reportMonthly" 
                  className="flex text-lg items-center text-white hover:bg-indigo-700 p-2 rounded transition"
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                >
                  <TbReportAnalytics className="mr-2" />
                  Report Monthly
                </Link>
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center mb-[200px] justify-center w-full bg-white text-indigo-600 hover:bg-gray-100 p-2 rounded focus:outline-none transition"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </>
        )}
      </aside>

    <main 
  className={`flex-1 p h-full  transition-all duration-300
    ${isSidebarOpen && !isMobile ? 'ml-64' : 'ml-0'}
    ${isMobile ? 'mt-16' : 'mt-0'}
    w-full`}  
>
  <Outlet />
</main>
    </div>
  );
}

export default AdminDashboard;