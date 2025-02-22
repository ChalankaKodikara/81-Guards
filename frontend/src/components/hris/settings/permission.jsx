/** @format */

import React, { useState, useEffect } from "react";
import Navbar from "../navbar/navbar";
import moment from "moment";
import { CiSearch } from "react-icons/ci";
import { RiMenu5Fill } from "react-icons/ri";
import { CiCirclePlus } from "react-icons/ci";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Granted_permission_popup from "./granted_permission_popup";
import usePermissions from "../../permissions/permission";

const Permissions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [selectedUserRoleId, setSelectedUserRoleId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [currentTime, setCurrentTime] = useState(moment().format("h:mm:ss a"));

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [issetShowPopup, setShowPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // State for delete confirmation
  const [roleToDelete, setRoleToDelete] = useState(null); // State for role ID to be deleted
  const [searchInput, setSearchInput] = useState(""); // State for role-wise filtering
  const API_URL = process.env.REACT_APP_FRONTEND_URL;

  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const handleButtonClick = () => {
    setShowPermissionForm(true);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format("h:mm:ss a"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/v1/hris/user/roles`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }
  };

  const handleCreateUserClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const togglePopup = (user_role = null) => {
    setSelectedUserRoleId(user_role);
    setIsFormOpen(!isFormOpen);
  };

  const rowsPerPage = 5;

  const HandleOnEdit = (user_role) => {
    setIsEditOpen(!isEditOpen);
    navigate("/edit-user-permission", {
      state: { selectedRoleId: user_role },
    });
  };

  const confirmDelete = (user_role) => {
    setRoleToDelete(user_role);
    setShowConfirmDelete(true);
  };

  const HandleDelete = async () => {
    try {
      const response = await fetch(
        `${API_URL}/v1/hris/user/deleteUserRole?role_id=${roleToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      // Remove the role from the state after successful deletion
      setRoles(roles.filter((role) => role.id !== roleToDelete));
      setShowConfirmDelete(false);
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  // Calculate the total number of pages
  const filteredRoles = roles.filter((role) =>
    role.role_name.toLowerCase().includes(searchInput.toLowerCase())
  );
  const totalPages = Math.ceil(filteredRoles.length / rowsPerPage);

  const currentData = filteredRoles.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="mx-10 mt-5 overflow-y-auto ">
      <div className="flex justify-between mt-6">
        <p className="text-[30px] font-semibold">User Permissions</p>
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
        <div className="px-5 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 w-60">
          <div className="flex items-center justify-between">
            <Link to="/create-user-permission">
              <button>Create new permission </button>
            </Link>
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
                placeholder="Search by User Role"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)} // Update search input state
              />
              <CiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
            </div>
            <div>
              <button className="p-2 border border-black rounded-[12px]">
                <div className="flex gap-3 items-center">
                  Filter <RiMenu5Fill />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5"></div>
      {/* table */}
      <div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                Role Description
              </th>
              <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                Granted Permissions
              </th>
              <th className="px-6 py-3 text-left text-md font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-md">
                  {user.role_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-md">
                  {user.role_description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-md">
                  <button
                    className="text-black border-none"
                    onClick={() => togglePopup(user.id)}
                  >
                    Click Here
                  </button>
                </td>
                <td className="flex items-center px-6 py-4 whitespace-nowrap text-sm font-medium ap-10 text-md">
                  <div className="flex items-center gap-3">
                    <button
                      className="text-blue-500 rounded-lg gap-40"
                      onClick={() => HandleOnEdit(user)}
                    >
                      <FaEdit />
                    </button>

                    <FaTrashAlt
                      className="text-red-500 cursor-pointer inline"
                      onClick={() => confirmDelete(user.id)} // Corrected to trigger confirmation
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center py-3">
        <div>
          Showing{" "}
          {currentData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{" "}
          {currentPage * rowsPerPage > roles.length
            ? roles.length
            : currentPage * rowsPerPage}{" "}
          of {roles.length} roles
        </div>
        <div className="flex space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 border rounded-md ${
                currentPage === page ? "bg-gray-300" : "bg-white"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-3 rounded-lg shadow-lg">
            <Granted_permission_popup
              togglePopup={togglePopup}
              user_role={selectedUserRoleId}
            />
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this role?</p>
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md mr-2"
                onClick={HandleDelete}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => setShowConfirmDelete(false)}
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

export default Permissions;
