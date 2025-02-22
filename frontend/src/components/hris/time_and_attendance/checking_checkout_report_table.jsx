import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import moment from "moment";
import usePermissions from "../../permissions/permission";
import Cookies from "js-cookie"; // Import Cookies
import { MdOutlineFileDownload } from "react-icons/md";
const CheckinCheckoutReportTable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); // State to track selected status
  const [startDate, setStartDate] = useState(moment().toDate());
  const [endDate, setEndDate] = useState(moment().toDate());
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const { hasPermission } = usePermissions();
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  const rowsPerPage = 12;
  const [callingNameQuery, setCallingNameQuery] = useState(""); // State for calling name filter

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
      case "normal":
      case "normal in / early out":
        return "bg-[#A7FFC5] p-1"; // Add color for normal statuses
      default:
        return "bg-gray-100 text-gray-800"; // Default class for other types
    }
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
        endpoint = `http://localhost:8599/v1/hris/attendence/getAttendanceHistroy?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      } else if (userType === "admin" && supervisorId) {
        endpoint = `http://localhost:8599/v1/hris/attendence/getAttendanceHistroybysupervisor?startDate=${formattedStartDate}&endDate=${formattedEndDate}&supervisorId=${supervisorId}`;
      } else {
        console.error("Invalid user type or missing supervisor ID.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(endpoint);
        const result = await response.json();

        if (result.success) {
          const mappedData = result.data.map((item) => ({
            date: item.date,
            employee_number: item.employee_number,
            employee_name: item.employee_name || "-",
            employee_calling_name: item.employee_calling_name || "-",
            check_in_time: item.check_in_time || "-",
            check_out_time: item.check_out_time || "-",
            department: item.department || "-",
            status: item.status || "-",
            address: item.address || "-",
          }));
          setData(mappedData);
        } else {
          setData([]);
          console.error("Error fetching data:", result.message || "Unknown error");
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
  }, [startDate, endDate]); // Re-fetch data when date range changes


  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Data");

    // Define headers, including the "Calling Name" column
    worksheet.columns = [
      { header: "Date", key: "Date", width: 30 },
      { header: "Employee Number", key: "EmployeeNumber", width: 30 },
      { header: "Employee Name", key: "EmployeeName", width: 30 },
      { header: "Calling Name", key: "CallingName", width: 30 }, // New column for Calling Name
      { header: "Check-In Time", key: "CheckInTime", width: 30 },
      { header: "Check-Out Time", key: "CheckOutTime", width: 30 },
      { header: "Department", key: "Department", width: 30 },
      { header: "Status", key: "Status", width: 30 },
      { header: "Address", key: "Address", width: 30 },
    ];

    // Add rows, including the "Calling Name" field
    const filteredEmployeeData = data.filter((employee) => {
      const matchesEmployeeNumber = employee.employee_number
        ? employee.employee_number.toLowerCase().includes(searchQuery.toLowerCase())
        : false;

      const matchesCallingName = employee.employee_calling_name
        ? employee.employee_calling_name.toLowerCase().includes(callingNameQuery.toLowerCase())
        : false;

      const matchesDepartment =
        selectedDepartment === "" || employee.department === selectedDepartment;

      const matchesStatus =
        selectedStatus === "" || employee.status === selectedStatus;

      return matchesEmployeeNumber && matchesCallingName && matchesDepartment && matchesStatus;
    });
    // Apply header styles
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "6d709c" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "f3f4f6" },
      };
      cell.alignment = { horizontal: "center" };
    });

    // Apply row styling (alternative row colors)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber !== 1) {
        const isEvenRow = rowNumber % 2 === 0;
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: isEvenRow ? "f4e5ff" : "FFFFFFFF" },
          };
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });
        row.height = 30;
      }
    });

    // Generate and save the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "attendance_data.xlsx");
  };

  const filteredEmployeeData = data.filter((employee) => {
    const matchesEmployeeNumber = employee.employee_number
      ? employee.employee_number.toLowerCase().includes(searchQuery.toLowerCase())
      : false;

    const matchesCallingName = employee.employee_calling_name
      ? employee.employee_calling_name.toLowerCase().includes(callingNameQuery.toLowerCase())
      : false;

    const matchesDepartment =
      selectedDepartment === "" || employee.department === selectedDepartment;

    const matchesStatus =
      selectedStatus === "" || employee.status === selectedStatus;

    return matchesEmployeeNumber && matchesCallingName && matchesDepartment && matchesStatus;
  });

  const departments = [...new Set(data.map((employee) => employee.department))];

  const currentData = filteredEmployeeData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredEmployeeData.length / rowsPerPage);

  const maxVisiblePages = 5;
  const startPage = Math.max(
    Math.min(
      currentPage - Math.floor(maxVisiblePages / 2),
      totalPages - maxVisiblePages + 1
    ),
    1
  );
  const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to first page when filtering
  };
  const filteredData = data.filter((row) => {
    const matchesEmployeeNumber = row.employee_number
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCallingName = row.employee_calling_name
      ?.toLowerCase()
      .includes(callingNameQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "" || row.department === selectedDepartment;
    const matchesStatus =
      selectedStatus === "" || row.status.toLowerCase() === selectedStatus;

    return matchesEmployeeNumber && matchesCallingName && matchesDepartment && matchesStatus;
  });

  return (
    <div>
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
        <div className="flex gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-2">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>       
        </div>
      </div>
      <button
        className="px-4 py-2 text-white bg-[#2495FE] bg-opacity-55 rounded hover:bg-blue-600 flex justify-end mb-2"
      >
        <div className="flex items-center gap-3 justify-end">
          <div>
            <MdOutlineFileDownload />
          </div>
          <div className="z-1000">Export</div>
        </div>
      </button>

      <div className="overflow-x-auto">

        <div className="table-container">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <table>
              <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-900"> Date</th>
                    <th className="px-6 py-4 font-medium text-gray-900">Employee No
                    </th>
                    <th className="px-6 py-4 font-medium text-gray-900"> Employee Name</th>
                    <th className="px-6 py-4 font-medium text-gray-900">Calling Name</th>
                    <th className="px-6 py-4 font-medium text-gray-900">Department</th>
                    <th className="px-6 py-4 font-medium text-gray-900">  Employee Fullname</th>
                    <th className="px-6 py-4 font-medium text-gray-900">Check In Timee</th>
                    <th className="px-6 py-4 font-medium text-gray-900">Check Out Time</th>
                    <th className="px-6 py-4 font-medium text-gray-900">Address  </th>
                    <th className="px-6 py-4 font-medium text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 border-t border-gray-200">
                  {currentData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{row.date}</td>
                      <td className="px-6 py-4">{row.employee_number}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                            {row.employee_name
                              .split(" ")
                              .map((name) => name[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {row.employee_name}
                            </div>
                            <div className="text-sm text-gray-500">{row.employee_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{row.employee_calling_name}</td>
                      <td className="px-6 py-4">{row.department}</td>
                      <td className="px-6 py-4">{row.check_in_time}</td>
                      <td className="px-6 py-4">{row.check_out_time}</td>
                      <td className="px-6 py-4">{row.address}</td>
                      <td className="px-6 py-4">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </table>
          )}

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
  );
};

export default CheckinCheckoutReportTable;
