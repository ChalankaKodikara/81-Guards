import React, { useState, useEffect } from "react";
import moment from "moment";
import { CiSearch } from "react-icons/ci";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Cookies from "js-cookie";
import { MdOutlineFileDownload } from "react-icons/md";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const Absence_Report = () => {
  const [data, setData] = useState([]); // Initialize as an empty array
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(moment().toDate());
  const [endDate, setEndDate] = useState(moment().toDate());
  const [selectedDepartment, setSelectedDepartment] = useState(""); // State for department filter
  const rowsPerPage = 10;

  const API_URL = process.env.REACT_APP_FRONTEND_URL;

  const handleFetchData = async () => {
    if (startDate && endDate) {
      const formattedStartDate = moment(startDate).format("YYYY-MM-DD");
      const formattedEndDate = moment(endDate).format("YYYY-MM-DD");
      const userType = Cookies.get("user_type");
      const supervisorId = Cookies.get("supervisorId");

      let endpoint;

      if (userType === "superadmin") {
        endpoint = `https://back-demo-local-hris.quortech-technologies.com/v1/hris/attendence/getNotAttend?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      } else if (userType === "admin" && supervisorId) {
        endpoint = `https://back-demo-local-hris.quortech-technologies.com/v1/hris/attendence/getNotAttendBySupervisor?startDate=${formattedStartDate}&endDate=${formattedEndDate}&supervisorId=${supervisorId}`;
      } else {
        console.error("Invalid user type or missing supervisor ID.");
        return;
      }

      try {
        const response = await fetch(endpoint);
        const result = await response.json();

        // Ensure result is an array before setting state
        if (Array.isArray(result)) {
          setData(result);
        } else {
          console.error("Fetched data is not an array:", result);
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
      }
    } else {
      alert("Please select both start and end dates.");
    }
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  // Filtered Data Based on Selected Department
  const filteredData = data.filter((row) => {
    return (
      selectedDepartment === "" || row.department === selectedDepartment
    );
  });


  // Export to Excel Functionality
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Absence Report");

    // Define table headers
    worksheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Employee Number", key: "employee_no", width: 20 },
      { header: "Full Name", key: "employee_fullname", width: 30 },
      { header: "Calling Name", key: "employee_calling_name", width: 20 },
      { header: "Department", key: "department", width: 20 },
      { header: "Branch", key: "branch", width: 20 }, // Added Branch header
      { header: "Remark", key: "remark", width: 30 },
    ];

    // Add rows to worksheet
    data.forEach((row) => {
      worksheet.addRow({
        date: moment(row.date).format("YYYY-MM-DD"),
        employee_no: row.employee_no,
        employee_fullname: row.employee_fullname,
        employee_calling_name: row.employee_calling_name || "-",
        department: row.department,
        branch: row.branch, // Add Branch data
        remark: row.remark,
      });
    });


    // Apply header styles
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    // Generate and save Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Absence_Report.xlsx");
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get unique departments for the dropdown
  const departments = [...new Set(data.map((row) => row.department))];

  return (
    <div className="mx-10 mt-5">
      <div className="flex justify-between mt-6">
        <div>
          <p className="text-[30px] font-semibold">Absence Report</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="flex gap-2 items-center">
          <p>Start date</p>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Start Date"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <p>End Date</p>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText="End Date"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {departments.map((dept, index) => (
            <option key={index} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <button
          onClick={handleFetchData}
          className="px-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-[100px] flex items-center justify-center gap-2"
        >
          <CiSearch />
          Search
        </button>

        <button
          onClick={exportToExcel}
          className="px-4 py-2 text-white bg-[#2495FE] bg-opacity-55 rounded hover:bg-blue-600 flex justify-center mb-2 w-[150px]"
        >
          <div className="flex items-center gap-3 justify-end">
            <MdOutlineFileDownload />
            <div className="z-1000">Export</div>
          </div>
        </button>

      </div>

      <div className="overflow-x-auto">
        <div className="table-container">
          <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-900">Date</th>
                <th className="px-6 py-4 font-medium text-gray-900">Employee Number</th>
                <th className="px-6 py-4 font-medium text-gray-900">Full Name</th>
                <th className="px-6 py-4 font-medium text-gray-900">Calling Name</th>
                <th className="px-6 py-4 font-medium text-gray-900">Department</th>
                <th className="px-6 py-4 font-medium text-gray-900">Branch</th>
                <th className="px-6 py-4 font-medium text-gray-900">Remark</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{moment(row.date).format("YYYY-MM-DD")}</td>
                    <td className="px-6 py-4">{row.employee_no}</td>
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
                          <div className="text-sm text-gray-500">{row.employee_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{row.employee_calling_name || "- -"}</td>
                    <td className="px-6 py-4">{row.department}</td>
                    <td className="px-6 py-4">{row.branch}</td>
                    <td className="px-6 py-4">{row.remark}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 text-center" colSpan={6}>
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <div className="flex justify-center mt-4">
          <button
            className={`px-3 py-1 mx-1 rounded ${currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"}`}
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
            const page = index + 1 + Math.floor((currentPage - 1) / 5) * 5;
            return (
              page <= totalPages && (
                <button
                  key={page}
                  className={`px-3 py-1 mx-1 rounded ${currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )
            );
          })}

          {currentPage + 5 <= totalPages && (
            <button
              className="px-3 py-1 mx-1 rounded bg-blue-500 text-white"
              onClick={() => handlePageChange(currentPage + 5)}
            >
              See More
            </button>
          )}

          <button
            className={`px-3 py-1 mx-1 rounded ${currentPage === totalPages ? "bg-gray-300" : "bg-blue-500 text-white"}`}
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
};

export default Absence_Report;
