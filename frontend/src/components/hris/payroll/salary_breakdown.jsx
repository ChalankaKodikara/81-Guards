import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { AiOutlineClose } from "react-icons/ai";
import Cookies from "js-cookie";

const SalaryBreakdown = () => {
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const [components, setComponents] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [employeePayroll, setEmployeePayroll] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  const [currency, setCurrency] = useState(Cookies.get("currency") || "USD");
  const [symbol, setSymbol] = useState(Cookies.get("symbol") || "$");

  useEffect(() => {
    setCurrency(Cookies.get("currency") || "USD");
    setSymbol(Cookies.get("symbol") || "$");
  }, []);

  useEffect(() => {
    // Fetch Employees
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          `${API_URL}/v1/hris/payroll/getallwithname`
        );
        if (!response.ok) {
          throw new Error("Error fetching employee data");
        }
        const data = await response.json();
        setEmployees(data || []);
        setFilteredData(data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchEmployees();
  }, [API_URL]);

  useEffect(() => {
    // Fetch Components
    const fetchComponents = async () => {
      try {
        const response = await fetch(`${API_URL}/v1/hris/payroll/columns`);
        if (!response.ok) {
          throw new Error("Failed to fetch components");
        }
        const data = await response.json();
        const options = data.map((comp) => ({
          value: comp.suggested_name,
          label: comp.suggested_name,
        }));
        setComponents(options);
      } catch (error) {
        console.error("Error fetching components:", error);
      }
    };

    fetchComponents();
  }, [API_URL]);

  // Filter Employees
  useEffect(() => {
    const filtered = employees.filter((employee) => {
      const matchesId = searchId
        ? employee.employee_no.includes(searchId)
        : true;
      const matchesName = searchName
        ? employee.employee_fullname
            .toLowerCase()
            .includes(searchName.toLowerCase())
        : true;
      const matchesComponent = selectedComponents.length
        ? selectedComponents.some((component) =>
            (employee.allowances || [])
              .filter((allowance) => allowance)
              .concat(
                (employee.deductions || []).filter((deduction) => deduction)
              )
              .some((comp) => comp.suggested_name === component.value)
          )
        : true;

      return matchesId && matchesName && matchesComponent;
    });

    setFilteredData(filtered);
  }, [searchId, searchName, selectedComponents, employees]);

  const handleEmployeeDetails = async (employee_no) => {
    const selected = employees.find((emp) => emp.employee_no === employee_no);
    if (!selected) {
      alert("Employee not found!");
      return;
    }

    setSelectedEmployee(selected);
    try {
      const response = await fetch(
        `${API_URL}/v1/hris/payroll/getallbyemployee?employee_no=${employee_no}`
      );

      if (response.ok) {
        const data = await response.json();
        setEmployeePayroll(data);
        setShowModal(true);
      } else {
        alert("Failed to fetch employee details. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEmployeePayroll(null);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mx-5 mt-5">
      <p className="text-[24px]">Payroll Navigation / Salary Breakdown</p>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Employee ID
          </label>
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Employee ID"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Employee Name
          </label>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Enter Employee Name"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Salary Component
          </label>
          <Select
            options={[{ value: "All", label: "All" }, ...components]}
            isMulti
            value={selectedComponents}
            onChange={setSelectedComponents}
            placeholder="Select Components"
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
      </div>

      {/* Employee Table */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-900">ID</th>
              <th className="px-6 py-4 font-medium text-gray-900">Employee</th>
              <th className="px-6 py-4 font-medium text-gray-900">
                Available Salary Components
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.map((employee) => (
              <tr
                key={employee.employee_no}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleEmployeeDetails(employee.employee_no)}
              >
                <td className="px-6 py-4">{employee.employee_no}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {employee.employee_fullname}
                  </div>
                  <div className="text-xs text-gray-500">
                    {employee.employee_email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {(employee.allowances || [])
                      .filter((allowance) => allowance)
                      .map((allowance, index) => (
                        <span
                          key={`allowance-${index}`}
                          className="px-2 py-1 rounded bg-green-100 text-green-600"
                        >
                          {allowance.suggested_name}
                        </span>
                      ))}
                    {(employee.deductions || [])
                      .filter((deduction) => deduction)
                      .map((deduction, index) => (
                        <span
                          key={`deduction-${index}`}
                          className="px-2 py-1 rounded bg-red-100 text-red-600"
                        >
                          {deduction.suggested_name}
                        </span>
                      ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <p>
          Page {currentPage} of {totalPages}
        </p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {showModal && employeePayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white rounded-lg p-5 w-[1200px] h-[80%] overflow-auto"
            // ref={modalRef}
          >
            <div className="flex justify-end">
              <AiOutlineClose
                className="cursor-pointer text-2xl"
                onClick={handleClose}
              />
            </div>
            <div>
              <div className="flex justify-center">
                <h2 className="text-xl font-bold">Employee Salary Breakdown</h2>
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
            <div className="grid grid-cols-2 gap-8 mt-10">
              <div className="border border-gray-300 p-5 rounded-xl shadow-lg">
                <div className="mb-4">
                  <h3 className="font-semibold text-green-600 bg-green-200 w-fit px-4 py-2 rounded-lg">
                    Payroll Allowance
                  </h3>
                </div>
                <div className="space-y-4">
                  {employeePayroll?.allowances &&
                    Object.values(employeePayroll.allowances).map(
                      (allowance, index) => (
                        <div
                          key={`allowance-${index}`}
                          className="grid grid-cols-2 gap-4"
                        >
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
                      )
                    )}
                </div>
                <div className="mt-4 font-semibold text-lg flex justify-between">
                  <p>Total Allowance</p>
                  <p>
                    : {symbol}
                    {Object.values(employeePayroll.allowances || {}).reduce(
                      (sum, a) => sum + parseFloat(a.value || 0),
                      0
                    )}
                  </p>
                </div>
              </div>
              <div className="border border-gray-300 p-5 rounded-xl shadow-lg">
                <div className="mb-4">
                  <h3 className="font-semibold text-red-600 bg-red-200 w-fit px-4 py-2 rounded-lg">
                    Payroll Deduction
                  </h3>
                </div>
                <div className="space-y-4">
                  {employeePayroll?.deductions &&
                    Object.values(employeePayroll.deductions).map(
                      (deduction, index) => (
                        <div
                          key={`deduction-${index}`}
                          className="grid grid-cols-2 gap-4"
                        >
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
                      )
                    )}
                </div>
                <div className="mt-4 font-semibold text-lg flex justify-between">
                  <p>Total Deduction</p>
                  <p>
                    : {symbol}{" "}
                    {Object.values(employeePayroll.deductions || {}).reduce(
                      (sum, d) => sum + parseFloat(d.value || 0),
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <div className="p-5 rounded-lg shadow-lg bg-white w-[350px]">
                <div className="text-gray-600 flex justify-between">
                  <span>Basic Salary:</span>
                  <span className="text-gray-500">
                    {`${symbol}${employeePayroll?.basic_salary || 0}`}
                  </span>
                </div>
                <div className="text-gray-600 flex justify-between mt-2">
                  <span>Total Allowance:</span>
                  <span className="text-green-600 font-bold">
                    {`${symbol}${Object.values(
                      employeePayroll?.allowances || {}
                    ).reduce(
                      (sum, allowance) =>
                        sum + parseFloat(allowance.value || 0),
                      0
                    )}`}
                  </span>
                </div>
                <div className="text-gray-600 flex justify-between mt-2">
                  <span>Total Deduction:</span>
                  <span className="text-red-600 font-bold">
                    {`${symbol}${Object.values(
                      employeePayroll?.deductions || {}
                    ).reduce(
                      (sum, deduction) =>
                        sum + parseFloat(deduction.value || 0),
                      0
                    )}`}
                  </span>
                </div>
                <div className="text-black flex justify-between font-bold text-lg mt-3 border-t pt-3">
                  <span>Net Salary:</span>
                  <span className="text-black font-bold">
                    {`${symbol}${
                      parseFloat(employeePayroll?.basic_salary || 0) +
                      Object.values(employeePayroll?.allowances || {}).reduce(
                        (sum, allowance) =>
                          sum + parseFloat(allowance.value || 0),
                        0
                      ) -
                      Object.values(employeePayroll?.deductions || {}).reduce(
                        (sum, deduction) =>
                          sum + parseFloat(deduction.value || 0),
                        0
                      )
                    }`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryBreakdown;
