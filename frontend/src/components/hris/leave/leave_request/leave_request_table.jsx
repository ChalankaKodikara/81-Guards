/** @format */
import moment from "moment";
import React, { useState, useEffect, useMemo } from "react";
import { FaArrowRight, FaCalendarAlt } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { MdKeyboardArrowDown } from "react-icons/md";
import Papa from "papaparse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Importing DatePicker styles
import Leave_process_popup from "./leave_process_popup";
import Leave_Request_Popup from "./leave_request_popup";


const Leave_request_table = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const rowsPerPage = 5;
  const [isOpen, setIsOpen] = useState(false);
  const [isRqstOpen, setIsRqstOpen] = useState(false);
  const [currentLeave, setCurrentLeave] = useState(null);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedDesignation, setSelectedDesignation] =
    useState("All Designations");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDesignationDropdownOpen, setIsDesignationDropdownOpen] =
    useState(false);

  // Define state for date range
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const API_URL = process.env.REACT_APP_FRONTEND_URL;

  useEffect(() => {
    fetchData();
    fetchDepartments();
    fetchDesignations();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/v1/hris/leave/getleaveapprove1`);
      const result = await response.json();
      setLeaveData(result);
    } catch (error) {
      console.error("Error fetching requested leave data:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_URL}/v1/hris/departments`); // Corrected line
      const result = await response.json();
      setDepartments(result);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await fetch(
        `${API_URL}/v1/hris/designations/getdesignation`
      );
      const result = await response.json();

      // Extract unique departments
      const uniqueDepartments = Array.from(
        new Set(result.map((designation) => designation.department))
      );
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error("Error fetching designations:", error);
    }
  };

  const filteredData = useMemo(() => {
    if (!Array.isArray(leaveData)) return [];

    let data = leaveData.filter((leave) =>
      leave.employee_no.toLowerCase().includes(searchInput.toLowerCase())
    );

    if (selectedDepartment !== "All Departments") {
      data = data.filter((leave) => leave.department === selectedDepartment);
    }

    if (selectedDesignation !== "All Designations") {
      data = data.filter((leave) => leave.designation === selectedDesignation);
    }

    if (startDate && endDate) {
      data = data.filter((leave) => {
        const leaveDate = new Date(leave.requested_date);
        return leaveDate >= startDate && leaveDate <= endDate;
      });
    }

    return data;
  }, [
    searchInput,
    leaveData,
    selectedDepartment,
    selectedDesignation,
    startDate,
    endDate,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Data for current page
  const currentData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const togglePopup = (leave) => {
    setCurrentLeave(leave);
    setIsOpen(!isOpen);
  };

  const toggleRqstPopup = (leaveId) => {
    setSelectedLeaveId(leaveId);
    setIsRqstOpen(!isRqstOpen);
  };

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);

    if (department === "All Departments") {
      setSelectedDepartment("All Departments");
    }

    setIsDropdownOpen(false);
  };

  const handleDesignationSelect = (designation) => {
    setSelectedDesignation(designation);
    setIsDesignationDropdownOpen(false);
  };

  const exportToCSV = () => {
    const csvData = filteredData.map((leave) => ({
      ID: leave.employee_no,
      "Employee Name": leave.employee_fullname,
      Department: leave.department,
      "Date of Leave Applied": leave.requesting_date,
      "Leave Category": leave.leave_category,
      "Leave Requested Date": leave.requested_date,
      Reason: leave.reason,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "leave_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4">
      <div className="mt-1">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <input
                className="border border-black rounded-xl p-2 pl-10 w-[325px]"
                placeholder="Search by ID or Department"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <CiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
            </div>

          </div>

          <div className="flex items-center gap-5">
            <div className="relative">
              <button
                className=" text-white bg-primary_color px-4 py-2 rounded-md "
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex gap-3 items-center">
                  <div>{selectedDepartment}</div>
                  <MdKeyboardArrowDown />
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <ul>
                    {departments.map((department, index) => (
                      <li
                        key={index}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => handleDepartmentSelect(department)}
                      >
                        {department}
                      </li>
                    ))}
                    <li
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleDepartmentSelect("All Departments")}
                    >
                      All Departments
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <button
              className=" text-white bg-primary_color px-4 py-2 rounded-md"
              onClick={exportToCSV}
            >
              Export to CSV
            </button>
          </div>
        </div>
        <div>

          <div className="flex items-center space-x-2 bg-white rounded-[20px] px-4 py-2 shadow-sm border border-black w-[400px] mt-5">
            <FaCalendarAlt className="h-5 w-5 text-gray-400" />
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="d MMM, yyyy"
              placeholderText="Start Date"
              className="text-sm text-gray-600 focus:outline-none"
            />
            <span className="text-gray-400">-</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="d MMM, yyyy"
              placeholderText="End Date"
              className="text-sm text-gray-600 focus:outline-none"
            />
          </div>
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200 mt-10">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
              Employee Name
            </th>
            <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
              Date of Leave Applied
            </th>
            <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
              Leave Category
            </th>
            <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
              Leave Requested Date
            </th>

            <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentData.map((leave, i) => (
            <tr key={leave.id}>
              <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                {leave.employee_no}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">
                {leave.employee_fullname}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">
                <span className="px-2 inline-flex text-md leading-5 font-semibold rounded-full">
                  {leave.department}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                {moment(leave.requesting_date).format("DD/MM/YY")}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                {leave.category_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                {moment(leave.requested_date).format("DD/MM/YY")}
              </td>



              <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                {leave.reason}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">

                <button
                  className="bg-secondary_color_purple p-2 text-white bg-blue-400 rounded-lg"
                  onClick={() => toggleRqstPopup(leave.id)}
                >
                  <FaArrowRight />
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center py-3">
        <div>
          Showing{" "}
          {currentData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{" "}
          {currentPage * rowsPerPage > filteredData.length
            ? filteredData.length
            : currentPage * rowsPerPage}{" "}
          of {filteredData.length} employees
        </div>
        <div className="flex space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 border rounded-md ${currentPage === page ? "bg-gray-300" : "bg-white"
                }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>

      {/* Leave Process Popup */}
      {isOpen && currentLeave && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4">
            <Leave_process_popup
              togglePopup={() => setIsOpen(false)}
              employeeNo={currentLeave.employee_no}
              leaveId={currentLeave.id}
            />
          </div>
        </div>
      )}

      {/* Leave Request Popup */}
      {isRqstOpen && selectedLeaveId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 h-[60%] relative">
            <button
              className="absolute top-2 right-2 text-gray-500 "
              onClick={() => setIsRqstOpen(false)}
            >
              Close
            </button>
            <Leave_Request_Popup
              leaveId={selectedLeaveId}
              onClose={() => {
                setIsRqstOpen(false);
                fetchData(); // Refresh the table data after closing the popup
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave_request_table;