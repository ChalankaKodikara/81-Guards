import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const Deduction_Component = () => {
  // State variables for employee data and pagination
  const [employeeData, setEmployeeData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of rows per page
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success"); // "success" or "error"
  const [showPopupMessage, setShowPopupMessage] = useState(false);

  const [employeeNoFilter, setEmployeeNoFilter] = useState("");
  const [employeeNameFilter, setEmployeeNameFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // State variables for popup and forms
  const [showPopup, setShowPopup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For loading indicator
  const [currency, setCurrency] = useState(Cookies.get("currency") || "USD");
  const [symbol, setSymbol] = useState(Cookies.get("symbol") || "$");
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  const location = useLocation();
  const columnName = location.state?.actual_column_name || "Component Name A";
  const suggestedName = location.state?.suggested_name || "Unknown Component";
  const type = location.state?.type || "Amount";
  useEffect(() => {
    setCurrency(Cookies.get("currency") || "USD");
    setSymbol(Cookies.get("symbol") || "$");
  }, []);

  const fetchEmployeeData = async () => {
    if (!columnName) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        actual_column_name: columnName,
      });

      if (employeeNoFilter.trim()) {
        params.append("employee_no", employeeNoFilter.trim());
      }
      if (employeeNameFilter.trim()) {
        params.append("employee_name", employeeNameFilter.trim());
      }

      const response = await fetch(
        `${API_URL}/v1/hris/payroll/deduction-status?${params}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const employees = data.employees.map((emp, index) => ({
        id: emp.employee_id || index + 1, // Ensure a unique ID
        employee_no: emp.employee_no,
        name: emp.employee_calling_name,
        email: emp.employee_email,
        availability: emp.availability === "Yes" ? "Available" : "Unavailable",
      }));

      setEmployeeData(employees);
      setFilteredData(employees); // Initialize filtered data
    } catch (error) {
      console.error("Error fetching employee data:", error);

      // Show error popup
      setPopupMessage("Failed to fetch employee data. Please try again.");
      setPopupType("error");
      setShowPopupMessage(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount and when search parameters change
  useEffect(() => {
    fetchEmployeeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnName, employeeNoFilter, employeeNameFilter]);

  // Handler functions for search inputs
  const handleEmployeeNoChange = (e) => setEmployeeNoFilter(e.target.value);
  const handleEmployeeNameChange = (e) => setEmployeeNameFilter(e.target.value);

  // Handler function for search button
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchEmployeeData();
  };

  // Apply filtering
  useEffect(() => {
    let data = employeeData;

    if (employeeNoFilter.trim()) {
      data = data.filter((emp) =>
        emp.employee_no
          .toLowerCase()
          .includes(employeeNoFilter.trim().toLowerCase())
      );
    }

    if (employeeNameFilter.trim()) {
      data = data.filter((emp) =>
        emp.name.toLowerCase().includes(employeeNameFilter.trim().toLowerCase())
      );
    }

    setFilteredData(data);
    setCurrentPage(1); // Reset to first page when filters change
  }, [employeeNoFilter, employeeNameFilter, employeeData]);

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

  // Close popup and reset states
  const closePopup = () => {
    setShowPopup(false);
    setSelectedEmployee(null);
    setAmount("");
    setRate("");
    setShowDeleteConfirm(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const value = parseFloat(amount);
      if (type === "Amount" && isNaN(value)) {
        setPopupMessage("Invalid amount value.");
        setPopupType("error");
        setShowPopupMessage(true);
        setIsSaving(false);
        return;
      }

      const payloadValue = type === "Rate" ? parseFloat(rate) : value;
      if (type === "Rate" && isNaN(payloadValue)) {
        setPopupMessage("Invalid rate value.");
        setPopupType("error");
        setShowPopupMessage(true);
        setIsSaving(false);
        return;
      }

      const payload = {
        employee_no: selectedEmployee.employee_no,
        actual_column_name: columnName,
        value: payloadValue,
      };

      const response = await fetch(
        `${API_URL}/v1/hris/payroll/adddeductiontoemployee`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchEmployeeData(); // Refresh data

      // Show success popup
      setPopupMessage("Deduction assigned successfully!");
      setPopupType("success");
      setShowPopupMessage(true);
      closePopup();
    } catch (error) {
      console.error("Error saving deduction:", error);

      // Show error popup
      setPopupMessage("Failed to save deduction. Please try again.");
      setPopupType("error");
      setShowPopupMessage(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Update
  const handleUpdate = async () => {
    try {
      setIsSaving(true);
      const value = parseFloat(amount);
      if (isNaN(value)) {
        setIsSaving(false);
        return;
      }

      const payload = {
        employee_no: selectedEmployee.employee_no,
        actual_column_name: columnName,
        amount: value,
      };

      const response = await fetch(
        `${API_URL}/v1/hris/payroll/updatedeductiontoemployee`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchEmployeeData(); // Refresh data
      closePopup();
    } catch (error) {
      console.error("Error updating allowance:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Show the delete confirmation popup
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  // Confirm deletion: make a PUT request with amount: 0.00
  const handleConfirmDelete = async () => {
    try {
      setIsSaving(true);

      const payload = {
        employee_no: selectedEmployee.employee_no,
        actual_column_name: columnName,
        amount: 0.0,
      };

      const response = await fetch(
        `${API_URL}/v1/hris/payroll/updatedeductiontoemployee`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchEmployeeData(); // Refresh data
      closePopup();
    } catch (error) {
      console.error("Error deleting allowance:", error);
    } finally {
      setIsSaving(false);
    }
  };
  const handleRowClick = async (employee) => {
    try {
      setIsLoading(true); // Indicate loading state

      // If availability is "Yes", fetch the value
      let fetchedValue = 0.0;
      if (employee.availability === "Available") {
        const params = new URLSearchParams({
          employee_no: employee.employee_no,
          actual_column_name: columnName,
          type: "deduction", // Pass "allowance" or "deduction"
        });

        const response = await fetch(
          `${API_URL}/v1/hris/payroll/value?${params}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch value: ${response.statusText}`);
        }

        const data = await response.json();
        fetchedValue = data.value || 0.0; // Default to 0.0 if value is null
      }

      // Set the selected employee and populate the fields
      setSelectedEmployee(employee);
      setAmount(type === "Amount" ? fetchedValue : ""); // Show value in Amount field
      setRate(type === "Rate" ? fetchedValue : ""); // Show value in Rate field
      setShowPopup(true);
    } catch (error) {
      console.error("Error fetching value:", error);
      alert("Failed to fetch value. Please try again.");
    } finally {
      setIsLoading(false); // Remove loading state
    }
  };
  return (
    <div className="mx-5 mt-5 font-montserrat">
      <p className="text-[24px] mb-5">
        Payroll Navigation / Payroll Allowance / {suggestedName}
      </p>
      <div className="shadow-lg p-5 rounded-lg  bg-white w-[65%]">
        <p className="text-[24px] mb-4">Search Employee to Assign Value</p>

        {/* Search Fields */}
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
              onChange={handleEmployeeNoChange}
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
              onChange={handleEmployeeNameChange}
            />
          </div>
          <div className="flex items-end">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5">
          <div className="table-container">
            <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-900">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-900">
                    Employee
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-900">
                    Availability
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td className="px-6 py-4" colSpan={3}>
                      Loading...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4" colSpan={3}>
                      No records found.
                    </td>
                  </tr>
                ) : (
                  currentData.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleRowClick(employee)}
                    >
                      <td className="px-6 py-4">EMP00{employee.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                            {employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.name}
                            </div>
                            {employee.email && (
                              <div className="text-sm text-gray-500">
                                {employee.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {employee.availability === "Available" ? (
                          <span className="bg-red-100 text-green-700 px-3 py-1 rounded-full text-sm">
                            {suggestedName}
                          </span>
                        ) : (
                          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                            No Available Component
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <button
            className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-gray-300"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <p>
            Page {currentPage} of {totalPages}
          </p>
          <button
            className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-gray-300"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Main Popup */}
      {showPopup && selectedEmployee && !showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3 relative">
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-500 text-xl"
              disabled={isSaving}
            >
              &times;
            </button>

            {/* Header */}
            <div className="flex justify-center mb-4">
              {selectedEmployee.availability === "Unavailable" ? (
                <h2 className="text-xl font-bold">Assign Component</h2>
              ) : (
                <h2 className="text-xl font-bold">Change & Delete Component</h2>
              )}
            </div>

            {/* Employee Info */}
            <div className="flex items-center mb-2">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                {selectedEmployee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {selectedEmployee.name}
                </div>
                {selectedEmployee.email && (
                  <div className="text-sm text-gray-500">
                    {selectedEmployee.email}
                  </div>
                )}
              </div>
            </div>

            {/* Existing Components */}
            <p className="mb-2 flex items-center">
              Existing Components:&nbsp;
              {selectedEmployee.availability === "Unavailable" ? (
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                  No Available Component
                </span>
              ) : (
                <span className="bg-red-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  {suggestedName}
                </span>
              )}
            </p>

            {/* Component Name (Read-Only Field) */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Component Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={suggestedName}
                readOnly
              />
            </div>

            {/* Amount and Rate Fields */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    className="border border-gray-300 rounded-l px-3 py-2 w-full"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={type === "Rate"}
                  />
                  <span className="border border-gray-300 rounded-r px-3 py-2 bg-gray-50">
                    {symbol}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    className="border border-gray-300 rounded-l px-3 py-2 w-full"
                    placeholder="0.00"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    disabled={type === "Amount"}
                  />
                  <span className="border border-gray-300 rounded-r px-3 py-2 bg-gray-50">
                    %
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-500 text-sm mb-4">
              After you assign, a salary component value will be added to the
              employee.
            </p>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              {selectedEmployee.availability === "Unavailable" ? (
                <>
                  {/* Assign scenario */}
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    onClick={closePopup}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <>
                  {/* Change & Delete scenario */}
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    onClick={closePopup}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-100"
                    onClick={handleDeleteClick}
                    disabled={isSaving}
                  >
                    Delete
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handleUpdate}
                    disabled={isSaving}
                  >
                    {isSaving ? "Updating..." : "Update"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {showPopupMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowPopupMessage(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              &times;
            </button>

            {/* Popup Header */}
            <h2
              className={`text-center text-xl font-bold mb-4 ${
                popupType === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
              {popupType === "success" ? "Success" : "Error"}
            </h2>

            {/* Message */}
            <p className="text-center mb-4">{popupMessage}</p>

            {/* Close Button */}
            <div className="flex justify-center">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setShowPopupMessage(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showPopup && showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3 relative">
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-500 text-xl"
              disabled={isSaving}
            >
              &times;
            </button>

            <h2 className="text-center text-xl font-bold mb-4">Delete?</h2>
            <p className="text-center mb-4">
              Do you want to delete the component:{" "}
              <span className="text-blue-500">{suggestedName}</span>
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={closePopup}
                disabled={isSaving}
              >
                No
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleConfirmDelete}
                disabled={isSaving}
              >
                {isSaving ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deduction_Component;
