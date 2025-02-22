import React, { useState, useEffect } from "react";
import Navbar from "../../navbar/navbar";
import moment from "moment";
import { CiSearch } from "react-icons/ci";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the styles for DatePicker
import { FaCalendarAlt } from "react-icons/fa";

const HistoryLoginDetails = () => {
  const [historyData, setHistoryData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchNameQuery, setSearchNameQuery] = useState("");
  const [searchIDQuery, setSearchIDQuery] = useState("");
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8599/v1/hris/logs/login-logs"
        );
        const data = await response.json();
        setHistoryData(data);
      } catch (error) {
        console.error("Error fetching Login History data:", error);
      }
    };
    fetchData();
  }, []);

  // Filter data based on search query and date range
  const filteredData = historyData.filter(
    (employee) =>
      employee.username.toLowerCase().includes(searchNameQuery.toLowerCase()) &&
      employee.id.toString().includes(searchIDQuery) &&
      moment(employee.logged_time).isBetween(
        moment(startDate).startOf("day"),
        moment(endDate).endOf("day"),
        null,
        "[]"
      )
  );

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Get the data for the current page
  const currentData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Change page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 border rounded-md ${
            currentPage === i ? "bg-gray-300" : "bg-white"
          }`}
        >
          {i}
        </button>
      );
    }

    if (startPage > 1) {
      pageNumbers.unshift(
        <span key="start-ellipsis" className="px-3 py-1 border rounded-md">
          ...
        </span>
      );
      pageNumbers.unshift(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 border rounded-md ${
            currentPage === 1 ? "bg-gray-300" : "bg-white"
          }`}
        >
          1
        </button>
      );
    }

    if (endPage < totalPages) {
      pageNumbers.push(
        <span key="end-ellipsis" className="px-3 py-1 border rounded-md">
          ...
        </span>
      );
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 border rounded-md ${
            currentPage === totalPages ? "bg-gray-300" : "bg-white"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="mx-10 mt-5">
      <Navbar />
      {/* second layer */}
      <div className="flex justify-between items-center mt-6">
        <div>
          <p className="text-[30px] font-semibold">History Login Details </p>
          
        </div>
        <div className="flex gap-6 items-center">
          <div>
            <div className="text-[#3D0B5E] text-[20px] font-bold">
              {moment().format("MMMM Do YYYY")}
            </div>
          </div>
          <div className="text-[20px] font-bold">
            {moment().format("h:mm:ss a")}
          </div>
        </div>
      </div>
      {/* third layer */}
      <div className="mt-5">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <input
                className="border border-black rounded-xl p-2 pl-10 w-[200px]"
                placeholder="Search by name"
                value={searchNameQuery}
                onChange={(e) => setSearchNameQuery(e.target.value)}
              />
              <CiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
            </div>
            <div className="relative">
              <input
                className="border border-black rounded-xl p-2 pl-10 w-[150px]"
                placeholder="Search by ID"
                value={searchIDQuery}
                onChange={(e) => setSearchIDQuery(e.target.value)}
              />
              <CiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>
          <div className="relative flex items-center gap-3 ">
            {/* Date selection section */}
            <div className="flex items-center space-x-2 bg-white rounded-[20px] px-4 py-2 shadow-sm border border-black">
              <FaCalendarAlt className="h-5 w-5 text-gray-400" />
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="d MMM, yyyy"
                className="text-sm text-gray-600 focus:outline-none"
              />
              <span className="text-gray-400">-</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="d MMM, yyyy"
                className="text-sm text-gray-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="p-4 mt-10">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                  Employee Name
                </th>
                <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                  Login Time
                </th>
                <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                  Logout Time
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                    {employee.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">
                    {employee.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                    {employee.logged_time
                      ? moment(employee.logged_time).format(
                          "MMMM Do YYYY, h:mm a"
                        )
                      : ""}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-md text-gray-500">
                    {employee.logout_time
                      ? moment(employee.logout_time).format(
                          "MMMM Do YYYY, h:mm a"
                        )
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex justify-between items-center py-3">
            <div>
              Showing{" "}
              {currentData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}{" "}
              to{" "}
              {currentPage * rowsPerPage > filteredData.length
                ? filteredData.length
                : currentPage * rowsPerPage}{" "}
              of {filteredData.length} employees
            </div>
            <div className="flex space-x-2">{renderPageNumbers()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryLoginDetails;
