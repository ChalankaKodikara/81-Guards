/** @format */

import moment from "moment";
import Navbar from "../navbar/navbar";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
const Create_new_permission = () => {
  const location = useLocation();
  const currentDate = moment().format("MMMM Do YYYY");
  const [currentTime, setCurrentTime] = useState(moment().format("h:mm:ss a"));
  const { selectedRoleId = {} } = location.state || {};
  const [checkedValues, setCheckedValues] = useState({});
  const [roleName, setRoleName] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [roleDescription, setRoleDescription] = useState("");
  const [grantedPermission, setGrantedPermission] = useState([]);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_FRONTEND_URL;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format("h:mm:ss a"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchRoleids();
  }, [selectedRoleId]);

  const fetchRoleids = async () => {
    console.log("permission :", selectedRoleId);
    if (selectedRoleId) {
      try {
        const response = await fetch(
          `${API_URL}/v1/hris/user/getPermissionsByRoleId?role_id=${selectedRoleId.id}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setGrantedPermission(result.data);
        initializeCheckedValues(result.data);
        setRoleName(selectedRoleId.role_name || "");
        setRoleDescription(selectedRoleId.role_description || "");
        // console.log("data: ", result.data);
      } catch (error) {
        console.error("Error fetching user permissions:", error);
      }
    }
  };
  const initializeCheckedValues = (permissions) => {
    const initialCheckedValues = {};
    permissions.forEach(({ id }) => {
      initialCheckedValues[id] = true;
    });
    setCheckedValues(initialCheckedValues);
  };

  const permissionHierarchy = useMemo(
    () => ({
      1: { children: [100, 101, 102, 103, 104] },
      100: { children: [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007] },
      102: { children: [3020, 3021] },
      2: { children: [120, 121, 122] },
      120: { children: [3060, 3061, 3062, 3063, 3064] },
      121: { children: [3080, 3081, 3082] },
      122: { children: [3100] },
      3: { children: [141, 142, 143, 144, 145, 146] },
      141: { children: [3300, 3310] },
      142: { children: [3400, 3401] },
      143: { children: [3410, 3420] },
      144: { children: [3500, 3501, 3502, 3503, 3504, 3505, 3506] },
      145: { children: [3507] },
      146: { children: [3510, 3511] },
      4: { children: [160, 161, 162, 163] },
      160: { children: [3520] },
      162: { children: [3530] },
      5: { children: [180, 181, 182, 183] },
      180: { children: [3540, 3541, 3542] },
      181: { children: [3550, 3551, 3552] },
      182: { children: [3560] },
      183: { children: [3570, 3580] },
    }),
    []
  );

  const handleCheckboxChange = (value, dependentValue) => {
    setCheckedValues((prev) => {
      const newValues = { ...prev, [value]: !prev[value] };

      if (dependentValue && !prev[dependentValue]) {
        newValues[dependentValue] = true;
      }

      if (newValues[value]) {
        Object.keys(permissionHierarchy).forEach((key) => {
          if (permissionHierarchy[key]?.children.includes(value)) {
            newValues[key] = true;
          }
        });
      }

      if (permissionHierarchy[value] && newValues[value]) {
        permissionHierarchy[value].children.forEach((child) => {
          newValues[child] = true;
        });
      }
      return newValues;
    });
  };

  const handleUpdate = async () => {
    if (!roleName || !roleDescription) {
      window.alert("Role Name and Role Description cannot be empty");
      return;
    }

    const permissions = Object.keys(checkedValues)
      .filter((key) => checkedValues[key])
      .map(Number);

    const postData = {
      role_name: roleName,
      role_description: roleDescription,
      permissions,
    };

    console.log("Sent Data:", postData);
    try {
      const response = await fetch(
        `${API_URL}/v1/hris/user/UpdateRoleBasedPermissions?id=${selectedRoleId.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Response Data:", data);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          navigate("/user-permission");
        }, 2000);
        setRoleDescription("");
        setCheckedValues({});
      } else {
        console.error("Failed to save data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="mx-10 mt-5">
      <div className="flex justify-between items-center mt-6">
        <div>
          <p className="text-[30px] font-semibold">Edit User Permissions </p>
          <p className="text-[15px] font-semibold text-primary_purple">
            Permission
          </p>
        </div>
        <div className="flex gap-6 items-center">
          <div>
            <div className="text-[#3D0B5E] text-[20px] font-bold">
              {currentDate}
            </div>
          </div>
          <div className="text-[20px] font-bold">{currentTime}</div>
        </div>
      </div>
      <div className="flex gap-6 items-center mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 ">
            Role:
          </label>
        </div>
        <div>
          <input
            type="text"
            className="mt-1 block  px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-purple-500"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role Description:
          </label>
        </div>
        <div>
          <input
            type="text"
            className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-purple-500"
            value={roleDescription}
            onChange={(e) => setRoleDescription(e.target.value)}
          />
        </div>
      </div>
      {/* //grid section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {/* Employee Information Management */}
        <div>
          <div className="border bg-gray-50 rounded-md p-4">
            <h2 className="text-lg font-bold">
              Employee Information Management
            </h2>
            <div className="flex flex-col mt-4">
              <label className="flex items-center text-purple-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="100"
                  checked={!!checkedValues[100]}
                  onChange={() => handleCheckboxChange(100)}
                />
                Employee Dashboard
              </label>

              <div className="ml-6 grid grid-cols-1 gap-2">
                {[
                  { value: 3000, label: "Total Workforce" },
                  { value: 3001, label: "Present Workforce" },
                  { value: 3002, label: "Absent Workforce" },
                  { value: 3003, label: "Late Arrivals" },
                  { value: 3004, label: "In Leave" },
                  { value: 3005, label: "Employee Information" },
                  { value: 3006, label: "Pie chart" },
                  { value: 3007, label: "Bar chart" },
                ].map((item) => (
                  <label key={item.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      value={item.value}
                      checked={!!checkedValues[item.value]}
                      onChange={() => handleCheckboxChange(item.value, 100)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center text-purple-600 mt-4">
              <input
                type="checkbox"
                className="mr-2"
                value="101"
                checked={!!checkedValues[101]}
                onChange={() => handleCheckboxChange(101)}
              />
              Employee Quick Onboard
            </label>

            <label className="flex items-center text-purple-600 mt-4">
              <input
                type="checkbox"
                className="mr-2"
                value="102"
                checked={!!checkedValues[102]}
                onChange={() => handleCheckboxChange(102)}
              />
              View Employee details
            </label>
            <div className="ml-6 grid grid-cols-1 gap-2">
              {[
                { value: 3020, label: "Edit" },
                { value: 3021, label: "Export" },
              ].map((item) => (
                <label key={item.value} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    value={item.value}
                    checked={!!checkedValues[item.value]}
                    onChange={() => handleCheckboxChange(item.value, 102)}
                  />
                  {item.label}
                </label>
              ))}
            </div>

            <label className="flex items-center text-purple-600 mt-4">
              <input
                type="checkbox"
                className="mr-2"
                value="103"
                checked={!!checkedValues[103]}
                onChange={() => handleCheckboxChange(103)}
              />
              History Login details
            </label>

            <label className="flex items-center text-purple-600 mt-4">
              <input
                type="checkbox"
                className="mr-2"
                value="104"
                checked={!!checkedValues[104]}
                onChange={() => handleCheckboxChange(104)}
              />
              Employee Edit Details
            </label>
          </div>
        </div>

        {/* Time & Attendance */}
        <div>
          <div className="border bg-gray-50 rounded-md p-4">
            <h2 className="text-lg font-bold">Time & Attendance</h2>
            <div className="flex flex-col mt-4">
              <label className="flex items-center text-purple-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="120"
                  checked={!!checkedValues[120]}
                  onChange={() => handleCheckboxChange(120)}
                />
                Live Dashboard
              </label>

              <div className="ml-6 grid grid-cols-1 gap-2">
                {[
                  { value: 3060, label: "Total Workforce" },
                  { value: 3061, label: "Present Workforce" },
                  { value: 3062, label: "Absent Workforce" },
                  { value: 3063, label: "Late arrivals" },
                  { value: 3064, label: "On Leave" },
                ].map((item) => (
                  <label key={item.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      value={item.value}
                      checked={!!checkedValues[item.value]}
                      onChange={() => handleCheckboxChange(item.value, 120)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center text-purple-600 mt-4">
              <input
                type="checkbox"
                className="mr-2"
                value="121"
                checked={!!checkedValues[121]}
                onChange={() => handleCheckboxChange(121)}
              />
              Time Management
            </label>
            <div className="ml-6 grid grid-cols-1 gap-2">
              {[
                { value: 3080, label: "Create Timetable" },
                { value: 3081, label: "Edit Timetable" },
                { value: 3082, label: "Delete Timetable" },
              ].map((item) => (
                <label key={item.value} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    value={item.value}
                    checked={!!checkedValues[item.value]}
                    onChange={() => handleCheckboxChange(item.value, 121)}
                  />
                  {item.label}
                </label>
              ))}
            </div>

            <label className="flex items-center text-purple-600 mt-4">
              <input
                type="checkbox"
                className="mr-2"
                value="122"
                checked={!!checkedValues[122]}
                onChange={() => handleCheckboxChange(122)}
              />
              Departmental Comparison
            </label>
            <div className="ml-6 grid grid-cols-1 gap-2">
              {[{ value: 3100, label: "Export CSV" }].map((item) => (
                <label key={item.value} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    value={item.value}
                    checked={!!checkedValues[item.value]}
                    onChange={() => handleCheckboxChange(item.value, 122)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Leave Management */}
        <div>
          <div className="border bg-gray-50 rounded-md p-4">
            <h2 className="text-lg font-bold">Leave Management</h2>

            <label className="flex items-center text-purple-600 mt-4">
              <input
                type="checkbox"
                className="mr-2"
                value="141"
                checked={!!checkedValues[141]}
                onChange={() => handleCheckboxChange(141)}
              />
              Employee Leave Management
            </label>
            <div className="ml-6 grid grid-cols-1 gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="3300"
                  checked={!!checkedValues[3300]}
                  onChange={() => handleCheckboxChange(3300, 141)}
                />
                Reset leave count
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="3310"
                  checked={!!checkedValues[3310]}
                  onChange={() => handleCheckboxChange(3310, 141)}
                />
                Add Leave Quota
              </label>
            </div>

            <label className="flex items-center text-purple-600 mt-4">
              <input
                type="checkbox"
                className="mr-2"
                value="142"
                checked={!!checkedValues[142]}
                onChange={() => handleCheckboxChange(142)}
              />
              Leave Approval process
            </label>
            <div className="ml-6 grid grid-cols-1 gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="3400"
                  checked={!!checkedValues[3400]}
                  onChange={() => handleCheckboxChange(3400, 142)}
                />
                Leaves taken
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="3401"
                  checked={!!checkedValues[3401]}
                  onChange={() => handleCheckboxChange(3401, 142)}
                />
                Export CSV
              </label>
            </div>

            <label className="flex items-center text-purple-600 mt-4">
              <input
                type="checkbox"
                className="mr-2"
                value="143"
                checked={!!checkedValues[143]}
                onChange={() => handleCheckboxChange(143)}
              />
              Date Restrictions
            </label>
            <div className="ml-6 grid grid-cols-1 gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="3410"
                  checked={!!checkedValues[3410]}
                  onChange={() => handleCheckboxChange(3410, 143)}
                />
                Add Restrictions Date
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="3420"
                  checked={!!checkedValues[3420]}
                  onChange={() => handleCheckboxChange(3420, 143)}
                />
                Delete Restrictions Date
              </label>
            </div>

            <label className="flex items-center text-purple-600 mt-4">
              <input
                type="checkbox"
                className="mr-2"
                value="144"
                checked={!!checkedValues[144]}
                onChange={() => handleCheckboxChange(144)}
              />
              Leave Request
            </label>
            <div className="ml-6 grid grid-cols-1 gap-2">
              {[
                { value: 3500, label: "Received Leave Requests" },
                { value: 3501, label: "Accepted Leave Requests" },
                { value: 3502, label: "Rejected Leave Requests" },
                { value: 3503, label: "Employee Information" },
                { value: 3504, label: "Leaves taken" },
                { value: 3505, label: "Action" },
                { value: 3506, label: "Leave Request Export CSV" },
              ].map((item) => (
                <label key={item.value} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    value={item.value}
                    checked={!!checkedValues[item.value]}
                    onChange={() => handleCheckboxChange(item.value, 144)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
            <label className="flex items-center text-purple-600 mt-4">
              <input
                type="checkbox"
                className="mr-2"
                value="146"
                checked={!!checkedValues[146]}
                onChange={() => handleCheckboxChange(146)}
              />
              Current Leave Balance Reports
            </label>
            <div className="ml-6 grid grid-cols-1 gap-2">
              {[
                { value: 3510, label: "Remaining Leaves" },
                { value: 3511, label: "Leave Balance Export CSV" },
              ].map((item) => (
                <label key={item.value} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    value={item.value}
                    checked={!!checkedValues[item.value]}
                    onChange={() => handleCheckboxChange(item.value, 146)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Reports */}
        <div>
          <div className="border bg-gray-50 rounded-md p-4">
            <h2 className="text-lg font-bold">Reports</h2>

            <label className="flex items-center text-purple-600 mt-4">
              <input
                type="checkbox"
                className="mr-2"
                value="160"
                checked={!!checkedValues[160]}
                onChange={() => handleCheckboxChange(160)}
              />
              Absence Report
            </label>
            <div className="ml-6 grid grid-cols-1 gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="3520"
                  checked={!!checkedValues[3520]}
                  onChange={() => handleCheckboxChange(3520, 160)}
                />
                Export CSV
              </label>
            </div>

            <label className="flex items-center text-purple-600 mt-4">
              <input
                type="checkbox"
                className="mr-2"
                value="161"
                checked={!!checkedValues[161]}
                onChange={() => handleCheckboxChange(161)}
              />
              Summary Report
            </label>
            <label className="flex items-center text-purple-600 mt-4">
              <input
                type="checkbox"
                className="mr-2"
                value="162"
                checked={!!checkedValues[162]}
                onChange={() => handleCheckboxChange(162)}
              />
              Check-In Check-Out Reports
            </label>
            <div className="ml-6 grid grid-cols-1 gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="3530"
                  checked={!!checkedValues[3530]}
                  onChange={() => handleCheckboxChange(3530, 162)}
                />
                Export CSV
              </label>
            </div>
            <label className="flex items-center text-purple-600 mt-4">
              <input
                type="checkbox"
                className="mr-2"
                value="163"
                checked={!!checkedValues[163]}
                onChange={() => handleCheckboxChange(163)}
              />
              Attendance History Report
            </label>
          </div>
        </div>

        {/* Settings */}
        <div>
          <div className="border bg-gray-50 rounded-md p-4">
            <h2 className="text-lg font-bold">Settings</h2>
            <div className="flex flex-col mt-4">
              <label className="flex items-center text-purple-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="180"
                  checked={!!checkedValues[180]}
                  onChange={() => handleCheckboxChange(180)}
                />
                User Management
              </label>

              <div className="ml-6 grid grid-cols-1 gap-2">
                {[
                  { value: 3540, label: "Create user account" },
                  { value: 3541, label: "Edit User" },
                  { value: 3542, label: "Delete User" },
                ].map((item) => (
                  <label key={item.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      value={item.value}
                      checked={!!checkedValues[item.value]}
                      onChange={() => handleCheckboxChange(item.value, 180)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>

              <label className="flex items-center text-purple-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="181"
                  checked={!!checkedValues[181]}
                  onChange={() => handleCheckboxChange(181)}
                />
                Role Management
              </label>
              <div className="ml-6 grid grid-cols-1 gap-2">
                {[
                  { value: 3550, label: "Create new permission" },
                  { value: 3551, label: "Edit role" },
                  { value: 3552, label: "Delete role" },
                ].map((item) => (
                  <label key={item.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      value={item.value}
                      checked={!!checkedValues[item.value]}
                      onChange={() => handleCheckboxChange(item.value, 181)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>

              <label className="flex items-center text-purple-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="182"
                  checked={!!checkedValues[182]}
                  onChange={() => handleCheckboxChange(182)}
                />
                Supervisor
              </label>
              <div className="ml-6 grid grid-cols-1 gap-2">
                {[{ value: 3560, label: "Action" }].map((item) => (
                  <label key={item.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      value={item.value}
                      checked={!!checkedValues[item.value]}
                      onChange={() => handleCheckboxChange(item.value, 182)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
              <label className="flex items-center text-purple-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  value="183"
                  checked={!!checkedValues[183]}
                  onChange={() => handleCheckboxChange(183)}
                />
                Designation & Department
              </label>
              <div className="ml-6 grid grid-cols-1 gap-2">
                {[
                  { value: 3570, label: "Edit" },
                  { value: 3580, label: "Delete" },
                ].map((item) => (
                  <label key={item.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      value={item.value}
                      checked={!!checkedValues[item.value]}
                      onChange={() => handleCheckboxChange(item.value, 183)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showSuccessMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p>Role Update successfully!</p>
          </div>
        </div>
      )}

      {/* // button section */}
      <div className="flex gap-5 mt-10 text-center">
        <button
          className="text-purple-600 bg-white border border-black px-4  py-2 rounded-md shadow-sm "
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-[#8764A0] text-white rounded-md shadow-sm hover:bg-purple-600"
          onClick={handleUpdate}
        >
          Update
        </button>
      </div>
    </div>
  );
};
export default Create_new_permission;
