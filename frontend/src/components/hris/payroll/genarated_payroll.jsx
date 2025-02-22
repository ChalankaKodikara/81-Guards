import React, { useState, useEffect, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import Cookies from "js-cookie";

const Generatedpayrolls = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [currency, setCurrency] = useState(Cookies.get("currency") || "USD");
  const [symbol, setSymbol] = useState(Cookies.get("symbol") || "$");

  const [year, setYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [month, setMonth] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showModal, setShowModal] = useState(false);
  const [employeePayroll, setEmployeePayroll] = useState(null);
  const modalRef = useRef(null);
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("error");
  const [showPopup, setShowPopup] = useState(false);
  const [dataFetched, setDataFetched] = useState(false); // New state to track data fetching
  const [employeeNoFilter, setEmployeeNoFilter] = useState("");
  const [employeeNameFilter, setEmployeeNameFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const closePopup = () => {
    setShowPopup(false);
    setPopupMessage("");
  };
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(employeeData);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      setFilteredData(
        employeeData.filter(
          (employee) =>
            employee.employee_no.toLowerCase().includes(lowercasedQuery) ||
            employee.employee_fullname.toLowerCase().includes(lowercasedQuery)
        )
      );
    }
  }, [searchQuery, employeeData]);
  useEffect(() => {
    setCurrency(Cookies.get("currency") || "USD");
    setSymbol(Cookies.get("symbol") || "$");
  }, []);

  // Fetch employee data based on year and month
  const fetchEmployeeData = async () => {
    if (!year || !month) {
      setPopupMessage("Please select both year and month!");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/v1/hris/payroll/payrollEmployees?year=${year}&month=${month}`
      );

      const data = await response.json();

      if (response.ok) {
        setEmployeeData(data.employees || []);
        setFilteredData(data.employees || []);
        setDataFetched(true); // Set dataFetched to true when data is fetched

        setCurrentPage(1);
      } else {
        setPopupMessage(
          data.message || "Failed to fetch employee data. Please try again."
        );
        setPopupType("error");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      setPopupMessage(
        "An error occurred while fetching data. Please try again."
      );
      setPopupType("error");
    } finally {
      setIsLoading(false); // Always stop loading state
    }
  };

  // Fetch employee payroll details and show the modal
  const handleEmployeeDetails = async (
    employee_no,
    employee_fullname,
    employee_email
  ) => {
    setSelectedEmployee({ employee_no, employee_fullname, employee_email }); // Store employee details
    try {
      const response = await fetch(
        `${API_URL}/v1/hris/payroll/calculatepayrollbyemployee?employee_no=${employee_no}&month=${month}&year=${year}`
      );
      const data = await response.json();

      if (response.ok) {
        setEmployeePayroll(data);
        setShowModal(true); // Ensure modal is displayed
      } else {
        setPopupMessage("Failed to generate payroll. Please try again.");
        setPopupType("error");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error generating payroll:", error);
      setPopupMessage("An error occurred. Please try again.");
      setPopupType("error");
      setShowPopup(true);
    }
  };
  const handleExportPDF = async () => {
    if (!modalRef.current) return;

    // Temporarily hide unnecessary elements like the close button
    const closeButton = modalRef.current.querySelector(".close-button");
    if (closeButton) closeButton.style.display = "none";

    // Generate the PDF content with a higher scale for better quality
    const canvas = await html2canvas(modalRef.current, {
      scale: 1, // Increase scale for higher resolution
      useCORS: true, // Allow cross-origin images if any are present
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // Restore visibility of hidden elements
    if (closeButton) closeButton.style.display = "";

    // Use employee_no for the file name
    const fileName = `${
      selectedEmployee?.employee_no || "Employee"
    }_Salary_Breakdown.pdf`;
    pdf.save(fileName);
  };

  const handleClose = () => {
    setShowModal(false);
    setEmployeePayroll(null);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleExportExcel = async () => {
    if (!year || !month) {
      alert("Please select both year and month!");
      return;
    }

    setIsLoading(true);

    try {
      // Trigger GET request
      const response = await fetch(
        `${API_URL}/v1/hris/payroll/allActiveEmployeesPayroll?year=${year}&month=${month}`
      );
      const data = await response.json();

      if (response.ok) {
        // Generate Excel from response data
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Payroll");
        XLSX.writeFile(workbook, `Employee_Payroll_${year}_${month}.xlsx`);
      } else {
        alert(data.message || "Failed to fetch payroll data.");
      }
    } catch (error) {
      console.error("Error exporting payroll data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters on employee data
  useEffect(() => {
    let filtered = employeeData;

    if (employeeNoFilter.trim()) {
      filtered = filtered.filter((employee) =>
        employee.employee_no
          .toLowerCase()
          .includes(employeeNoFilter.trim().toLowerCase())
      );
    }

    if (employeeNameFilter.trim()) {
      filtered = filtered.filter((employee) =>
        employee.employee_fullname
          .toLowerCase()
          .includes(employeeNameFilter.trim().toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [employeeNoFilter, employeeNameFilter, employeeData]);

  return (
    <div className="mx-5 mt-5 font-montserrat">
      <p className="text-[24px] mb-5">Payroll Navigation / Generated Payroll</p>
      <div className="shadow-lg p-5 rounded-lg bg-white w-[65%]">
        <div>
          <p className="text-[24px] mb-4">Search Employee Payroll</p>
        </div>
        <div className="flex items-center gap-5 justify-end mt-5">
          {dataFetched && (
            <button
              onClick={handleExportExcel}
              disabled={isLoading}
              className="bg-blue-200 text-blue-400 p-2 rounded-lg"
            >
              {isLoading ? "Exporting..." : "Export to Excel"}
            </button>
          )}
        </div>
        {/* Filters for Year and Month */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Year
            </label>
            <select
              className="border border-gray-300 rounded px-3 py-2 w-64"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Select Year</option>
              {Array.from({ length: 10 }, (_, i) => {
                const currentYear = new Date().getFullYear() - i;
                return (
                  <option key={currentYear} value={currentYear}>
                    {currentYear}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Month
            </label>
            <select
              className="border border-gray-300 rounded px-3 py-2 w-64"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">Select Month</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((monthName, index) => (
                <option key={index} value={index + 1}>
                  {monthName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={fetchEmployeeData}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Search"}
            </button>
          </div>
        </div>
        {dataFetched && (
          <>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded px-3 py-2 w-64"
                  placeholder="e.g. EMP001"
                  value={employeeNoFilter}
                  onChange={(e) => setEmployeeNoFilter(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded px-3 py-2 w-64"
                  placeholder="e.g. John"
                  value={employeeNameFilter}
                  onChange={(e) => setEmployeeNameFilter(e.target.value)}
                />
              </div>
            </div>
          </>
        )}
        {/* Employee Data Table */}
        <div className="mt-5">
          <div className="table-container">
            <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-900">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-900">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-900">
                    Employee Email
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td className="px-6 py-4 text-center" colSpan={3}>
                      Loading...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 text-center" colSpan={3}>
                      No data available. Please search.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((employee, index) => (
                    <tr
                      key={index}
                      className="hover:bg-blue-50 cursor-pointer"
                      onClick={() =>
                        handleEmployeeDetails(
                          employee.employee_no,
                          employee.employee_fullname,
                          employee.employee_email
                        )
                      }
                    >
                      <td className="px-6 py-4">{employee.employee_no}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                            {employee.employee_fullname
                              .split(" ")
                              .map((n) => n[0]) // Get the first letter of each word
                              .slice(0, 2) // Limit to the first two letters
                              .join("") // Combine them into a string
                              .toUpperCase()}
                          </div>

                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.employee_fullname}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{employee.employee_email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && employeePayroll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
              className="bg-white rounded-lg p-5 w-[1200px] h-[80%] overflow-auto"
              ref={modalRef}
            >
              <div className="flex justify-end">
                {" "}
                <AiOutlineClose
                  className="cursor-pointer text-2xl"
                  onClick={handleClose}
                />
              </div>
              <div>
                <div className="flex justify-center">
                  <h2 className="text-xl ">Employee Salary Breakdown</h2>
                </div>
              </div>{" "}
              <div className="flex items-center mt-10">
                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                  {selectedEmployee?.employee_fullname
                    .split(" ")
                    .map((n) => n[0]) // Get the first letter of each word
                    .slice(0, 2) // Limit to the first two letters
                    .join("") // Combine them into a string
                    .toUpperCase()}
                </div>

                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {selectedEmployee?.employee_fullname}{" "}
                  </div>
                  {selectedEmployee?.employee_email && (
                    <div className="text-sm text-gray-500">
                      {selectedEmployee?.employee_email}{" "}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between ">
                {/* Export buttons */}
                <div className="flex flex-wrap gap-4 mb-4 mt-5">
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Year
                    </label>
                    <select
                      disabled
                      className="border border-gray-300 rounded px-3 py-2 w-64"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const currentYear = new Date().getFullYear() - i;
                        return (
                          <option key={currentYear} value={currentYear}>
                            {currentYear}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Month
                    </label>
                    <select
                      disabled
                      className="border border-gray-300 rounded px-3 py-2 w-64"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      <option value="">Select Month</option>
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((monthName, index) => (
                        <option key={index} value={index + 1}>
                          {monthName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>{" "}
                <div className="flex items-center gap-5 justify-end mt-5">
                  <button
                    className="bg-blue-200 text-blue-400 p-2 rounded-lg"
                    onClick={handleExportPDF}
                  >
                    Export PDF
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="border border-gray-300 p-5 rounded-xl shadow-lg">
                  <div className="mb-4">
                    <h3 className="font-semibold text-green-600 bg-green-200 w-fit px-4 py-2 rounded-lg">
                      Payroll Allowance
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {employeePayroll.allowances.map((allowance, index) => (
                      <div key={index} className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-1">
                            Component Name
                          </label>
                          <input
                            className="border border-gray-300 p-2 rounded-lg w-full"
                            value={allowance.suggested_name}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1">
                            Amount
                          </label>

                          <input
                            className="border border-gray-300 p-2 rounded-lg w-full"
                            value={`${symbol} ${allowance.value}`}
                            readOnly
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 font-semibold text-lg flex justify-between">
                    <p>Total Allowance</p>
                    <p>
                      :{" "}
                      {`${symbol} ${employeePayroll.payroll.total_allowances}`}
                    </p>
                  </div>
                </div>
                {/* Payroll Deduction Section */}
                <div className="border border-gray-300 p-5 rounded-xl shadow-lg">
                  <div className="mb-4">
                    <h3 className="font-semibold text-red-600 bg-red-200 w-fit px-4 py-2 rounded-lg">
                      Payroll Deduction
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {employeePayroll.deductions.map((deduction, index) => (
                      <div key={index} className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-1">
                            Component Name
                          </label>
                          <input
                            className="border border-gray-300 p-2 rounded-lg w-full"
                            value={deduction.suggested_name}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1">
                            Amount
                          </label>
                          <input
                            className="border border-gray-300 p-2 rounded-lg w-full"
                            value={`${symbol} ${deduction.value}`}
                            readOnly
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 font-semibold text-lg flex justify-between">
                    <p>Total Deduction</p>
                    <p>
                      :{" "}
                      {`${symbol} ${employeePayroll.payroll.total_deductions}`}
                    </p>
                  </div>
                </div>
              </div>
              {/* Summary Section */}
              <div className="flex justify-end mt-5">
                <div className="p-5 rounded-lg shadow-lg bg-white w-[350px]">
                  {/* Basic Salary */}
                  <div className="text-gray-600 flex justify-between">
                    <span>Basic Salary:</span>
                    <span className="text-gray-500">
                      {`${symbol} ${employeePayroll.payroll.basic_salary}`}
                    </span>
                  </div>

                  {/* Total Allowance */}
                  <div className="text-gray-600 flex justify-between mt-2">
                    <span>Total Allowance:</span>
                    <span className="text-green-600 font-bold">
                      {`${symbol} ${employeePayroll.payroll.total_allowances}`}
                    </span>
                  </div>

                  {/* Total Deduction */}
                  <div className="text-gray-600 flex justify-between mt-2">
                    <span>Total Deduction:</span>
                    <span className="text-red-600 font-bold">
                      {`${symbol} ${employeePayroll.payroll.total_deductions}`}
                    </span>
                  </div>

                  {/* Nopay Deduction */}
                  <div className="text-gray-600 flex justify-between mt-2">
                    <span>Nopay Deduction:</span>
                    <span className="text-red-600 font-bold">
                      {`${symbol} ${employeePayroll.payroll.calculated_nopay}`}
                    </span>
                  </div>

                  {/* Net Salary */}
                  <div className="text-black flex justify-between font-bold text-lg mt-3 border-t pt-3">
                    <span>Net Salary:</span>
                    <span>{`${symbol} ${employeePayroll.payroll.net_salary}`}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 relative">
              {/* Close Button */}
              <button
                onClick={closePopup}
                className="absolute top-2 right-2 text-gray-500 text-xl focus:outline-none"
              >
                &times;
              </button>

              {/* Popup Header */}
              <h2
                className={`text-center text-xl font-bold mb-4 ${
                  popupType === "error" ? "text-red-500" : "text-green-500"
                }`}
              >
                {popupType === "error" ? "Error" : "Success"}
              </h2>

              {/* Popup Message */}
              <p className="text-center mb-4">{popupMessage}</p>

              {/* Close Button */}
              <div className="flex justify-center">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
                  onClick={closePopup}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <p>
            Page {currentPage} of {totalPages}
          </p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Generatedpayrolls;
