/** @format */

import React, { useEffect, useState } from "react";
import Navbar from "../navbar/navbar";
import moment from "moment";
import Papa from "papaparse"; // Import Papaparse
import usePermissions from "../../permissions/permission";

const Designation = () => {
  const [currentTime, setCurrentTime] = useState(moment().format("h:mm:ss a"));
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]); // State for department dropdown options
  const [designations, setDesignations] = useState([]); // State for designation dropdown options
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State for popup visibility
  const [isEditMode, setIsEditMode] = useState(false); // State for edit mode
  const [currentDesignation, setCurrentDesignation] = useState({}); // State for current designation being edited
  const [itemsPerPage] = useState(15); // Set items per page to 15
  const [currentPage, setCurrentPage] = useState(1);
  const [searchId, setSearchId] = useState("");
  const [date, setDate] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(""); // State for department filter
  const [designationFilter, setDesignationFilter] = useState(""); // State for designation filter
  const { hasPermission } = usePermissions();
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success"); // "success" or "error"
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format("h:mm:ss a"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = () => {
    fetch(`${API_URL}/v1/hris/designations/getdesignation`)
      .then((response) => response.json())
      .then((result) => {
        if (Array.isArray(result)) {
          setData(result);
          extractDropdownData(result); // Extract departments and designations
        } else {
          console.error("Expected an array but got:", result);
          setData([]);
          setPopupMessage("Failed to fetch designations.");
          setPopupType("error");
          setShowPopup(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setData([]);
        setPopupMessage("An error occurred while fetching designations.");
        setPopupType("error");
        setShowPopup(true);
      });
  };

  const extractDropdownData = (data) => {
    // Extract unique departments
    const uniqueDepartments = [...new Set(data.map((item) => item.department))];
    setDepartments(uniqueDepartments);

    // Extract unique designations
    const uniqueDesignations = [
      ...new Set(data.map((item) => item.designation)),
    ];
    setDesignations(uniqueDesignations);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newDesignation = {
      department: e.target.department.value,
      designation: e.target.designation.value,
    };

    const url = isEditMode
      ? `${API_URL}/v1/hris/designations/updatedesignation?id=${currentDesignation.id}`
      : `${API_URL}/v1/hris/designations/adddesignation`;

    const method = isEditMode ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newDesignation),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        if (isEditMode) {
          setData((prevData) =>
            prevData.map((item) =>
              item.id === currentDesignation.id
                ? { ...item, ...newDesignation }
                : item
            )
          );
        } else {
          setData((prevData) => [...prevData, data]);
        }
        fetchDesignations();
        togglePopup();

        // Success Popup
        setPopupMessage(
          isEditMode
            ? "Designation updated successfully!"
            : "Designation added successfully!"
        );
        setPopupType("success");
        setShowPopup(true);
      })
      .catch((error) => {
        console.error("Error adding/updating designation:", error.message);
        setPopupMessage("An error occurred. Please try again.");
        setPopupType("error");
        setShowPopup(true);
      });
  };

  const handleEdit = (id) => {
    const designationToEdit = data.find((item) => item.id === id);
    setCurrentDesignation(designationToEdit);
    setIsEditMode(true); // Enable edit mode
    togglePopup(); // Open popup
  };

  const handleSearch = (e) => {
    setSearchId(e.target.value);
    console.log("Searching by ID:", e.target.value);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
    console.log("Filtering by date:", e.target.value);
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(data);
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    link.download = "designation_data.csv";
    link.click();
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen); // Toggle popup visibility
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this designation?"
    );
    if (confirmDelete) {
      fetch(`${API_URL}/v1/hris/designations/deletedesignation?id=${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            fetchDesignations();
            setPopupMessage("Designation deleted successfully!");
            setPopupType("success");
            setShowPopup(true);
          } else {
            throw new Error("Failed to delete designation");
          }
        })
        .catch((error) => {
          console.error("Error deleting designation:", error);
          setPopupMessage("An error occurred. Please try again.");
          setPopupType("error");
          setShowPopup(true);
        });
    }
  };

  // Apply filters to data
  const filteredData = data.filter((item) => {
    const matchesDepartment = departmentFilter
      ? item.department === departmentFilter
      : true;
    const matchesDesignation = designationFilter
      ? item.designation === designationFilter
      : true;
    return matchesDepartment && matchesDesignation;
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mt-6">
        <p className="text-[30px] font-semibold">Departments & Designation</p>
        <p className="text-[20px]">{currentTime}</p>
      </div>

      <div className="mt-5">
        <button
          className="px-5 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 w-60"
          onClick={() => {
            setIsEditMode(false); // Disable edit mode
            setCurrentDesignation({}); // Clear current designation
            togglePopup(); // Open popup
          }}
        >
          Create Designation
        </button>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-500 opacity-50"></div>
          <div className="relative bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {isEditMode
                ? "Edit Department & Designation"
                : "Create Department & Designation"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-5">
                <div className="mb-4">
                  <label className="block text-gray-700">Department</label>
                  <input
                    type="text"
                    name="department"
                    defaultValue={currentDesignation.department || ""}
                    className="mt-1 block w-full border border-black rounded-md shadow-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    defaultValue={currentDesignation.designation || ""}
                    className="mt-1 block w-full border border-black rounded-md shadow-sm"
                    required
                  />
                </div>
                <div className="flex gap-5 justify-start">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
                  >
                    {isEditMode ? "Update" : "Save"}
                  </button>
                  <button
                    type="button"
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                    onClick={togglePopup} // Close the popup
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="container flex justify-between items-center mt-8">
        <div className="flex gap-4">
          <div className="department-filter">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className="designation-filter">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
            >
              <option value="">All Designations</option>
              {designations.map((desig, index) => (
                <option key={index} value={desig}>
                  {desig}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="export-button">
          <button
            className=" text-black px-4 py-2 rounded-md shadow-custom"
            onClick={handleExportCSV}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-5">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                Designation
              </th>
              <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {item.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {item.designation}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  <button
                    onClick={() => handleEdit(item.id)} // Using the id field here
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)} // Using the id field here
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

        <div className="flex justify-between items-center mt-4">
          <button
            className="px-3 py-1 bg-gray-300 rounded"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 bg-gray-300 rounded"
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

export default Designation;
