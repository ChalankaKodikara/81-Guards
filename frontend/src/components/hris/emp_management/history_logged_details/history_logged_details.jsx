import React, { useState, useEffect } from "react";
import moment from "moment";
import { CiSearch } from "react-icons/ci";
import "react-datepicker/dist/react-datepicker.css";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { MdOutlineFileDownload } from "react-icons/md";
const History_Logged_Details = () => {
  const [historyData, setHistoryData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [searchID, setSearchID] = useState("");
  const rowsPerPage = 5;

  const API_URL = process.env.REACT_APP_FRONTEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/v1/hris/logs/audit-logs`);
        const data = await response.json();
        setHistoryData(data);
      } catch (error) {
        console.error("Error fetching Audit Logs data:", error);
      }
    };
    fetchData();
  }, [API_URL]);

  const filteredData = historyData.filter(
    (log) =>
      log.editor.toLowerCase().includes(searchName.toLowerCase()) &&
      log.employee_no.toString().includes(searchID) &&
      (!startDate ||
        !endDate ||
        moment(log.edit_timestamp).isBetween(
          moment(startDate).startOf("day"),
          moment(endDate).endOf("day"),
          null,
          "[]"
        ))
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const exportToCSV = () => {
    const csvData = filteredData.map((log) => ({
      ID: log.id,
      Editor: log.editor,
      "Edited Timestamp": moment(log.edit_timestamp).format("D-MMM-YY, h:mm a"),
      "Employee Number": log.employee_no,
      "Field Name": log.field_name,
      "Old Value": log.old_value,
      Department: log.department,
      "New Value": log.new_value,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "history_logged_details.csv");
  };

  return (
    <div className="mx-10 mt-5">
      <div className="flex justify-between items-center mt-6">
        <div>
          <p className="text-[30px] font-semibold">Employee Edit Details</p>
          
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <input
                className="border border-black rounded-xl p-2 pl-10 w-[200px]"
                placeholder="Search by name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              <CiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
            </div>
            <div className="relative">
              <input
                className="border border-black rounded-xl p-2 pl-10 w-[150px]"
                placeholder="Search by ID"
                value={searchID}
                onChange={(e) => setSearchID(e.target.value)}
              />
              <CiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <div className="relative flex items-center gap-3">

            <button
              className="px-4 py-2 text-white bg-[#2495FE] bg-opacity-55 rounded hover:bg-blue-600 flex justify-end mb-2"
              onClick={exportToCSV}
            >
              <div className="flex items-center gap-3 justify-end">
                <div>
                  <MdOutlineFileDownload />
                </div>
                <div className="z-1000">Export</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mt-10">
        <div className="table-container">
          <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-900">Editor</th>
                <th className="px-6 py-4 font-medium text-gray-900">Edited Timestamp</th>
                <th className="px-6 py-4 font-medium text-gray-900">Employee Number</th>
                <th className="px-6 py-4 font-medium text-gray-900">Field Name</th>
                <th className="px-6 py-4 font-medium text-gray-900">Old Value</th>
                <th className="px-6 py-4 font-medium text-gray-900">Department</th>
                <th className="px-6 py-4 font-medium text-gray-900">New Value</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{log.editor || "null"}</td>
                    <td className="px-6 py-4">
                      {moment(log.edit_timestamp).format("YYYY-MM-DD, h:mm a")}
                    </td>
                    <td className="px-6 py-4">{log.employee_no || "null"}</td>
                    <td className="px-6 py-4">{log.field_name || "null"}</td>
                    <td className="px-6 py-4">{log.old_value || "null"}</td>
                    <td className="px-6 py-4">{log.department || "null"}</td>
                    <td className="px-6 py-4">{log.new_value || "null"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 text-center" colSpan={7}>
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button
          className={`px-3 py-1 mx-1 rounded ${currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"}`}
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`px-3 py-1 mx-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className={`px-3 py-1 mx-1 rounded ${currentPage === totalPages ? "bg-gray-300" : "bg-blue-500 text-white"}`}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default History_Logged_Details;
