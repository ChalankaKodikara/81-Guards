/** @format */

import React, { useEffect, useState } from "react";
import Navbar from "../navbar/navbar";
import moment from "moment";
import usePermissions from "../../permissions/permission";

const Supervisors = () => {
  const [currentTime, setCurrentTime] = useState(moment().format("h:mm:ss a"));
  const [data, setData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { hasPermission } = usePermissions();
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format("h:mm:ss a"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchSupervisors();
  }, [currentPage, itemsPerPage]);

  const fetchSupervisors = () => {
    fetch(`${API_URL}/v1/hris/supervisors/getSupervisors`)
      .then((response) => response.json())
      .then((result) => {
        if (Array.isArray(result)) {
          setData(result);
        } else {
          console.error("Expected an array but got:", result);
          setData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setData([]);
      });
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this supervisor?"
    );
    if (confirmDelete) {
      fetch(
        `${API_URL}/v1/hris/supervisors/deleteSupervisor?supervisor_id=${id}`,
        {
          method: "DELETE",
        }
      )
        .then((response) => {
          if (response.ok) {
            console.log("Supervisor deleted successfully");
            fetchSupervisors(); // Refresh the list of supervisors
          } else {
            throw new Error("Failed to delete supervisor");
          }
        })
        .catch((error) => {
          console.error("Error deleting supervisor:", error);
        });
    }
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);

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
        <p className="text-[30px] font-semibold">Supervisors</p>
      </div>

      <div className="mt-5">
        <button
          className="px-5 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 w-60"
          onClick={togglePopup}
        >
          Create Supervisor
        </button>
      </div>

      {/* Table for Supervisors */}
      <div className="mt-5">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                Employee No
              </th>
              <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                Contact No
              </th>
              <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {item.supervisor_employee_no}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {item.supervisor_fullname}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {item.supervisor_email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {item.supervisor_contact_no}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>

                  {/* <button
                    onClick={() => handleViewMore(item.supervisor_id)}
                    className="ml-4 text-blue-500 hover:text-blue-700"
                  >
                    View More
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-500 opacity-50"></div>
          <div className="relative bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4 justify-center">
              Create Supervisor
            </h2>
            <form>
              <div className="grid grid-cols-2 gap-8">
                <div className="mb-4">
                  <label className="block text-gray-700">Employee ID</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md shadow-sm border border-black h-10"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Full Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md shadow-sm border border-black h-10"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-md shadow-sm border border-black h-10"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Contact No</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md shadow-sm border border-black h-10"
                    required
                  />
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                    onClick={togglePopup}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Supervisors;
