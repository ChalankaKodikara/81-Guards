import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EditUserPopup = ({ user, onClose }) => {
  const [employeeNo, setEmployeeNo] = useState(user?.employee_no || "");
  const [employeeName, setEmployeeName] = useState(
    user?.employee_fullname || ""
  );
  const [username, setUsername] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [employeeStatus, setEmployeeStatus] = useState(
    user?.employee_status || "ACTIVE"
  );
  const [userRole, setUserRole] = useState(user?.user_role || "");
  const [userType, setUserType] = useState(user?.user_type || ""); // Added employee type state
  const [roles, setRoles] = useState([]);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  const navigate = useNavigate();

  // Fetch roles from API on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(
          `${API_URL}/v1/hris/user/roles`
        );
        if (response.ok) {
          const data = await response.json();
          setRoles(data);
        } else {
          console.error("Error fetching roles:", response.status);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchRoles();
  }, []);

  const handleResetPasswordClick = () => {
    setShowResetPassword(!showResetPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const requestBody = {
      employee_no: employeeNo,
      username: username,
      password: password || undefined,
      employee_status: employeeStatus,
      user_role: userRole !== "" ? userRole : null,
      user_type: userType,
    };
  
    try {
      const response = await fetch(
        `${API_URL}/v1/hris/user/updateUser?id=${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
  
      // Check response content type
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const jsonResponse = await response.json();
        if (response.ok) {
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
            navigate("/create-user-account");
          }, 2000);
          if (onClose) onClose();
        } else {
          alert(`Error updating user: ${jsonResponse.error}`);
        }
      } else {
        const rawResponse = await response.text();
        console.error("Non-JSON Response:", rawResponse);
        alert("Unexpected server response. Please contact support.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user. Please try again later.");
    }
  };
  
  

  return (
    <div className="flex justify-center items-center bg-gray-100 h-full">
      <div className="bg-white p-8 rounded-lg w-full">
        <h2 className="text-2xl font-semibold mb-6">Edit User Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="items-center gap-8">
            <div className="grid grid-cols-2 gap-y-[30px] gap-x-[60px] text-[20px]">
              <div>
                <label className="block text-gray-700">Employee ID</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded mt-2"
                  value={employeeNo}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700">Employee Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded mt-2"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700">Username</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded mt-2"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700">Employee Type</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded mt-2"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)} // Add handler
                />
              </div>

              <div>
                <label className="block text-gray-700">Role</label>
                <select
                  className="w-full border border-gray-300 p-2 rounded mt-2"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={handleResetPasswordClick}
              className="text-[#8764A0] font-bold p-3 rounded-[40px] border"
            >
              Reset Password
            </button>
          </div>

          {showResetPassword && (
            <div className="mt-5">
              <label className="block text-gray-700">New Password</label>
              <input
                type="password"
                className="w-[50%] border border-gray-300 p-2 rounded mt-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <div className="mt-1">
            <div className="flex items-center justify-between px-4 py-2">
              <button
                type="submit"
                className="bg-[#8764A0] border border-black text-white px-4 py-2 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
      {showSuccessMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p>User updated successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditUserPopup;
