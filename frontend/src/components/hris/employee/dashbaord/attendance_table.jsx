import React, { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

const AttendanceTable = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const data = [
    {
      appliedDate: "05.08.2024",
      leaveType: "Medical Leave",
      requestedDate: "15.08.2024",
      status: "Pending",
    },
    // Add more data as needed
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mx-auto w-[80%] mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#3D0B5E]">
          Attendance Overview
        </h2>
        <div className="bg-primary_purple text-white py-2 px-4 rounded-full flex items-center gap-2">
          <i className="fas fa-calendar-alt"></i>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd-MMM-yyyy"
            className="bg-transparent text-white"
            popperPlacement="top-end"
          />
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="py-2 text-left text-sm font-semibold text-gray-600">
              Applied Date
            </th>
            <th className="py-2 text-left text-sm font-semibold text-gray-600">
              Leave Type
            </th>
            <th className="py-2 text-left text-sm font-semibold text-gray-600">
              Requested Date
            </th>
            <th className="py-2 text-left text-sm font-semibold text-gray-600">
              Status
            </th>
            <th className="py-2 text-left text-sm font-semibold text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index}>
              <td className="py-2">{item.appliedDate}</td>
              <td className="py-2">
                <span className="bg-[#E5DFF1] text-[#7D4CDB] py-1 px-3 rounded-full text-sm">
                  {item.leaveType}
                </span>
              </td>
              <td className="py-2">{item.requestedDate}</td>
              <td className="py-2">
                <span className="bg-[#E0E8F9] text-[#5A9CFC] py-1 px-3 rounded-full text-sm">
                  {item.status}
                </span>
              </td>
              <td className="py-2">
                <FaTrashAlt className="text-red-500 cursor-pointer" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
