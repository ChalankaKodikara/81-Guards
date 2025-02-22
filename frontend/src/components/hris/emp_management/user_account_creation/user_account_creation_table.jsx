/** @format */

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Edit_user_popup from "./edit_user_popup";
import { CiSearch } from "react-icons/ci";
import { CiCirclePlus } from "react-icons/ci";
import User_account_popup from "./user_account_popup";
import usePermissions from "../../../permissions/permission";

const User_account_creation_table = () => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeeIdFilter, setEmployeeIdFilter] = useState("");
  const [employeeNameFilter, setEmployeeNameFilter] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const rowsPerPage = 15;
  const { hasPermission } = usePermissions();
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/v1/hris/user/getAllUsers`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error("Error fetching user data:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const filteredUsers = userData.filter((user) => {
    const matchesEmployeeId = user.employee_no
      .toLowerCase()
      .includes(employeeIdFilter.toLowerCase());
    const matchesEmployeeName = user.username
      .toLowerCase()
      .includes(employeeNameFilter.toLowerCase());
    return matchesEmployeeId && matchesEmployeeName;
  });

  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleEditPopup = (user) => {
    setSelectedUser(user);
    setIsEditOpen(!isEditOpen);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/v1/hris/user/deleteUser?id=${userToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Fetch the latest data
        fetchUserData();
        setIsDeleteConfirmOpen(false);
        setUserToDelete(null);
        if (isEditOpen) setIsEditOpen(false); // Close the edit popup if open
      } else {
        console.error("Error deleting user:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const cancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    const halfMaxVisiblePages = Math.floor(maxVisiblePages / 2);

    const startPage = Math.max(
      1,
      Math.min(
        currentPage - halfMaxVisiblePages,
        totalPages - maxVisiblePages + 1
      )
    );
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`mx-1 px-3 py-1 rounded-md ${
            currentPage === 1
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <span key="dots1" className="mx-1">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`mx-1 px-3 py-1 rounded-md ${
            currentPage === i
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="dots2" className="mx-1">
            ...
          </span>
        );
      }
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`mx-1 px-3 py-1 rounded-md ${
            currentPage === totalPages
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="p-4">
      <div className="mt-5 mb-5">
        <div className="px-5 py-2 bg-blue-500 text-white rounded-md shadow-sm w-60 hover:bg-blue-600">
          <div
            className="flex items-center justify-between"
            onClick={handleOpenModal}
          >
            <button>Create User Account</button>
            <div>
              <CiCirclePlus />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center mt-5">
            <div className="relative">
              <input
                className="border border-black rounded-xl p-2 pl-10 w-[325px]"
                placeholder="Search by ID"
                value={employeeIdFilter}
                onChange={(e) => setEmployeeIdFilter(e.target.value)}
              />
              <CiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
            </div>

            <div className="relative">
              <input
                className="border border-black rounded-xl p-2 pl-10 w-[325px]"
                placeholder="Search by name"
                value={employeeNameFilter}
                onChange={(e) => setEmployeeNameFilter(e.target.value)}
              />
              <CiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
              Employee Number
            </th>
            <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
              Employee Name
            </th>
            <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
              Username
            </th>
            <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
              Employee Type
            </th>
            <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentUsers.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-md">
                {user.employee_no}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-md">
                {user.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-md">
                {user.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-md">
                {user.user_role}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-md">
                {user.user_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-md">
                {user.employee_status}
              </td>
              <td className="flex items-center px-6 py-4 whitespace-nowrap text-sm font-medium gap-3 text-md">
                <button
                  className="text-blue-500 rounded-lg"
                  onClick={() => toggleEditPopup(user)}
                >
                  <FaEdit />
                </button>

                <FaTrashAlt
                  className="text-red-500 cursor-pointer inline"
                  onClick={() => handleDeleteClick(user)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center mt-4">{renderPagination()}</div>

      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Edit_user_popup
              user={selectedUser}
              onClose={() => setIsEditOpen(false)}
            />
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setIsEditOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200 bg-opacity-80 z-50">
          <div className="bg-white rounded-lg p-8">
            <User_account_popup onClose={handleCloseModal} />
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to delete this user?
            </h3>
            <div className="flex justify-end gap-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                onClick={cancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User_account_creation_table;
