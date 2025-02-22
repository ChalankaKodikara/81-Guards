import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import moment from "moment";
import { CiSearch } from "react-icons/ci";
import "react-datepicker/dist/react-datepicker.css";
import Logo_HRIS from "../../../assets/LOGO HRIS 6.png"; // HRIS Logo path
import Cookies from "js-cookie"; // For fetching user details
import { MdOutlineFileDownload } from "react-icons/md";
import DatePicker from "react-datepicker";

const Summary_Report = () => {
  const currentDate = moment().format("MMMM Do YYYY");
  const [currentTime, setCurrentTime] = useState(moment().format("h:mm:ss a"));
  const [startDate, setStartDate] = useState(moment().toDate());
  const [endDate, setEndDate] = useState(moment().toDate());
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  const [callingNameQuery, setCallingNameQuery] = useState(""); // For calling name search

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(
          `${API_URL}/v1/hris/designations/getdesignation`
        );
        const result = await response.json();
        const departmentsData = Array.isArray(result)
          ? result.map((item) => item.department)
          : [];
        setDepartments([...new Set(departmentsData)]);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();

    const timer = setInterval(() => {
      setCurrentTime(moment().format("h:mm:ss a"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    handleFetchData();
  }, []);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleFetchData = async () => {
    if (startDate && endDate) {
      setIsLoading(true);
      const formattedStartDate = moment(startDate).format("YYYY-MM-DD");
      const formattedEndDate = moment(endDate).format("YYYY-MM-DD");
      const userType = Cookies.get("user_type");
      const supervisorId = Cookies.get("supervisorId");

      let endpoint;
      if (userType === "superadmin") {
        endpoint = `${API_URL}/v1/hris/attendence/getLeaveByDateRange?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      } else if (userType === "admin") {
        if (supervisorId) {
          endpoint = `${API_URL}/v1/hris/attendence/getLeaveByDateRange?startDate=${formattedStartDate}&endDate=${formattedEndDate}&supervisorId=${supervisorId}`;
        } else {
          console.error("Supervisor ID is required for admin users.");
          setIsLoading(false);
          return;
        }
      } else {
        console.error("Invalid user type.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(endpoint);
        const result = await response.json();
        console.log("API response:", result);

        if (Array.isArray(result)) {
          setData(result);
        } else if (result.success && Array.isArray(result.data)) {
          setData(result.data);
        } else {
          console.error("Unexpected API response format:", result);
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please select both start and end dates.");
    }
  };


  useEffect(() => {
    handleFetchData();
  }, [startDate, endDate]);


  const getUniqueDepartments = () => departments;

  const filteredData = data.filter((row) => {
    const employeeNoMatch = row.employee_no
      ? row.employee_no.toLowerCase().includes(searchQuery.toLowerCase())
      : false;

    const callingNameMatch = row.employee_calling_name
      ? row.employee_calling_name.toLowerCase().includes(callingNameQuery.toLowerCase())
      : false;

    const departmentMatch = selectedDepartment
      ? row.department && row.department === selectedDepartment
      : true;

    return employeeNoMatch && callingNameMatch && departmentMatch;
  });




  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Summary Report");

    // Define column headers
    worksheet.columns = [
      { header: "Date", key: "Date", width: 15 },
      { header: "Employee No", key: "EmployeeNo", width: 15 },
      { header: "Employee Fullname", key: "EmployeeFullname", width: 25 },
      { header: "Calling Name", key: "CallingName", width: 20 },
      { header: "Email", key: "Email", width: 30 },
      { header: "Branch", key: "Branch", width: 20 },
      { header: "Employment Type", key: "EmploymentType", width: 20 },
      { header: "Department", key: "Department", width: 20 },
      { header: "Leave Type", key: "LeaveType", width: 15 },
      { header: "Reason", key: "Reason", width: 30 },
      { header: "Check-In Time", key: "CheckInTime", width: 15 },
      { header: "Check-Out Time", key: "CheckOutTime", width: 15 },
      { header: "Status", key: "Status", width: 15 },
    ];

    // Add rows of filtered data
    filteredData.forEach((row) => {
      worksheet.addRow({
        Date: row.date ? moment(row.date).format("D-MMM-YY") : "N/A",
        EmployeeNo: row.employee_no || "N/A",
        EmployeeFullname: row.employee_fullname || "N/A",
        CallingName: row.employee_calling_name || "N/A",
        Email: row.employee_email || "N/A",
        Branch: row.branch || "N/A",
        EmploymentType: row.employment_type || "N/A",
        Department: row.department || "N/A",
        LeaveType: row.leave_type || "N/A",
        Reason: row.reason || "N/A",
        CheckInTime: row.checkIN_time ? moment(row.checkIN_time).format("HH:mm") : "N/A",
        CheckOutTime: row.checkOUT_time ? moment(row.checkOUT_time).format("HH:mm") : "N/A",
        Status: row.status || "N/A",
      });
    });

    // Generate Excel file and prompt download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "summary_report.xlsx");
  };




  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfMaxPages = Math.floor(maxPagesToShow / 2);
    const startPage = Math.max(1, currentPage - halfMaxPages);
    const endPage = Math.min(totalPages, currentPage + halfMaxPages);

    if (currentPage > halfMaxPages + 1) {
      pageNumbers.push(
        <li key="start" className="mx-1">
          <button
            onClick={() => handlePageChange(1)}
            className="px-4 py-2 border rounded bg-white text-gray-800"
          >
            1
          </button>
          <span className="px-2">...</span>
        </li>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li key={i} className="mx-1">
          <button
            onClick={() => handlePageChange(i)}
            className={`px-4 py-2 border rounded ${currentPage === i
              ? "bg-[#7226a5] text-white"
              : "bg-white text-gray-800"
              }`}
          >
            {i}
          </button>
        </li>
      );
    }

    if (endPage < totalPages) {
      pageNumbers.push(
        <li key="end" className="mx-1">
          <span className="px-2">...</span>
          <button
            onClick={() => handlePageChange(totalPages)}
            className="px-4 py-2 border rounded bg-white text-gray-800"
          >
            {totalPages}
          </button>
        </li>
      );
    }

    return <ul className="flex">{pageNumbers}</ul>;
  };

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
        return "bg-gray-100 text-gray-800";
    }
  };

  // Loader component with semi-transparent overlay
  const Loader = () => {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200 bg-opacity-75 z-50">
        <img
          src={Logo_HRIS}
          alt="HRIS Logo"
          className="animate__pulse animate__animated animate__infinite w-40 h-40"
        />
      </div>
    );
  };
  const [isSuccessPopupVisible, setIsSuccessPopupVisible] = useState(false); // Popup state


  return (
    <div className="mt-5 relative">
      {isLoading && <Loader />}
      <div
        className={`${isLoading ? "opacity-50" : "opacity-100"
          } transition-opacity duration-300`}
      >
        <div>
          <div className="flex justify-between mt-5 items-center">
            <p className="text-[30px] font-semibold">Absent-Leave Summary Report </p>
          </div>
        </div>


        <div className="grid grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by employee ID"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Search by calling name"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select

            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select by department</option>
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


          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Start Date"
            maxDate={endDate} // Prevent selecting a start date after the end date
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText="End Date"
            minDate={startDate} // Prevent selecting an end date before the start date
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        <button
          onClick={handleExportExcel}
          className="px-4 py-2 text-white bg-[#2495FE] bg-opacity-55 rounded hover:bg-blue-600 flex justify-end mb-2"
        >
          <div className="flex items-center gap-3 justify-end">
            <div>
              <MdOutlineFileDownload />
            </div>
            <div className="z-1000">Export</div>
          </div>
        </button>

        {/* Table */}
        <div className="overflow-x-auto">

          <div className="table-container">
            <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-900">Date</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Employee No</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Employee Fullname</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Calling Name</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Email</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Branch</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Employment Type</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Department</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Leave Type</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Reason</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Check-In Time</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Check-Out Time</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{row.date ? moment(row.date).format("D-MMM-YY") : "N/A"}</td>
                      <td className="px-6 py-4">{row.employee_no || "N/A"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                            {row.employee_fullname
                              .split(" ")
                              .map((name) => name[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {row.employee_fullname}
                            </div>
                            <div className="text-sm text-gray-500">
                              {row.employee_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{row.employee_calling_name || "N/A"}</td>
                      <td className="px-6 py-4">{row.employee_email || "N/A"}</td>
                      <td className="px-6 py-4">{row.branch || "N/A"}</td>
                      <td className="px-6 py-4">{row.employment_type || "N/A"}</td>
                      <td className="px-6 py-4">{row.department || "N/A"}</td>
                      <td className="px-6 py-4">{row.leave_type || "N/A"}</td>
                      <td className="px-6 py-4">{row.reason || "N/A"}</td>
                      <td className="px-6 py-4">
                        {row.checkIN_time ? moment(row.checkIN_time).format("HH:mm") : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {row.checkOUT_time ? moment(row.checkOUT_time).format("HH:mm") : "N/A"}
                      </td>
                      <td className="px-6 py-4">{row.status || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" className="text-center py-4">
                      No data available for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {/* {Math.min(currentPage * rowsPerPage, filteredEmployees.length)} */}
              </span>{" "}
              of <span className="font-medium"></span> entries
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-200" : "bg-blue-500 text-white"
                }`}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
              const page = index + 1 + Math.floor((currentPage - 1) / 5) * 5;
              return (
                page <= totalPages && (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded ${currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200"
                      }`}
                  >
                    {page}
                  </button>
                )
              );
            })}

            {currentPage + 5 <= totalPages && (
              <button
                className="px-3 py-1 rounded bg-blue-500 text-white"
              >
                See More
              </button>
            )}

            <button
              className={`px-3 py-1 rounded ${currentPage === totalPages
                ? "bg-gray-200"
                : "bg-blue-500 text-white"
                }`}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary_Report;