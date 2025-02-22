/** @format */

import React, { useEffect, useState } from "react";
import { FaPersonWalking } from "react-icons/fa6";
import { FaListAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const LeaveManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [leaveCategories, setLeaveCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // Fetch employee leave counts
    fetch(
      "http://localhost:8599/v1/hris/leave/GetLeaveCountstoallemployee"
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setEmployees(data.data);

          // Extract unique leave categories from the first employee's data
          if (data.data.length > 0) {
            const uniqueCategories = [
              ...new Map(
                data.data[0].current_leave_counts.map((item) => [
                  item.category_id,
                  { id: item.category_id, name: item.category_name },
                ])
              ).values(),
            ];
            setLeaveCategories(uniqueCategories);
          }
        }
      })
      .catch((error) => console.error("Error fetching employee data:", error));
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const currentItems = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Employee", ...leaveCategories.map((cat) => cat.name)];
    const rows = employees.map((employee) => {
      const leaveData = leaveCategories.map((category) => {
        const currentCount =
          employee.current_leave_counts.find(
            (count) => count.category_id === category.id
          )?.leave_count || "0";

        const actualCount =
          employee.actual_leave_counts.find(
            (count) => count.category_id === category.id
          )?.leave_count || "0";

        return `${actualCount}/${currentCount}`;
      });

      return [employee.employee_fullname, ...leaveData];
    });

    const csvContent =
      [headers.join(",")]
        .concat(rows.map((row) => row.join(",")))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "LeaveManagement.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-5">
      <div className="flex space-x-4 mt-5 mb-5">
        <div className="w-48 h-32 flex flex-col items-center justify-center border rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
            <FaPersonWalking className="text-gray-500" size={20} />
          </div>
          <p className="text-gray-500 text-sm">Employee Leaves</p>
        </div>

        <Link to="/leave-history">
          <div className="w-48 h-32 flex flex-col items-center justify-center border rounded-lg  shadow-sm hover:shadow-md cursor-pointer transition-shadow">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2">
              <FaListAlt className="text-gray-500" size={20} />
            </div>
            <p className="text-gray-500 text-sm">Leave History</p>
          </div>
        </Link>
      </div>

      <div className="flex justify-end mb-3">
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Export to CSV
        </button>
      </div>

      <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-4 font-medium text-gray-900">Employee</th>
            {leaveCategories.map((category) => (
              <th
                key={category.id}
                className="px-3 py-4 font-medium text-gray-900"
              >
                {category.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 border-t border-gray-200">
          {currentItems.length > 0 ? (
            currentItems.map((employee) => (
              <tr key={employee.employee_no} className="hover:bg-gray-50">
                <td className="px-3 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                      {employee.employee_fullname
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.employee_fullname}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.employee_email}
                      </div>
                    </div>
                  </div>
                </td>
                {leaveCategories.map((category) => {
                  const currentCount =
                    employee.current_leave_counts.find(
                      (count) => count.category_id === category.id
                    )?.leave_count || "0";

                  const actualCount =
                    employee.actual_leave_counts.find(
                      (count) => count.category_id === category.id
                    )?.leave_count || "0";

                  return (
                    <td key={category.id} className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <p>{actualCount} /</p>
                        <p>{currentCount}</p>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={leaveCategories.length + 1}
                className="text-center py-4"
              >
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <ul className="flex space-x-2">
          <li
            className={`px-3 py-1 border rounded cursor-pointer ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400"
                : "bg-gray-100 text-black"
            }`}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </li>
          {[...Array(totalPages).keys()]
            .slice(
              Math.max(currentPage - 3, 0),
              Math.min(currentPage + 2, totalPages)
            )
            .map((page) => (
              <li
                key={page}
                className={`px-3 py-1 border rounded cursor-pointer ${
                  currentPage === page + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-black"
                }`}
                onClick={() => handlePageChange(page + 1)}
              >
                {page + 1}
              </li>
            ))}
          <li
            className={`px-3 py-1 border rounded cursor-pointer ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400"
                : "bg-gray-100 text-black"
            }`}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LeaveManagement;