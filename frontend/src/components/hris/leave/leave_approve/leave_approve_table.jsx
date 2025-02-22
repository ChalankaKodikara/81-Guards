import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci"; // Importing CiSearch icon
import { MdKeyboardArrowDown } from "react-icons/md"; // Importing MdKeyboardArrowDown icon
import Leave_process_popup from "../leave_request/leave_process_popup";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import moment from "moment";
import Cookies from "js-cookie";
import usePermissions from "../../../permissions/permission";

const Leave_approve_table = () => {
  const [departments, setDepartments] = useState([]); // State to store department names
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState(""); // For searching by employee name
  const [searchEmployeeId, setSearchEmployeeId] = useState(""); // New state for employee ID search
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Department");
  const [selectedDate, setSelectedDate] = useState(""); // State to store selected date
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployeeNo, setSelectedEmployeeNo] = useState(null);
  const rowsPerPage = 10;
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  const { hasPermission } = usePermissions();

  useEffect(() => {
    const supervisorId = Cookies.get("supervisorId");
    const userType = Cookies.get("user_type");

    if (!userType) {
      console.error("User type not found in cookies");
      return;
    }

    // Determine the correct endpoint based on user type
    const endpoint =
      userType === "superadmin"
        ? `${API_URL}/v1/hris/leave/getleave`
        : userType === "admin" && supervisorId
          ? `${API_URL}/v1/hris/leave/GetLeaveBySupervisorId?supervisor_id=${supervisorId}`
          : null;

    if (endpoint) {
      console.log("Fetching data from endpoint:", endpoint);
      fetchData(endpoint); // Fetch leave data
    } else {
      console.error(
        "Invalid user type or missing supervisor ID. Endpoint not defined."
      );
    }

    fetchDepartments(); // Fetch department list
  }, []);


  const fetchData = async (endpoint) => {
    try {
      console.log("Fetching data from:", endpoint); // Log the endpoint
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Fetched Data:", result); // Log the API response

      if (result.success) {
        // Handle array response (getleave)
        if (Array.isArray(result.data)) {
          setData(result.data);
          setFilteredData(result.data);
        }
        // Handle single object response (GetLeaveBySupervisorId)
        else if (result.data && typeof result.data === "object") {
          setData([result.data]); // Convert single object to array for consistency
          setFilteredData([result.data]);
        } else {
          console.error("Unexpected data format or empty response:", result);
          setData([]);
          setFilteredData([]);
        }
      } else {
        console.error("API returned failure:", result.message || "Unknown error");
        setData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setData([]);
      setFilteredData([]);
    }
  };


  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        `${API_URL}/v1/hris/employees/getemployeebasicdetails`
      );
      const result = await response.json();
      // Extract unique department names
      const uniqueDepartments = [
        ...new Set(result.map((employee) => employee.department_name)),
      ];
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    handleFilter();
  }, [searchInput, searchEmployeeId, selectedDepartment, selectedDate]);

  const handleFilter = () => {
    const newFilteredData = data.filter((employee) => {
      const matchesName = employee.employee_fullname
        .toLowerCase()
        .includes(searchInput.toLowerCase());

      const matchesEmployeeId = employee.employee_no
        .toLowerCase()
        .includes(searchEmployeeId.toLowerCase());

      const matchesDepartment =
        selectedDepartment === "All Department" ||
        employee.department === selectedDepartment;

      const matchesDate =
        !selectedDate || employee.requested_date === selectedDate;

      return matchesName && matchesEmployeeId && matchesDepartment && matchesDate;
    });

    newFilteredData.sort((a, b) =>
      moment(a.requested_date).isBefore(moment(b.requested_date)) ? -1 : 1
    );

    setFilteredData(newFilteredData);
    setCurrentPage(1); // Reset to the first page after filtering
  };

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    handleFilter();
    setIsDropdownOpen(false);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleEmployeeIdChange = (e) => {
    setSearchEmployeeId(e.target.value);
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const currentData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const togglePopup = (employeeNo = null) => {
    setSelectedEmployeeNo(employeeNo);
    setIsFormOpen(!isFormOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const exportToCSV = () => {
    const csvData = filteredData.map((employee) => ({
      ID: employee.employee_no,
      EmployeeName: employee.employee_fullname,
      Department: employee.department,
      DateOfLeaveApplied: moment(employee.requesting_date).format("D-MMM-YY"),
      LeaveCategory: employee.leave_category,
      LeaveRequestedDate: moment(employee.requested_date).format("D-MMM-YY"),
      Reason: employee.reason,
      Status: employee.approved_status_1,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "leave_approve_data.csv");
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbersToShow = 5;
    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxPageNumbersToShow / 2)
    );
    const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 border rounded-md ${currentPage === i ? "bg-gray-300" : "bg-white"
            }`}
        >
          {i}
        </button>
      );
    }

    if (startPage > 1) {
      pageNumbers.unshift(
        <button
          key="prev"
          onClick={() => handlePageChange(startPage - maxPageNumbersToShow)}
          className="px-3 py-1 border rounded-md bg-white"
        >
          &laquo; See Less
        </button>
      );
    }

    if (endPage < totalPages) {
      pageNumbers.push(
        <button
          key="next"
          onClick={() => handlePageChange(endPage + 1)}
          className="px-3 py-1 border rounded-md bg-white"
        >
          See More &raquo;
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between item-center mt-3">
        <div className="flex gap-4 items-center mt-5">
          <div className="relative">
            <input
              className="border border-black rounded-xl p-2 pl-10 w-[325px]"
              placeholder="Search by Employee Name"
              value={searchInput}
              onChange={handleSearchChange}
            />
            <CiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
          </div>
          <div className="relative">
            <input
              className="border border-black rounded-xl p-2 pl-10 w-[325px]"
              placeholder="Search by Employee ID"
              value={searchEmployeeId}
              onChange={handleEmployeeIdChange}
            />
            <CiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <div className="flex gap-4 items-center mt-5">
          <div className="relative">
            <button
              className="p-3 border border-black rounded-[12px]"
              onClick={toggleDropdown}
            >
              <div className="flex gap-3 items-center">
                <div>{selectedDepartment}</div>
                <MdKeyboardArrowDown />
              </div>
            </button>
            {isDropdownOpen && (
              <div className="absolute mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
                <ul>
                  <li
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleDepartmentSelect("All Department")}
                  >
                    All Department
                  </li>
                  {departments.map((department, index) => (
                    <li
                      key={index}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleDepartmentSelect(department)}
                    >
                      {department}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <input
              type="date"
              className="border border-black rounded-xl p-2"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>

          <div>
            {hasPermission(3410) && (
              <button
                className=" text-t px-4 py-2 rounded-md shadow-custom"
                onClick={exportToCSV}
              >
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      <table className="w-full border-collapse bg-white text-left text-sm text-gray-500 mt-12">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-4 font-medium text-gray-900">ID</th>
            <th className="px-3 py-4 font-medium text-gray-900">Employee Name</th>
            <th className="px-3 py-4 font-medium text-gray-900">Department</th>
            <th className="px-3 py-4 font-medium text-gray-900">Date of Leave Applied</th>
            <th className="px-3 py-4 font-medium text-gray-900">Leave Category</th>
            <th className="px-3 py-4 font-medium text-gray-900">Leave Requested Date</th>
            <th className="px-3 py-4 font-medium text-gray-900">Reason</th>
            <th className="px-3 py-4 font-medium text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 border-t border-gray-200">
          {currentData.length > 0 ? (
            currentData.map((employee) => (
              <tr key={employee.employee_no} className="hover:bg-gray-50">
                <td className="px-3 py-4">{employee.employee_no}</td>
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
                <td className="px-3 py-4">{employee.department}</td>
                <td className="px-3 py-4">{moment(employee.requesting_date).format("D-MMM-YY")}</td>
                <td className="px-3 py-4">{employee.leave_category}</td>
                <td className="px-3 py-4">{moment(employee.requested_date).format("D-MMM-YY")}</td>
                <td className="px-3 py-4">{employee.reason}</td>
                <td className="px-3 py-4">
                  <span className="px-2 inline-flex text-md leading-5 font-semibold rounded-full">
                    {employee.approved_status_1}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-4">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between items-center py-3">
        <div>
          Showing{" "}
          {currentData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{" "}
          {currentPage * rowsPerPage > filteredData.length
            ? filteredData.length
            : currentPage * rowsPerPage}{" "}
          of {filteredData.length} employees
        </div>
        <div className="flex space-x-2">{renderPageNumbers()}</div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Leave_process_popup
              togglePopup={togglePopup}
              employeeNo={selectedEmployeeNo}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave_approve_table;
