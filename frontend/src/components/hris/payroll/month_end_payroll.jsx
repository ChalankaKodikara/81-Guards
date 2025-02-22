import React, { useState, useEffect } from "react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Cookies from "js-cookie";

const MonthEndPayroll = () => {
  const [currency, setCurrency] = useState(Cookies.get("currency") || "USD");
  const [symbol, setSymbol] = useState(Cookies.get("symbol") || "$");

  const [showModal, setShowModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("error"); // 'error' or 'success'
  const [generatedEmployees, setGeneratedEmployees] = useState([]);
  const [employeePayroll, setEmployeePayroll] = useState(null);
  const [workingDays, setWorkingDays] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const modalRef = useRef(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false); // Add a loading state

  const handleToggleModal = () => {
    setShowModal(!showModal);
  };
  useEffect(() => {
    setCurrency(Cookies.get("currency") || "USD");
    setSymbol(Cookies.get("symbol") || "$");
  }, []);

  const closePopup = () => {
    setShowPopup(false);
    setPopupMessage("");
  };

  const handleGeneratePayroll = async () => {
    if (!selectedYear || !selectedMonth || !workingDays) {
      setPopupMessage("Please fill in all fields.");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    const payload = {
      month: selectedMonth,
      year: selectedYear,
      workingdayscount: parseInt(workingDays),
    };

    setLoading(true); // Show loader
    try {
      const response = await fetch(
        "http://localhost:8599/v1/hris/payroll/calculate-payroll",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok && result.message === "Payroll generated successfully.") {
        setGeneratedEmployees(result.generatedEmployees); // Save employee data
        setPopupMessage(result.message);
        setPopupType("success");
      } else {
        setPopupMessage("Failed to generate payroll. Please try again.");
        setPopupType("error");
      }
      setShowPopup(true);
    } catch (error) {
      console.error("Error generating payroll:", error);
      setPopupMessage("An error occurred. Please try again.");
      setPopupType("error");
      setShowPopup(true);
    } finally {
      setLoading(false); // Hide loader
    }
  };

  const handleEmployeeDetails = async (
    employee_no,
    employee_fullname,
    employee_email
  ) => {
    setSelectedEmployee({ employee_no, employee_fullname, employee_email });

    try {
      const response = await fetch(
        `http://localhost:8599/v1/hris/payroll/calculatepayrollbyemployee?employee_no=${employee_no}&month=${selectedMonth}&year=${selectedYear}`
      );
      const result = await response.json();

      if (response.ok) {
        setEmployeePayroll(result);
        setShowModal(true);
      } else {
        setPopupMessage("Failed to fetch employee details. Please try again.");
        setPopupType("error");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      setPopupMessage("An error occurred. Please try again.");
      setPopupType("error");
      setShowPopup(true);
    } finally {
    }
  };

  const handleExportPDF = async () => {
    if (!modalRef.current) return;

    const canvas = await html2canvas(modalRef.current, {
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Employee_Salary_Breakdown.pdf");
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <div className="mx-auto mt-5 font-montserrat">
      <p className="text-[24px]">Payroll Navigation / Month end payroll</p>
      <div className="flex items-center gap-5 mb-8">
        <div>
          <select
            className="w-[300px] border border-gray-600 p-2 rounded-lg bg-white"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="" disabled>
              Select Year
            </option>
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <select
            className="w-[300px] border border-gray-600 p-2 rounded-lg bg-white"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="" disabled>
              Select Month
            </option>
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
            ].map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <input
          className="w-[300px] border border-gray-600 p-2 rounded-lg bg-white"
          placeholder="Add Working Days"
          value={workingDays}
          onChange={(e) => setWorkingDays(e.target.value)}
        />
        <div>
          <button
            className="z-1000 bg-blue-400 p-2 rounded-lg text-white cursor-pointer"
            onClick={handleGeneratePayroll}
          >
            Generate
          </button>
        </div>
      </div>

      <div className="shadow-lg p-5 rounded-lg w-[65%]">
        <div className="mt-5">
          <div className="table-container">
            <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-900">ID</th>
                  <th className="px-6 py-4 font-medium text-gray-900">
                    Employee
                  </th>
                  <th className="px-6 py-4 font-medium text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 border-t border-gray-200">
                {generatedEmployees.length > 0 ? (
                  generatedEmployees.map((employee) => (
                    <tr key={employee.employee_no}>
                      <td className="px-6 py-4">{employee.employee_no}</td>
                      <td className="px-6 py-4">
                        {employee.employee_fullname}
                      </td>
                      <td className="px-6 py-4">
                        <MdOutlineRemoveRedEye
                          className="font-bold text-xl cursor-pointer"
                          onClick={() =>
                            handleEmployeeDetails(
                              employee.employee_no,
                              employee.employee_fullname,
                              employee.employee_email
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No data available. Please generate payroll.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg flex items-center justify-center">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p className="ml-4">Loading...</p>
          </div>
        </div>
      )}

      {showModal && employeePayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white rounded-lg p-5 w-[1200px] h-[80%] overflow-auto"
            ref={modalRef}
          >
            <div className="flex justify-end">
              <AiOutlineClose
                className="cursor-pointer text-2xl"
                onClick={handleClose}
              />
            </div>
            <div>
              <div className="flex justify-center">
                <h2 className="text-xl">Employee Salary Breakdown</h2>
              </div>
            </div>
            <div className="flex items-center mt-10">
              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                {selectedEmployee?.employee_fullname
                  ?.split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {selectedEmployee?.employee_fullname || "N/A"}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedEmployee?.employee_email || "N/A"}
                </div>
              </div>
            </div>
            {/* Export buttons */}
            <div className="flex items-center gap-5 justify-end mt-5">
              <button
                className="bg-blue-200 text-blue-400 p-2 rounded-lg"
                onClick={handleExportPDF}
              >
                Export PDF
              </button>
            </div>
            {/* Payroll Details */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="border border-gray-300 p-3 rounded-xl shadow-lg">
                <div className="mb-3">
                  <h3 className="font-semibold text-green-600 bg-green-200 w-[30%] p-2 rounded-lg">
                    Payroll Allowance
                  </h3>
                </div>
                {employeePayroll.allowances.length > 0 ? (
                  <div className="grid grid-cols-2 grid-flow-row gap-4">
                    {employeePayroll.allowances.map((allowance, index) => (
                      <React.Fragment key={index}>
                        <div>
                          <label>Component Name</label>
                          <input
                            className="border border-gray-600 p-2 rounded-lg"
                            value={allowance.suggested_name || "N/A"}
                            readOnly
                          />
                        </div>
                        <div>
                          <label>Amount</label>
                          <input
                            className="border border-gray-600 p-2 rounded-lg"
                            value={`${symbol} ${allowance.value || 0}`}
                            readOnly
                          />
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">
                    No allowances available
                  </p>
                )}
                <div className="mt-3 font-semibold text-[20px] flex justify-between">
                  <p>Total Allowance</p>
                  <p>
                    : {`${symbol} ${employeePayroll.payroll.total_allowances}`}
                  </p>
                </div>
              </div>

              <div className="border border-gray-300 p-3 rounded-xl shadow-lg">
                <div className="mb-3">
                  <h3 className="font-semibold text-red-600 bg-red-200 w-[35%] p-2 rounded-lg">
                    Payroll Deduction
                  </h3>
                </div>
                {employeePayroll.deductions.length > 0 ? (
                  <div className="grid grid-cols-2 grid-flow-row gap-4">
                    {employeePayroll.deductions.map((deduction, index) => (
                      <React.Fragment key={index}>
                        <div>
                          <label>Component Name</label>
                          <input
                            className="border border-gray-600 p-2 rounded-lg"
                            value={deduction.suggested_name || "N/A"}
                            readOnly
                          />
                        </div>
                        <div>
                          <label>Amount</label>
                          <input
                            className="border border-gray-600 p-2 rounded-lg"
                            value={`${symbol} ${deduction.value || 0}`}
                            readOnly
                          />
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">
                    No deductions available
                  </p>
                )}
                <div className="mt-3 font-semibold text-[20px] flex justify-between">
                  <p>Total Deduction</p>
                  <p>
                    : {`${symbol} ${employeePayroll.payroll.total_deductions}`}
                  </p>
                </div>
              </div>
            </div>
            {/* Summary Section */}
            <div className="flex justify-end mt-5">
              <div className="p-5 rounded-lg shadow-lg bg-white w-[350px]">
                <div className="text-gray-600 flex justify-between">
                  <span>Basic Salary:</span>
                  <span className="text-gray-500">
                    {`${symbol} ${employeePayroll.payroll.basic_salary}`}
                  </span>
                </div>
                <div className="text-gray-600 flex justify-between mt-2">
                  <span>Total Allowance:</span>
                  <span className="text-green-600 font-bold">
                    {`${symbol} ${employeePayroll.payroll.total_allowances}`}
                  </span>
                </div>
                <div className="text-gray-600 flex justify-between mt-2">
                  <span>Total Deduction:</span>
                  <span className="text-red-600 font-bold">
                    {`${symbol} ${employeePayroll.payroll.total_deductions}`}
                  </span>
                </div>
                <div className="text-black flex justify-between font-bold text-lg mt-3 border-t pt-3">
                  <span>Net Salary:</span>
                  <span>{`${symbol} ${employeePayroll.payroll.net_salary}`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
                  ?.split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {selectedEmployee?.employee_fullname || "N/A"}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedEmployee?.employee_email || "N/A"}
                </div>
              </div>
            </div>
            {/* Export buttons */}
            <div className="flex items-center gap-5 justify-end mt-5">
              <button
                className="bg-blue-200 text-blue-400 p-2 rounded-lg"
                onClick={handleExportPDF}
              >
                Export PDF
              </button>
            </div>
            {/* Payroll Details */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="border border-gray-300 p-3 rounded-xl shadow-lg">
                <div className="mb-3">
                  <h3 className="font-semibold text-green-600 bg-green-200 w-[35%] p-2 rounded-lg">
                    Payroll Allowance
                  </h3>
                </div>
                <div className="grid grid-cols-2 grid-flow-row gap-4">
                  {employeePayroll.allowances.map((allowance, index) => (
                    <React.Fragment key={index}>
                      <div>
                        <label>Component Name</label>
                        <input
                          className="border border-gray-600 p-2 rounded-lg"
                          value={allowance.suggested_name}
                          readOnly
                        />
                      </div>
                      <div>
                        <label>Amount</label>
                        <input
                          className="border border-gray-600 p-2 rounded-lg"
                          value={`${symbol} ${allowance.value}`}
                          readOnly
                        />
                      </div>
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-3 font-semibold text-[20px] flex justify-between">
                  <p>Total Allowance</p>
                  <p>
                    : {`${symbol} ${employeePayroll.payroll.total_allowances}`}
                  </p>{" "}
                </div>
              </div>

              <div className="border border-gray-300 p-3 rounded-xl shadow-lg">
                <div className="mb-3">
                  <h3 className="font-semibold text-red-600 bg-red-200 w-[35%] p-2 rounded-lg">
                    Payroll Deduction
                  </h3>
                </div>
                <div className="grid grid-cols-2 grid-flow-row gap-4">
                  {employeePayroll.deductions.map((deduction, index) => (
                    <React.Fragment key={index}>
                      <div>
                        <label>Component Name</label>
                        <input
                          className="border border-gray-600 p-2 rounded-lg"
                          value={deduction.suggested_name}
                          readOnly
                        />
                      </div>
                      <div>
                        <label>Amount</label>
                        <input
                          className="border border-gray-600 p-2 rounded-lg"
                          value={`${symbol} ${deduction.value}`}
                          readOnly
                        />
                      </div>
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-3 font-semibold text-[20px] flex justify-between">
                  <p>Total Deduction</p>
                  <p>: {employeePayroll.payroll.total_deductions}</p>
                </div>
              </div>
            </div>
            {/* Summary Section */}
            {/* Summary Section */}
            <div className="flex justify-end mt-5">
              <div className="p-5 rounded-lg shadow-lg bg-white w-[350px]">
                <div className="text-gray-600 flex justify-between">
                  <span>Basic Salary:</span>
                  <span className="text-gray-500">
                    {`${symbol} ${employeePayroll.payroll.basic_salary}`}
                  </span>
                </div>
                <div className="text-gray-600 flex justify-between mt-2">
                  <span>Total Allowance:</span>
                  <span className="text-green-600 font-bold">
                    {`${symbol} ${employeePayroll.payroll.total_allowances}`}
                  </span>
                </div>
                <div className="text-gray-600 flex justify-between mt-2">
                  <span>Total Deduction:</span>
                  <span className="text-red-600 font-bold">
                   - {`${symbol} ${employeePayroll.payroll.total_deductions}`}
                  </span>
                </div>
                <div className="text-gray-600 flex justify-between mt-2">
                  <span>Gross Pay:</span>
                  <span className="text-gray-500">
                    {`${symbol} ${employeePayroll.payroll.gross_pay}`}
                  </span>
                </div>
                <div className="text-gray-600 flex justify-between mt-2">
                  <span>Calculated No Pay:</span>
                  <span className="text-gray-500">
                    {`${symbol} ${employeePayroll.payroll.calculated_nopay}`}
                  </span>
                </div>
                <div className="text-gray-600 flex justify-between mt-2">
                  <span>EPF:</span>
                  <span className="text-red-600">
                    -{`${symbol} ${employeePayroll.payroll.epf}`}
                  </span>
                </div>
                <div className="text-gray-600 flex justify-between mt-2">
                  <span>Net Salary:</span>
                  <span className="text-black font-bold">
                    {`${symbol} ${employeePayroll.payroll.net_salary}`}
                  </span>
                </div>

                <div className="text-gray-600 flex justify-between mt-2">
                  <span>ETF:</span>
                  <span className="text-red-600">
                    {`${symbol} ${employeePayroll.payroll.etf}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3 relative">
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              &times;
            </button>

            <h2
              className={`text-center text-xl font-bold mb-4 ${
                popupType === "error" ? "text-red-500" : "text-green-500"
              }`}
            >
              {popupType === "error" ? "Error" : "Success"}
            </h2>
            <p className="text-center mb-4">{popupMessage}</p>
            <div className="flex justify-center">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={closePopup}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthEndPayroll;
