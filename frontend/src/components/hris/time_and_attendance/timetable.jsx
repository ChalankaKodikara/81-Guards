/** @format */

import React, { useState, useEffect } from "react";
import { GrPrevious, GrNext } from "react-icons/gr";
import TimetablePopup from "./timetablepopup";
import Navbar from "../navbar/navbar";
import usePermissions from "../../permissions/permission";

function TimetableManagement() {
  const { hasPermission } = usePermissions();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [timetableData, setTimetableData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [formData, setFormData] = useState({
    timetableName: "",
    startCheckInTime: "",
    endCheckInTime: "",
    startCheckOutTime: "",
    endCheckOutTime: "",
    workingdays: "",
    employees: [],
  });

  const [editTimetableId, setEditTimetableId] = useState(null);
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  useEffect(() => {
    fetch(`${API_URL}/v1/hris/timetable/gettimetable`)
      .then((response) => response.json())
      .then((data) => {
        setTimetableData(Array.isArray(data) ? data : []);
      })
      .catch((error) => console.error("Error fetching timetable data:", error));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/v1/hris/employees/getemployeebasicdetails`)
      .then((response) => response.json())
      .then((data) => {
        setEmployeeData(Array.isArray(data) ? data : []);
      })
      .catch((error) => console.error("Error fetching employee data:", error));
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Filtered data based on the search query for the Timetable Name
  const filteredTimetableData = timetableData.filter((item) =>
    item.TimetableName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentItems = filteredTimetableData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSend = () => {
    setShowSuccessPopup(true);
  };

  const handleEdit = (id) => {
    setEditTimetableId(id);
    setShowEditPopup(true);
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  const handleCloseErrorPopup = () => {
    setShowErrorPopup(false);
  };

  const handleCloseEditPopup = () => {
    setShowEditPopup(false);
    setEditTimetableId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/v1/hris/timetable/addtimetable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        employees: selectedEmployees.map((emp) => emp.employee_no),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        setShowSuccessPopup(false);
        setTimetableData([...timetableData, data]); // Update timetableData with the new entry
      })
      .catch((error) => {
        console.error("Error:", error);
        setShowErrorPopup(true);
      });
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployees((prevState) => [...prevState, employee]);
  };

  const handleDelete = (id) => {
    setShowDeletePopup(true);
    setDeleteItemId(id);
  };

  const confirmDelete = () => {
    fetch(
      `${API_URL}/v1/hris/timetable/deletetimetable?timetableID=${deleteItemId}`,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        setTimetableData(
          timetableData.filter((item) => item.TimetableID !== deleteItemId)
        );
        setShowDeletePopup(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setShowDeletePopup(false);
      });
  };

  const closeDeletePopup = () => {
    setShowDeletePopup(false);
    setDeleteItemId(null);
  };

  return (
    <div className="bg-background h-screen overflow-y-auto">
      <p className="mt-6 ml-6 font-sans font-bold text-[20px] text-black">
        Timetable Management
      </p>

      <div className="justify-start">
        <div>
          <div>
            <div className="flex justify-between items-center">
              <button
                className="px-5 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 w-60"
                onClick={handleSend}
              >
                + Create Timetable
              </button>
            </div>
            <div className="mt-5">
              <input
                type="text"
                placeholder="Search by Timetable Name"
                className="border border-black rounded-lg p-2 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                  Timetable Name
                </th>
                <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                  Start Check-In Time
                </th>
                <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                  End Check-In Time
                </th>

                <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                  Start Check-Out Time
                </th>
                <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                  End Check-Out Time
                </th>

                <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item) => (
                <tr key={item.TimetableID}>
                  <td className="px-6 py-4 whitespace-nowrap text-md">
                    {item.TimetableName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-md">
                    {item.StartCheckInTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-md">
                    {item.EndCheckInTime}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-md">
                    {item.StartCheckOutTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-md">
                    {item.EndCheckOutTime}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-md">
                    <div className="flex gap-2">
                      <div className="flex gap-5 items-center">
                        <button
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => handleEdit(item.TimetableID)}
                        >
                          Edit
                        </button>

                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(item.TimetableID)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-primary text-white px-4 py-2 mx-1 rounded-md"
        >
          <GrPrevious className="w-3 h-3" />
        </button>
        {[...Array(Math.ceil(filteredTimetableData.length / itemsPerPage))].map(
          (_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`${
                currentPage === index + 1 ? "bg-gray-300" : "bg-white"
              } text-primary px-4 py-2 mx-1 rounded-md`}
            >
              {index + 1}
            </button>
          )
        )}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={
            currentPage ===
            Math.ceil(filteredTimetableData.length / itemsPerPage)
          }
          className="bg-primary text-white px-4 py-2 mx-1 rounded-md"
        >
          <GrNext className="w-3 h-3" />
        </button>
      </div>
      {showEditPopup && (
        <div className="fixed top-0 left-0 h-full flex items-center justify-center bg-black bg-opacity-50 z-50 w-full">
          <TimetablePopup
            timetableId={editTimetableId}
            onClose={handleCloseEditPopup}
          />
        </div>
      )}
      {showSuccessPopup && (
        <div className="fixed top-0 left-0 h-full flex items-center justify-center bg-black bg-opacity-50 z-50 w-full">
          <div className="fixed top-0 left-0 h-full flex items-center justify-center bg-black bg-opacity-50 z-50 w-full">
            <div className="bg-white rounded-[30px] relative w-[75%] h-[90%] ">
              <button
                className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 mt-3 mr-3 rounded-[20px]"
                onClick={handleCloseSuccessPopup}
              >
                X
              </button>
              <div className="overflow-y-auto h-[90%] w-[98%] ml-5 mr-5 mt-10">
                <div className="mr-10 mb-10  ">
                  <h2 className="text-2xl font-bold mb-10">Create Timetable</h2>
                  <div className="ml-10">
                    <form onSubmit={handleSubmit}>
                      <div>
                        <label className="block text-[#344054] font-bold">
                          Name*
                        </label>
                        <input
                          required
                          type="text"
                          name="timetableName"
                          value={formData.timetableName}
                          onChange={handleFormChange}
                          className="border rounded-[20px] w-full py-2 px-3"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="block text-[#344054] font-bold">
                            Check-In Start Time*
                          </label>
                          <input
                            required
                            type="time"
                            name="startCheckInTime"
                            value={formData.startCheckInTime}
                            onChange={handleFormChange}
                            className="border rounded-[20px] w-full py-2 px-3"
                          />
                        </div>
                        <div>
                          <label className="block text-[#344054] font-bold">
                            Check-In End Time*
                          </label>
                          <input
                            required
                            type="time"
                            name="endCheckInTime"
                            value={formData.endCheckInTime}
                            onChange={handleFormChange}
                            className="border rounded-[20px] w-full py-2 px-3"
                          />
                        </div>
                        <div>
                          <label className="block text-[#344054] font-bold">
                            Check-Out Start Time*
                          </label>
                          <input
                            required
                            type="time"
                            name="startCheckOutTime"
                            value={formData.startCheckOutTime}
                            onChange={handleFormChange}
                            className="border rounded-[20px] w-full py-2 px-3"
                          />
                        </div>
                        <div>
                          <label className="block text-[#344054] font-bold">
                            Check-Out End Time*
                          </label>
                          <input
                            type="time"
                            name="endCheckOutTime"
                            value={formData.endCheckOutTime}
                            onChange={handleFormChange}
                            className="border rounded-[20px] w-full py-2 px-3"
                          />
                        </div>
                        <div>
                          <label className="block text-[#344054] font-bold">
                            Required Working Days*
                          </label>
                          <input
                            type="number"
                            name="workingdays"
                            value={formData.workingdays}
                            onChange={handleFormChange}
                            className="border rounded-[20px] w-full py-2 px-3"
                          />
                        </div>
                      </div>
                      <hr className="line border-t-1 border-[#344054] rounded-lg w-[100%] mt-10 mb-10"></hr>

                      <div className="mt-6">
                        <h2 className="text-2xl font-bold font-[#071C50]">
                          Assign Employees to Timetable
                        </h2>
                        <div className="">
                          <div className="grid grid-cols-2 gap-4 ">
                            <div className="mt-5">
                              <div className="form relative w-[60%] rounded-xl mb-5">
                                <button className="absolute left-2 -translate-y-1/2 top-1/2 p-1">
                                  <svg
                                    className="w-5 h-5 text-gray-700"
                                    aria-labelledby="search"
                                    role="img"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    height="16"
                                    width="17"
                                  >
                                    <path
                                      strokeLinejoin="round"
                                      strokeLinecap="round"
                                      strokeWidth="1.333"
                                      stroke="currentColor"
                                      d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                                    ></path>
                                  </svg>
                                </button>
                                <input
                                  type="text"
                                  required=""
                                  placeholder="Search by Employee"
                                  className="input rounded-xl border-none h-10 px-8 py-3  m-2 placeholder-gray-400"
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                />
                              </div>
                              <div className="overflow-y-auto max-h-64">
                                <table className="table-auto w-full">
                                  <thead>
                                    <tr>
                                      <th className="px-4 py-2 bg-[#F5F5F5] rounded-l-xl">
                                        Employee ID
                                      </th>
                                      <th className="px-4 py-2 bg-[#F5F5F5] rounded-r-xl">
                                        First Name
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {employeeData.map((employee) => (
                                      <tr
                                        key={employee.employee_no}
                                        className="border-b border-black-300"
                                      >
                                        <td className="px-4 py-2 flex items-center">
                                          <input
                                            type="checkbox"
                                            className="mr-2"
                                            onChange={() =>
                                              handleSelectEmployee(employee)
                                            }
                                          />
                                          {employee.employee_no}
                                        </td>
                                        <td className="px-4 py-2">
                                          {employee.employee_calling_name}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            <div className="mt-[10%] h-64 overflow-y-auto">
                              <h3 className="text-xl font-bold text-[#344054] mb-4">
                                Selected Employees
                              </h3>
                              <table className="table-auto w-full">
                                <thead>
                                  <tr className="">
                                    <th className="px-4 py-2 bg-[#F5F5F5] rounded-l-xl">
                                      Employee ID
                                    </th>
                                    <th className="px-4 py-2 bg-[#F5F5F5] rounded-r-xl">
                                      First Name
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedEmployees.map((employee) => (
                                    <tr
                                      key={employee.employee_no}
                                      className="border-b border-black-300"
                                    >
                                      <td className="px-4 py-2">
                                        {employee.employee_no}
                                      </td>
                                      <td className="px-4 py-2">
                                        {employee.employee_calling_name}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-4">
                          <div className="flex justify-start mt-10">
                            <button className="bg-gray-500 text-white px-4 py-2 rounded-[22px]">
                              Assign Employees to Timetable
                            </button>
                          </div>
                          <div className="flex justify-end mt-10">
                            <button
                              className="bg-[#797C80] text-white px-4 py-2 rounded-[22px] mr-2"
                              onClick={handleCloseSuccessPopup}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-[#5B6D49] text-white px-4 py-2 rounded-[22px]"
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showErrorPopup && (
        <div className="fixed top-0 left-0 h-full flex items-center justify-center bg-black bg-opacity-50 z-50 w-full">
          <div className="bg-white rounded-[30px] relative w-[75%] h-[90%]">
            <button
              className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 mt-3 mr-3 rounded-[20px]"
              onClick={handleCloseErrorPopup}
            >
              X
            </button>
            <div className="overflow-y-auto h-[90%] w-[98%] ml-5 mr-5 mt-10">
              <div className="mr-10 mb-10">
                <h2 className="text-2xl font-bold mb-10">Error</h2>
                <p>
                  There was an error processing your request. Please try again
                  later.
                </p>
                <div className="flex justify-end mt-4">
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded-[22px]"
                    onClick={handleCloseErrorPopup}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeletePopup && (
        <div className="fixed top-0 left-0 h-full w-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl mb-4">Are you sure you want to delete?</h2>
            <div className="flex justify-end">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md mr-2"
                onClick={confirmDelete}
              >
                Yes
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded-md"
                onClick={closeDeletePopup}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimetableManagement;
