/** @format */

import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import moment from "moment";
import { FaArrowRight } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { saveEmployeeData } from "../../../../reducers/employeeSlice";
import Autosuggest from "react-autosuggest";
const EmploymentDetails = ({
  data,
  setData,
  handlePrevStep,
  handleNextStep,
}) => {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [branches, setBranch] = useState([]);
  const [employmentType, setEmploymentType] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const dispatch = useDispatch();
  const [employmentData, setEmploymentData] = useState(data || {});
  const [errors, setErrors] = useState({});
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  const [workingOffices, setWorkingOffices] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [workingOfficeInput, setWorkingOfficeInput] = useState(
    employmentData.employee_working_office || ""
  );

  // Fetch working offices on component mount
  useEffect(() => {
    const fetchWorkingOffices = async () => {
      try {
        const response = await fetch(
          `${API_URL}/v1/hris/payroll/getAllWorkingOffices`
        );
        const offices = await response.json();
        setWorkingOffices(offices); // Set the list of offices
      } catch (error) {
        console.error("Error fetching working offices:", error);
      }
    };

    fetchWorkingOffices();
  }, [API_URL]);

  // Function to filter suggestions based on input
  // Function to filter suggestions based on input (match first letter only)
  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    return inputValue.length === 0
      ? []
      : workingOffices.filter((office) =>
        office.toLowerCase().startsWith(inputValue) // Match based on the first letter
      );
  };


  // Function to get the text value from the suggestion
  const getSuggestionValue = (suggestion) => suggestion;

  // Render the suggestion
  const renderSuggestion = (suggestion) => <div>{suggestion}</div>;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          designationResponse,
          supervisorResponse,
          timetableResponse,
          branchResponse,
          employmentTypeResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/v1/hris/designations/getdesignation`),
          fetch(`${API_URL}/v1/hris/supervisors/getSupervisors`),
          fetch(`${API_URL}/v1/hris/timetable/gettimetable`),
          fetch(`${API_URL}/v1/hris/branch/all`),
          fetch(`${API_URL}/v1/hris/employmentType/all`),
        ]);

        const [
          designations,
          supervisors,
          timetables,
          branches,
          employmentTypes,
        ] = await Promise.all([
          designationResponse.json(),
          supervisorResponse.json(),
          timetableResponse.json(),
          branchResponse.json(),
          employmentTypeResponse.json(),
        ]);
        setDepartments(
          Array.from(new Set(designations.map((item) => item.department)))
        );
        setDesignations(designations);
        setSupervisors(supervisors);
        setTimetables(timetables);
        setBranch(branches);
        setEmploymentType(employmentTypes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  console.log("employmentData.department_id", employmentData);

  const filteredDesignations = designations.filter(
    (designation) => designation.department === employmentData.department_id
  );
  // console.log("filteredDesignations", filteredDesignations);
  // console.log("supervisors", supervisors);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmploymentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateFields = () => {
    const newErrors = {};

    if (!employmentData.branch_id) {
      newErrors.branch_id = "Employee Branch is required";
    }
    if (!employmentData.employment_type) {
      newErrors.employment_type = "Employment Type is required";
    }

    // Add other validation rules as necessary

    setErrors(newErrors);
    // console.log("new error", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateFields()) {
      // Dispatch data to Redux
      dispatch(saveEmployeeData(employmentData));
      setData(employmentData);

      // Proceed to the next step
      handleNextStep(true); // Pass `true` to indicate current form is valid
    } else {
      handleNextStep(false); // Pass `false` to indicate current form is invalid
    }
  };

  const handlePrev = () => {
    setData(employmentData); // Save the current data before going to previous
    handlePrevStep(true); // Go to the previous step
  };

  return (
    <div>
      <h1 className="text-[30px] font-bold col-span-3 mt-5">
        Employment Details
      </h1>
      <div className="grid grid-cols-2 gap-y-[30px] gap-x-[60px] text-[20px] mt-5">
        <div>
          <label className="block text-gray-700">Department</label>
          <select
            name="department_id"
            value={employmentData.department_id || ""} // Ensure the default value is an empty string
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="" disabled>
              Select Department
            </option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department_id && (
            <p className="text-red-500">{errors.department_id}</p>
          )}
        </div>
        <div>
          <label className="block text-gray-700">Designation</label>
          <select
            name="department_designation_id"
            value={employmentData.department_designation_id || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            disabled={!employmentData.department_id}
          >
            <option value="" disabled>
              Select Designation
            </option>
            {filteredDesignations.length > 0 ? (
              filteredDesignations.map((designation) => (
                <option key={designation.id} value={designation.id}>
                  {designation.designation}
                </option>
              ))
            ) : (
              <option disabled>No designation available</option>
            )}
          </select>
          {errors.department_designation_id && (
            <p className="text-red-500">{errors.department_designation_id}</p>
          )}
        </div>
        <div>
          <label className="block text-gray-700">Working Office</label>
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={({ value }) => {
              setSuggestions(getSuggestions(value)); // Fetch suggestions that match the first letter
            }}
            onSuggestionsClearRequested={() => {
              setSuggestions([]); // Clear suggestions when input is cleared
            }}
            getSuggestionValue={getSuggestionValue} // Returns the selected suggestion
            renderSuggestion={renderSuggestion} // Renders the suggestion in the dropdown
            inputProps={{
              placeholder: "Type a working office...",
              value: workingOfficeInput,
              onChange: (e, { newValue }) => {
                setWorkingOfficeInput(newValue); // Update input value
                setEmploymentData((prev) => ({
                  ...prev,
                  employee_working_office: newValue, // Update employmentData with the selected office
                }));
              },
              className: "w-full border border-gray-300 p-2 rounded",
            }}
          />
          {errors.employee_working_office && (
            <p className="text-red-500">{errors.employee_working_office}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700">
            Branch <span className="text-red-500">*</span>
          </label>
          <select
            name="branch_id"
            value={employmentData.branch_id || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="" disabled>
              Select Branch
            </option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.id} - {branch.branch}
              </option>
            ))}
          </select>
          {errors.branch_id && (
            <p className="text-red-500">{errors.branch_id}</p>
          )}
        </div>
        <div>
          <label className="block text-gray-700">
            Employment Type <span className="text-red-500">*</span>
          </label>
          <select
            name="employment_type"
            value={employmentData.employment_type || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="" disabled>
              Select Employment Type
            </option>
            {employmentType && employmentType.length > 0 ? (
              employmentType.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.employment_type_name}
                </option>
              ))
            ) : (
              <option disabled>No employment types available</option>
            )}
          </select>
          {errors.employment_type && (
            <p className="text-red-500">{errors.employment_type}</p>
          )}
        </div>
        <div>
          <label className="block text-gray-700">Supervisor</label>
          <select
            name="supervisor_id"
            value={employmentData.supervisor_id || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="" disabled>
              Select Supervisor
            </option>
            {supervisors.map((supervisor) => (
              <option key={supervisor.id} value={supervisor.id}>
                {supervisor.supervisor_fullname}
              </option>
            ))}
          </select>
          {errors.supervisor_id && (
            <p className="text-red-500">{errors.supervisor_id}</p>
          )}
        </div>
        <div>
          <label className="block text-gray-700">Timetable</label>
          <select
            name="timetable_id"
            value={employmentData.timetable_id || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="" disabled>
              Select Timetable
            </option>
            {timetables.map((timetable) => (
              <option key={timetable.TimetableID} value={timetable.TimetableID}>
                {timetable.TimetableName}
              </option>
            ))}
          </select>
          {errors.timetable_id && (
            <p className="text-red-500">{errors.timetable_id}</p>
          )}
        </div>
        <div>
          <label className="block text-gray-700">Date of Appointment</label>
          <input
            type="date"
            name="date_of_appointment"
            value={
              employmentData.date_of_appointment
                ? moment(employmentData.date_of_appointment, [
                  "DD/MM/YYYY",
                  "YYYY-MM-DD",
                ]).format("YYYY-MM-DD")
                : ""
            }
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
          {errors.date_of_appointment && (
            <p className="text-red-500">{errors.date_of_appointment}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700">Basic Salary</label>
          <input
            type="text"
            name="employee_basic_salary"
            value={employmentData.employee_basic_salary}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
          {errors.employee_basic_salary && (
            <p className="text-red-500">{errors.employee_basic_salary}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        {/* Previous Button with Left Arrow */}
        <button
          className="bg-gray-100 p-3 text-gray-400 rounded-lg flex items-center"
          onClick={handlePrev}
        >
          <FaArrowRight className="rotate-180 mr-2" /> Previous
        </button>

        {/* Next Button with Right Arrow */}
        <button
          className="bg-blue-500 p-3 text-white rounded-lg flex items-center"
          onClick={handleNext}
        >
          Save & Next <FaArrowRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default EmploymentDetails;
