/** @format */

import React, { useState, useEffect } from "react";
import Leave_request_table from "./leave_request_table";
import moment from "moment";
import { RiUserReceived2Line } from "react-icons/ri";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { RxCrossCircled } from "react-icons/rx";

const Leave_Request = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");

  const [searchInput, setSearchInput] = useState("");
  const currentDate = moment().format("MMMM Do YYYY");
  const [currentTime, setCurrentTime] = useState(moment().format("h:mm:ss a"));

  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format("h:mm:ss a"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setIsDropdownOpen(false); // Close the dropdown after selection
  };
  // Fetch leave data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/v1/hris/leave/getleave`);
        const data = await response.json();
        console.log("Fetched Data:", data);
        setLeaveData(Array.isArray(data) ? data : []); // Ensure it's an array
      } catch (error) {
        console.error("Error fetching leave data:", error);
      }
    };
    fetchData();
  }, []);
  // Calculate counts
  const receivedLeaveCount = leaveData.length;
  const acceptedLeaveCount = leaveData.filter(
    (leave) => leave.approved_status_1 === "APPROVED"
  ).length;
  const rejectedLeaveCount = leaveData.filter(
    (leave) => leave.approved_status_1 === "REJECTED"
  ).length;
  const handleSearchChange = (e) => {
    console.log({ handleSearchChange });
    setSearchInput(e.target.value);
  };
  return (
    <div className="mx-10 mt-5">
      <div className="mt-6 flex justify-between">
        <div>
          <p className="text-[30px] font-semibold">Leave Request</p>

        </div>
      </div>
      <div className="flex justify-between items-center mt-5">
        <div className="border border-gray-300 rounded-lg p-5">
          <p className="text-[18px] font-semibold mb-10">Statistics</p>

          <div className="grid grid-cols-3 grid-flow-col gap-8 h-[90px] w-[1200px]">

            <div className="flex gap-3 items-center">
              <div className="text-4xl rounded-full p-2 bg-purple-100 text-purple-600"><RiUserReceived2Line />
              </div>
              <div>
                <div className="text-2xl font-semibold ">{receivedLeaveCount}</div>
                <div className="text-sm text-gray-500">Received Leave Requests</div>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <div className="text-4xl rounded-full p-2 bg-green-100 text-green-600"><IoShieldCheckmarkOutline />

              </div>
              <div>
                <div className="text-2xl font-semibold ">{acceptedLeaveCount}</div>
                <div className="text-sm text-gray-500">Accepted Leave Requests</div>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <div className="text-4xl rounded-full p-2 bg-red-100 text-red-600"><RxCrossCircled />

              </div>
              <div>
                <div className="text-2xl font-semibold ">{rejectedLeaveCount}</div>
                <div className="text-sm text-gray-500">Rejected Leave Requests</div>
              </div>
            </div>

          </div>
        </div>


      </div>

      <div className="mt-[5%]">
        <Leave_request_table searchInput={searchInput} />
      </div>
    </div>
  );
};
export default Leave_Request;