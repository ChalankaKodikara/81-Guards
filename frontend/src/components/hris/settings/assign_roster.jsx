import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit3 } from "react-icons/fi";


const AssignRooster = () => {
  const [showModal, setShowModal] = useState(false);
  const [showAssignRosterModal, setShowAssignRosterModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    name_of_work: '',
    reason: '',
    start_time: '',
    end_time: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeData, setEmployeeData] = useState([]);
  const [filteredEmployeeData, setFilteredEmployeeData] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [assignRosterForms, setAssignRosterForms] = useState([
    { startDate: '', endDate: '', timetableID: '' }
  ]);
  const [timetables, setTimetables] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  useEffect(() => {
    const fetchTimetableData = async () => {
      try {
        const response = await axios.get(`${API_URL}/v1/hris/timetable/gettimetable`);
        setTimetables(response.data);
      } catch (error) {
        console.error("Error fetching timetable data:", error);
      }
    };
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(`${API_URL}/v1/hris/employees/getemployeebasicdetails`);
        setEmployeeData(response.data);
        setFilteredEmployeeData(response.data); // Set filtered data initially
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    fetchTimetableData();
    fetchEmployeeData();
  }, []);

  const openModal = () => setShowModal(true);

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      date: '',
      name_of_work: '',
      reason: '',
      start_time: '',
      end_time: '',
    });
    setSelectedEmployees([]);
  };

  const openAssignRosterModal = (employee) => {
    setSelectedEmployee(employee);
    setShowAssignRosterModal(true);
  };

  const closeAssignRosterModal = () => {
    setShowAssignRosterModal(false);
    setAssignRosterForms([{ startDate: '', endDate: '', timetableID: '' }]);
    setSelectedEmployee(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };



  const handleSelectEmployee = (employee) => {
    setSelectedEmployees((prevSelected) => {
      const isSelected = prevSelected.some((e) => e.employee_no === employee.employee_no);
      return isSelected
        ? prevSelected.filter((e) => e.employee_no !== employee.employee_no)
        : [...prevSelected, employee];
    });
  };

  const handleSubmit = () => {
    console.log("Form submitted", formData, selectedEmployees);
    closeModal();
  };
  const [rosterData, setRosterData] = useState([]);


  useEffect(() => {
    const fetchEmployeeRosterData = async () => {
      try {
        const response = await axios.get(`${API_URL}/v1/hris/timetable/getemployeeswithroster`);
        // Ensure the data structure matches your expectations
        if (response.data && response.data.employeesWithRosters) {
          // Map the response data into an array if it's not already
          const employees = Array.isArray(response.data.employeesWithRosters)
            ? response.data.employeesWithRosters
            : [response.data.employeesWithRosters];

          setEmployeeData(employees);
          setFilteredEmployeeData(employees); // Set filtered data initially
        } else {
          console.error("Unexpected response structure:", response.data);
        }
      } catch (error) {
        console.error("Error fetching employee roster data:", error);
      }
    };

    fetchEmployeeRosterData();
  }, []);



  const handleAddRosterForm = () => {
    setAssignRosterForms([...assignRosterForms, { startDate: '', endDate: '', timetableID: '' }]);
  };

  const handleRemoveRosterForm = (index) => {
    const updatedForms = assignRosterForms.filter((_, i) => i !== index);
    setAssignRosterForms(updatedForms);
  };

  const handleRosterFormChange = (index, field, value) => {
    const updatedForms = assignRosterForms.map((form, i) =>
      i === index ? { ...form, [field]: value } : form
    );
    setAssignRosterForms(updatedForms);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(rosterData.length / itemsPerPage);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSeeMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearch = (query, type) => {
    setSearchQuery(query);
    if (query) {
      const filteredData = employeeData.filter((employee) =>
        type === 'name'
          ? employee.employee_name_initial.toLowerCase().includes(query.toLowerCase())
          : employee.employee_no.toString().includes(query)
      );
      setFilteredEmployeeData(filteredData);
    } else {
      setFilteredEmployeeData(employeeData);
    }
  };


  const [nameSearchQuery, setNameSearchQuery] = useState('');
  const [idSearchQuery, setIdSearchQuery] = useState('');
  const handleNameSearch = (query) => {
    setNameSearchQuery(query);
    if (query) {
      const filteredData = employeeData.filter((employee) =>
        employee.employee_name_initial.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredEmployeeData(filteredData);
    } else {
      setFilteredEmployeeData(employeeData);
    }
  };

  const handleIdSearch = (query) => {
    setIdSearchQuery(query);
    if (query) {
      const filteredData = employeeData.filter((employee) =>
        employee.employee_no.toString().includes(query)
      );
      setFilteredEmployeeData(filteredData);
    } else {
      setFilteredEmployeeData(employeeData);
    }
  };


  const [showViewRosterModal, setShowViewRosterModal] = useState(false);
  const [rosterDetails, setRosterDetails] = useState([]);

  // Function to open the modal and fetch roster details
  const openViewRosterModal = async (employee) => {
    setSelectedEmployee(employee);
    setShowViewRosterModal(true); // Open modal immediately
    try {
      const response = await axios.get(
        `${API_URL}/v1/hris/timetable/getemployeerosterdetails`,
        { params: { employee_no: employee.employee_no } }
      );
      console.log("Roster details response:", response.data); // Debugging log
      setRosterDetails(response.data.data || []);
    } catch (error) {
      console.error("Error fetching roster details:", error);
      setRosterDetails([]); // Fallback in case of error
    }
  };



  // Function to close the modal
  const closeViewRosterModal = () => {
    setShowViewRosterModal(false);
    setRosterDetails([]);
  };

  // Function to handle roster deletion
  const handleDeleteRoster = async (scheduleID) => {
    try {
      const response = await axios.delete(
        `${API_URL}/v1/hris/timetable/deleteEmployeeRosterDetails`,
        { params: { schedule_id: scheduleID } }
      );
      if (response.status === 200) {
        // Remove deleted roster from state
        setRosterDetails((prevDetails) =>
          prevDetails.filter((roster) => roster.ScheduleID !== scheduleID)
        );
      }
    } catch (error) {
      console.error("Error deleting roster:", error);
    }
  };


  const handleAssignRosterSubmit = async () => {
    try {
      // Create the payload with employees and rosterWeeks
      const employeesData = selectedEmployees.map((employee) => ({
        employee_no: employee.employee_no,
        rosterWeeks: assignRosterForms.map((form) => ({
          startDate: form.startDate,
          endDate: form.endDate,
          timetable_id: parseInt(form.timetableID, 10),
        })),
      }));

      const postData = { employees: employeesData };

      const response = await axios.post(
        `${API_URL}/v1/hris/timetable/addrostertimetable`, // Updated endpoint
        postData
      );

      if (response.status === 200 && response.data.message) {
        console.log("Roster assigned successfully:", response.data.message);
        setShowSuccessPopup(true); // Show the success popup
      }

      closeAssignRosterModal();
    } catch (error) {
      console.error("Error assigning roster:", error.response ? error.response.data : error.message);
    }
  };


  return (
    <div className='bg-background h-screen overflow-y-auto'>
      <div className='mx-5 my-5'>
        <p className='text-[25px] font-bold'>Assign Roster</p>
        <button onClick={openModal} className='bg-secondary_color p-2 rounded-lg text-white mt-5'>+ Assign Roster</button>
        <div className='mt-3 flex items-center gap-5'>
          {/* Search by Name */}
          <input
            className='border border-black rounded-lg p-2 w-[350px]'
            placeholder='Search by employee name...'
            value={nameSearchQuery}
            onChange={(e) => handleNameSearch(e.target.value)}
          />

          {/* Search by ID */}
          <input
            className='border border-black rounded-lg p-2 w-[350px]'
            placeholder='Search by employee ID...'
            value={idSearchQuery}
            onChange={(e) => handleIdSearch(e.target.value)}
          />
        </div>

        <div className='mt-8'>
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployeeData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((employee, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{employee.employee_no}</td>
                  <td className="px-6 py-4 text-sm">{employee.employee_name_initial}</td>
                  <td className="px-6 py-4 text-sm">{new Date(employee.AssignedDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className='flex items-center gap-2'>
                      <button
                        className="bg-secondary_color text-black px-4 py-1 rounded-lg"
                        onClick={() => openViewRosterModal(employee)}
                      >
                        <FiEdit3 />
                      </button>


                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center items-center mt-4">
            {/* Page Numbers */}
            <div className="flex space-x-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageClick(pageNumber)}
                  className={`px-4 py-2 rounded ${pageNumber === currentPage ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            {/* "See More" Button */}
            {totalPages > 5 && (
              <button
                onClick={handleSeeMore}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                See More
              </button>
            )}
          </div>


        </div>
      </div>

      {/* Modal Popup for Assigning Roster */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-[1200px] p-8 rounded-lg shadow-lg overflow-y-auto">
            {/* Assigning roster modal content */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-semibold">Employee Assigning</h2>
              <button onClick={closeModal} className="text-gray-600 text-2xl font-bold">&times;</button>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-lg mt-8">
              <div className="mt-6">
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Search employee by name"
                    className="input rounded-xl border border-gray-300 h-10 px-4 py-2 mb-4 placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  <div className="overflow-y-auto max-h-64">
                    <table className="table-auto w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 bg-[#F5F5F5] rounded-l-xl">Employee ID</th>
                          <th className="px-4 py-2 bg-[#F5F5F5]">Employee Name</th>
                          <th className="px-4 py-2 bg-[#F5F5F5] rounded-r-xl">Select</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployeeData.map((employee) => (
                          <tr key={employee.employee_no} className="border-b border-gray-300">
                            <td className="px-4 py-2">{employee.employee_no}</td>
                            <td className="px-4 py-2">{employee.employee_name_initial}</td>
                            <td className="px-4 py-2 text-center">
                              <input
                                type="checkbox"
                                onChange={() => handleSelectEmployee(employee)}
                                checked={selectedEmployees.some(
                                  (e) => e.employee_no === employee.employee_no
                                )}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-[#344054] mb-4">Selected Employees</h3>
                  <div className="overflow-y-auto max-h-64">
                    <table className="table-auto w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 bg-[#F5F5F5] rounded-l-xl">Employee ID</th>
                          <th className="px-4 py-2 bg-[#F5F5F5]">Employee Name</th>
                          <th className="px-4 py-2 bg-[#F5F5F5]">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEmployees.map((employee) => (
                          <tr key={employee.employee_no} className="border-b border-gray-300">
                            <td className="px-4 py-2">{employee.employee_no}</td>
                            <td className="px-4 py-2">{employee.employee_name_initial}</td>
                            <td className="px-4 py-2">
                              <button
                                className='bg-secondary_color p-1 text-white rounded-lg'
                                onClick={() => openAssignRosterModal(employee)}
                              >
                                + Assign Roster
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={handleSubmit}
                    className="bg-secondary_color text-white px-4 py-2 rounded-[22px]"
                  >
                    Assign
                  </button>
                  <button onClick={closeModal} className="bg-[#797C80] text-white px-4 py-2 rounded-[22px]">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Roster Popup */}
      {showAssignRosterModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white w-[500px] p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Assign Roster</h2>
            <div className='grid grid-cols-2 grid-flow-row gap-4'>
              <div className="mb-3">
                <label>Employee Name:</label>
                <input
                  type="text"
                  value={selectedEmployee.employee_name_initial}
                  readOnly
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div className="mb-3">
                <label>Employee ID:</label>
                <input
                  type="text"
                  value={selectedEmployee.employee_no}
                  readOnly
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>
            </div>

            {assignRosterForms.map((form, index) => (
              <div key={index} className="mb-6 border p-4 rounded-lg">
                <div className="mb-3">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    className="border border-gray-300 rounded p-2 w-full"
                    value={form.startDate}
                    onChange={(e) => handleRosterFormChange(index, 'startDate', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label>End Date:</label>
                  <input
                    type="date"
                    className="border border-gray-300 rounded p-2 w-full"
                    value={form.endDate}
                    onChange={(e) => handleRosterFormChange(index, 'endDate', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label>Timetable:</label>
                  <select
                    className="border border-gray-300 rounded p-2 w-full"
                    value={form.timetableID}
                    onChange={(e) => handleRosterFormChange(index, 'timetableID', e.target.value)}
                  >
                    <option value="" disabled>Select a timetable</option>
                    {timetables.map((timetable) => (
                      <option key={timetable.TimetableID} value={timetable.TimetableID}>
                        {timetable.TimetableName} ({timetable.StartCheckInTime} - {timetable.EndCheckOutTime})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveRosterForm(index)}
                    className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={handleAddRosterForm}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                + Add Another Roster
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={closeAssignRosterModal} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
                Cancel
              </button>
              <button onClick={handleAssignRosterSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
                Assign
              </button>
            </div>
          </div>
        </div>
      )}


      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-[400px] p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Success!</h2>
            <p className="text-lg mb-4">Roster timetable assigned successfully.</p>
            <button
              onClick={() => setShowSuccessPopup(false)}  // Close the popup
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* View Roster Modal */}
      {showViewRosterModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white w-[500px] p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Roster Details</h2>
            <div className="mb-3">
              <label>Employee Name:</label>
              <input
                type="text"
                value={selectedEmployee.employee_name_initial}
                readOnly
                className="border border-gray-300 rounded p-2 w-full"
              />
            </div>
            <div className="mb-3">
              <label>Employee ID:</label>
              <input
                type="text"
                value={selectedEmployee.employee_no}
                readOnly
                className="border border-gray-300 rounded p-2 w-full"
              />
            </div>
            {rosterDetails.map((roster) => (
              <div key={roster.ScheduleID} className="mb-6 border p-4 rounded-lg">
                <div className="mb-3">
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {new Date(roster.week_start_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="mb-3">
                  <p>
                    <strong>End Date:</strong>{" "}
                    {new Date(roster.week_end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="mb-3">
                  <p>
                    <strong>Timetable:</strong> {roster.TimetableName}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDeleteRoster(roster.ScheduleID)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <button onClick={closeViewRosterModal} className="bg-gray-500 text-white px-4 py-2 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AssignRooster;
