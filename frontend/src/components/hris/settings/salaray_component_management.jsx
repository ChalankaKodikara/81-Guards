/** @format */

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

const SalaryComponentManagement = () => {
  const [tableData, setTableData] = useState([]);
  const [currencyData, setCurrencyData] = useState([]);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isAddCurrencyPopupOpenn, setIsAddCurrencyPopupOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(""); // "Allowance" or "Deduction"
  const [suggestedName, setSuggestedName] = useState(""); // Component Name
  const [valueType, setValueType] = useState(""); // "Amount" or "Rate"
  const [actualColumnName, setActualColumnName] = useState(""); // From GET response
  const [isSaving, setIsSaving] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success"); // "success" or "error"
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("");

  const API_URL = process.env.REACT_APP_FRONTEND_URL;

  console.log("selected cureency", selectedCurrency);

  const toggleAddPopup = () => setIsAddPopupOpen(!isAddPopupOpen);
  const toggleAddCurrencyPopup = () =>
    setIsAddCurrencyPopupOpen(!isAddCurrencyPopupOpenn);

  // Fetch table data
  const fetchTableData = async () => {
    try {
      const response = await fetch(
        "http://localhost:8599/v1/hris/payroll/columns"
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error("Error fetching table data:", error.message);

      // Error Popup
      setPopupMessage("Failed to fetch salary components. Please try again.");
      setPopupType("error");
      setShowPopup(true);
    }
  };

  const fetchCurrencyData = async () => {
    try {
      const response = await fetch(
        "http://localhost:8599/v1/hris/currency/list"
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setCurrencyData(data.data);
    } catch (error) {
      console.error("Error fetching table data:", error.message);

      // Error Popup
      setPopupMessage("Failed to fetch Cuurency components. Please try again.");
      setPopupType("error");
      setShowPopup(true);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTableData();
    fetchCurrencyData();
  }, []);

  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
  };

  // Handle Type Change and Trigger GET Request
  const handleTypeChange = async (event) => {
    const selectedValue = event.target.value;
    setSelectedType(selectedValue);

    try {
      const response = await fetch(
        `http://localhost:8599/v1/hris/payroll/getRemainingColumns?type=${selectedValue.toLowerCase()}`
      );
      if (!response.ok)
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setActualColumnName(data.next_column); // Extract and set actual_column_name
    } catch (error) {
      console.error("Error fetching actual column name:", error.message);
    }
  };

  const handleSave = async () => {
    const payload = {
      suggested_name: suggestedName.trim(),
      actual_column_name: actualColumnName, // Set from GET response
      type: valueType, // From Value Type dropdown
    };

    if (
      !payload.suggested_name ||
      !payload.actual_column_name ||
      !payload.type
    ) {
      setPopupMessage("Please fill all required fields.");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    setIsSaving(true); // Start saving state

    try {
      const response = await fetch(
        "http://localhost:8599/v1/hris/payroll/column-suggestions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Error saving data: ${response.statusText}`);
      }

      // Success Popup
      setPopupMessage("Salary component added successfully!");
      setPopupType("success");
      setShowPopup(true);

      toggleAddPopup(); // Close modal on success
      await fetchTableData(); // Refresh table data
    } catch (error) {
      console.error("Error in POST column-suggestions:", error.message);

      // Error Popup
      setPopupMessage("Failed to add salary component. Please try again.");
      setPopupType("error");
      setShowPopup(true);
    } finally {
      setIsSaving(false); // End saving state
    }
  };

  const handleCurrencySave = async () => {
    if (!selectedCurrency) {
      window.alert("Please select a currency before saving.");
      return;
    }
  
    const selectedCurrencyData = currencyData.find(
      (currency) => currency.symbol === selectedCurrency
    );
  
    if (!selectedCurrencyData) {
      window.alert("Invalid currency selection.");
      return;
    }
  
    const postData = {
      currency: selectedCurrencyData.currency,
      symbol: selectedCurrencyData.symbol,
    };
  
    try {
      setIsSaving(true); // Show saving state
  
      const response = await fetch(`${API_URL}/v1/hris/currency/update/1`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
  
      if (response.ok) {
        // Update Cookies
        Cookies.set("currency", postData.currency);
        Cookies.set("symbol", postData.symbol);
  
        // Show Success Popup
        setPopupMessage("Currency updated successfully!");
        setPopupType("success");
        setShowPopup(true);
  
        toggleAddCurrencyPopup(); // Close currency popup
      } else {
        const errorText = await response.text();
        setPopupMessage(`Failed to update currency: ${errorText}`);
        setPopupType("error");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error saving currency:", error);
      setPopupMessage("Failed to update currency. Please try again.");
      setPopupType("error");
      setShowPopup(true);
    } finally {
      setIsSaving(false); // Reset saving state
    }
  };
  

  return (
    <div className="mx-5 mt-5 font-montserrat">
      <div>
        <p className="text-[24px] font-semibold">Salary Component Management</p>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 text-[#2495FE] border border-[#2495FE] bg-opacity-55 rounded-lg flex justify-end mb-2 mr-2"
            onClick={toggleAddCurrencyPopup}
          >
            <span>Change Currency</span>
          </button>
          <button
            className="px-4 py-2 text-[#2495FE] border border-[#2495FE] bg-opacity-55 rounded-lg flex justify-end mb-2"
            onClick={toggleAddPopup}
          >
            <span>Add Salary Component</span>
          </button>
        </div>

        <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-900">NO</th>
              <th className="px-6 py-4 font-medium text-gray-900">
                Component Name
              </th>
              <th className="px-6 py-4 font-medium text-gray-900">
                Component Type
              </th>
              <th className="px-6 py-4 font-medium text-gray-900">
                Value Type
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 border-t border-gray-200">
            {tableData.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4">{item.suggested_name}</td>
                <td className="px-6 py-4">
                  {item.actual_column_name.startsWith("allowance")
                    ? "Allowance"
                    : item.actual_column_name.startsWith("deduction")
                    ? "Deduction"
                    : "Unknown"}
                </td>
                <td className="px-6 py-4">{item.type}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px] relative">
            {/* Close Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              &times;
            </button>

            {/* Header */}
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
                onClick={() => setShowPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-10 w-[550px]">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Add Salary Component
            </h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Component Name*
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter component name"
                  value={suggestedName}
                  onChange={(e) => setSuggestedName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Component Type*
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  onChange={handleTypeChange}
                >
                  <option value="">Select the Type</option>
                  <option value="Allowance">Allowance</option>
                  <option value="Deduction">Deduction</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Value Type*
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  onChange={(e) => setValueType(e.target.value)}
                >
                  <option value="">Select the Value Type</option>
                  <option value="Amount">Amount</option>
                  <option value="Rate">Rate</option>
                </select>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  onClick={toggleAddPopup}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  onClick={handleSave}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{isAddCurrencyPopupOpenn && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-10 w-[550px]">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Add Currency Component
      </h2>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Currency*
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg"
            value={selectedCurrency || Cookies.get("symbol") || ""}
            onChange={handleCurrencyChange}
          >
            {currencyData.length > 0 ? (
              currencyData.map((currency) => (
                <option key={currency.symbol} value={currency.symbol}>
                  {currency.currency} - {currency.symbol}
                </option>
              ))
            ) : (
              <option disabled>No Currency types</option>
            )}
          </select>
        </div>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded-lg"
            onClick={toggleAddCurrencyPopup}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={handleCurrencySave}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}


    </div>
  );
};

export default SalaryComponentManagement;
