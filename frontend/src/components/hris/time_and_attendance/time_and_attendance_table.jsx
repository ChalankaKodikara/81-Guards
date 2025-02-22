/** @format */

import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import moment from "moment";

const Time_And_Attendance_Table = ({ selectedDate }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [departments, setDepartments] = useState([]);
  const rowsPerPage = 20;
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  const [filterDate, setFilterDate] = useState(selectedDate || moment().format("YYYY-MM-DD"));
  
  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/v1/hris/attendence/searchAttendanceByDate?date=${moment(filterDate).format("YYYY-MM-DD")}`
        );
        const result = await response.json();
        setAttendanceData(result.data || []);
        setFilteredData(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [filterDate]);

  // Fetch departments
  useEffect(() => {
    fetch(`${API_URL}/v1/hris/employees/getemployeebasicdetails`)
      .then((response) => response.json())
      .then((data) => {
        const uniqueDepartments = [
          ...new Set(data.map((employee) => employee.department_name)),
        ];
        setDepartments(uniqueDepartments);
      })
      .catch((error) => console.error("Error fetching employee data:", error));
  }, []);

  // Filter data based on search query and department selection
  useEffect(() => {
    let filtered = attendanceData;

    if (searchQuery) {
      filtered = filtered.filter((row) =>
        row.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedDepartment !== "All") {
      filtered = filtered.filter((row) => row.department === selectedDepartment);
    }

    if (filterDate) {
      filtered = filtered.filter(
        (row) =>
          moment(row.checkIN_time).format("YYYY-MM-DD") === filterDate ||
          (row.checkOUT_time &&
            moment(row.checkOUT_time).format("YYYY-MM-DD") === filterDate)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page after filtering
  }, [searchQuery, selectedDepartment, filterDate, attendanceData]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const getStatusStyle = (actionType) => {
    switch (actionType) {
      case "late in":
        return "bg-[#FFE9D0] p-1";
      case "early out":
        return "bg-[#FFFED3] p-1";
      case "late in / early out":
        return "bg-[#BBE9FF] p-1";
      case "missing out":
        return "bg-[#FABC3F] text-white p-1";
      case "missing in":
        return "bg-[#E85C0D] text-white p-1";
      case "normal check-in":
        return "bg-[#B1AFFF] text-white p-1";
      default:
        return "bg-gray-100 text-gray-800"; // Default class for other types
    }
  };

  return (
    <div className="p-5 rounded-xl">
      <h2 className="text-xl font-semibold mb-4">Attendance Table</h2>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by employee ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Departments</option>
          {departments.map((dept, index) => (
            <option key={index} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <button
          className="px-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-[100px] flex items-center justify-center gap-2"
        >
          <CiSearch />
          Search
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="table-container">
          <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-900">ID</th>
                <th className="px-6 py-4 font-medium text-gray-900">Employee</th>
                <th className="px-6 py-4 font-medium text-gray-900">Department</th>
                <th className="px-6 py-4 font-medium text-gray-900">Checkin Time</th>
                <th className="px-6 py-4 font-medium text-gray-900">Checkout Time</th>
                <th className="px-6 py-4 font-medium text-gray-900">Status</th>
                <th className="px-6 py-4 font-medium text-gray-900">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-t border-gray-200">
              {currentRows.length > 0 ? (
                currentRows.map((row) => (
                  <tr key={row._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{row.employee_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {row.employee_fullname}
                          </div>
                          <div className="text-sm text-gray-500">{row.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{row.department}</td>
                    <td className="px-6 py-4">{moment(row.checkIN_time).format("YYYY-MM-DD HH:mm:ss")}</td>
                    <td className="px-6 py-4">
                      {row.checkOUT_time
                        ? moment(row.checkOUT_time).format("YYYY-MM-DD HH:mm:ss")
                        : "N/A"}
                    </td>
                    <td className={`px-6 py-4 ${getStatusStyle(row.status)}`}>
                      {row.status}
                    </td>
                    <td className="px-6 py-4">{row.address || "Device Location"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Time_And_Attendance_Table;
