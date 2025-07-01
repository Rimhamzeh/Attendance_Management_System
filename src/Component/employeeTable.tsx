import type { Employee } from "../interfaces";
import { MdDelete } from "react-icons/md";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context";

interface EmployeeTableProps {
  employees: Employee[];
  searchQuery: string;
  isMobile: boolean;
  onDelete: (id: string) => void;
  theme?: string; // Optional theme prop for consistency
}

export default function EmployeeTable({
  employees,
  searchQuery,
  isMobile,
  onDelete,
  theme: propTheme
}: EmployeeTableProps) {
  const { theme: contextTheme, toggleTheme } = useTheme();
  const theme = propTheme || contextTheme;
  
  const filteredEmployees = employees.filter((emp) =>
    `${emp.first_name} ${emp.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (isMobile) {
    return (
      <div className={`divide-y overflow-y-auto flex-grow ${
        theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
      }`}>
        {filteredEmployees.map((emp) => (
          <div 
            key={emp.id} 
            className={`p-4 ${
              theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">
                  {emp.first_name} {emp.last_name}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  ID: {emp.id}
                </p>
              </div>
              <div className="flex items-center space-x-3">
               
                <button
                  onClick={() => onDelete(emp.id)}
                  className={`${
                    theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'
                  }`}
                  aria-label="Delete"
                >
                  <MdDelete />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden flex-grow flex flex-col">
      <div className="overflow-y-auto flex-grow">
        <table className={`min-w-full divide-y ${
          theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
        }`}>
          <thead className={`sticky top-0 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                ID
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                First Name
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Last Name
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                <div className="flex justify-between items-center">
                  <span>Actions</span>
                  
                </div>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'
          }`}>
            {filteredEmployees.map((emp) => (
              <tr 
                key={emp.id} 
                className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
              >
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {emp.id}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {emp.first_name}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {emp.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onDelete(emp.id)}
                    className={`${
                      theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'
                    }`}
                    aria-label="Delete"
                  >
                    <MdDelete size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}