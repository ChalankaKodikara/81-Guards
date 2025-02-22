import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';  // Importing js-cookie for fetching cookies
import Select from 'react-select';

const Leave_Allocation = () => {
    const [formData, setFormData] = useState({
        category_name: "",
        create_by: "",
        annual_recurring: "true",
        eligible_region: [], // Religions
        eligible_country: [], // Nationalities
        eligible_gender: "",
        reset_day: "",
        weight: 0,
        short_leave: true,
        apply_before_day: 0,
        no_of_days: 0,
        employment_type: "",
    });

    const [nationalities, setNationalities] = useState([]);
    const [religions, setReligions] = useState([]);
    const [employmentTypes, setEmploymentTypes] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);  // Initialize as empty array

    // Fetch Nationalities
    useEffect(() => {
        fetch('http://localhost:8599/v1/hris/religionsAndNationalities/nationalities')
            .then(response => response.json())
            .then(data => setNationalities(data))  // Set nationalities in state
            .catch(error => console.error('Error fetching nationalities:', error));
    }, []);

    // Fetch Religions
    useEffect(() => {
        fetch('http://localhost:8599/v1/hris/religionsAndNationalities/religions')
            .then(response => response.json())
            .then(data => setReligions(data))  // Set religions in state
            .catch(error => console.error('Error fetching religions:', error));
    }, []);

    useEffect(() => {
        fetch('http://localhost:8599/v1/hris/employmentType/all')
            .then(response => response.json())
            .then(data => setEmploymentTypes(data.data))  // Set employment types in state
            .catch(error => console.error('Error fetching employment types:', error));
    }, []);

    // Fetch Leave Types
    // Fetch Leave Types
    useEffect(() => {
        fetch('http://localhost:8599/v1/hris/leave/get-leave-name')
            .then(response => response.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    setLeaveTypes(data.data);  // Set leave types from the 'data' property
                } else {
                    console.error("Error: Expected a valid array in the 'data' property.", data);
                }
            })
            .catch(error => console.error('Error fetching leave types:', error));
    }, []);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };



    const handleSubmit = () => {
        // Get the 'employee_no' cookie
        const employeeNo = Cookies.get('employee_no');

        // Initialize form data with the current state
        let updatedFormData = { ...formData };

        // Set createBy to employee_no from the cookie
        updatedFormData.create_by = employeeNo || "admin";  // Fallback to 'admin' if employee_no is not found
        console.log(updatedFormData);

        // Submit the updated form data
        fetch('http://localhost:8599/v1/hris/leave/add-leaveCategory/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedFormData),
        })
            .then(response => response.json())
            .then(data => console.log('Success:', data))
            .catch(error => console.error('Error:', error));
    };


    const handleCancel = () => {
        setFormData({
            category_name: "",
            create_by: "",
            annual_recurring: "",
            eligible_region: [],
            eligible_country: [],
            eligible_gender: "",
            reset_day: "",
            weight: 0,
            short_leave: true,
            apply_before_day: 0,
            no_of_days: 0,
            employment_type: "",
        });
    };
    const handleCheckboxChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value === "true" ? true : value === "false" ? false : value,
        }));
    };

    return (
        <div className="mx-5 mt-5 font-montserrat">
            <div className="flex items-center gap-5">
                <Link to="/create-leave-types">
                    <button>Add Leave Type</button>
                </Link>

                <div>
                    <button className="bg-blue-500 text-white p-2 rounded-lg font-semibold">Leave Allocation</button>
                </div>
                <div>
                    <button>Reset Leave</button>
                </div>
            </div>

            <div className="mt-3 flex justify-end">
                <Link to="/view-leave-table">
                    <button className="bg-blue-100 text-blue-500 p-2 rounded-lg font-semibold">
                        View Table
                    </button>
                </Link>
            </div>

            <div className="mt-5">
                <div className="p-6 rounded-lg shadow-lg w-full">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block mb-2 font-medium">Leave Type</label>
                            <select
                                name="category_name"
                                value={formData.category_name}
                                onChange={handleSelectChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="">Select Leave Type</option>
                                {Array.isArray(leaveTypes) && leaveTypes.length > 0 ? (
                                    leaveTypes.map((leaveType, index) => (
                                        <option key={index} value={leaveType.name}>
                                            {leaveType.name}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">No leave types available</option>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">No. of Days</label>
                            <input
                                type="number"
                                name="no_of_days"
                                value={formData.no_of_days}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Apply Before (days)</label>
                            <input
                                type="number"
                                name="apply_before_day"
                                value={formData.apply_before_day}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">Employment Type</label>
                            <select
                                name="employment_type"
                                value={formData.employment_type}
                                onChange={handleSelectChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="">Select Employment Type</option>
                                {employmentTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.type_name}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div>
                            <label className="block mb-2 font-medium">Eligible Gender</label>
                            <select
                                name="eligible_gender"
                                value={formData.eligible_gender}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="both">Both</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">Religions</label>
                            <Select
                                isMulti
                                name="eligible_region"
                                options={religions.map((religion) => ({ value: religion, label: religion }))}
                                value={formData.eligible_region.map((religion) => ({ value: religion, label: religion }))}
                                onChange={(selectedOptions) =>
                                    setFormData({
                                        ...formData,
                                        eligible_region: selectedOptions ? selectedOptions.map((option) => option.value) : [],
                                    })
                                }
                                className="basic-multi-select"
                                classNamePrefix="select"
                            />
                        </div>


                        <div>
                            <label className="block mb-2 font-medium">Nationalities</label>
                            <Select
                                isMulti
                                name="eligible_country"
                                options={nationalities.map((nationality) => ({ value: nationality, label: nationality }))}
                                value={formData.eligible_country.map((nationality) => ({ value: nationality, label: nationality }))}
                                onChange={(selectedOptions) =>
                                    setFormData({
                                        ...formData,
                                        eligible_country: selectedOptions ? selectedOptions.map((option) => option.value) : [],
                                    })
                                }
                                className="basic-multi-select"
                                classNamePrefix="select"
                            />
                        </div>


                        <div>
                            <label className="block mb-2 font-medium">Leave Weight</label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">Reset Day</label>
                            <input
                                type="text"
                                name="reset_day"
                                value={formData.reset_day}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">Short Leave</label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="short_leave"
                                        value="true"
                                        checked={formData.short_leave === true}
                                        onChange={() => handleCheckboxChange("short_leave", true)}
                                        className="mr-2"
                                    />
                                    Yes
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="short_leave"
                                        value="false"
                                        checked={formData.short_leave === false}
                                        onChange={() => handleCheckboxChange("short_leave", false)}
                                        className="mr-2"
                                    />
                                    No
                                </label>
                            </div>
                        </div>

                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Per</label>
                        <select
                            name="per"
                            value={formData.per}
                            onChange={handleSelectChange}
                            className="w-[50%] p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Select</option>
                            <option value="year">Year</option>
                            <option value="month">Month</option>
                        </select>
                    </div>

                    {/* If "Year" is selected, show Month and Day */}
                    {formData.per === "year" && (
                        <>
                            <div>
                                <label className="block mb-2 font-medium">Month</label>
                                <input
                                    type="number"
                                    name="month"
                                    value={formData.month}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">Day</label>
                                <input
                                    type="number"
                                    name="day"
                                    value={formData.day}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </>
                    )}

                    {/* If "Month" is selected, show Day and Week */}
                    {formData.per === "month" && (
                        <>
                            <div>
                                <label className="block mb-2 font-medium">Day</label>
                                <input
                                    type="number"
                                    name="day"
                                    value={formData.day}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">Week</label>
                                <input
                                    type="number"
                                    name="week"
                                    value={formData.week}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end mt-4 gap-4">
                    <button
                        className="bg-gray-300 text-black px-4 py-2 rounded-md"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        onClick={handleSubmit}
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Leave_Allocation;
