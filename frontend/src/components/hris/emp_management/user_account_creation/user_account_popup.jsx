import React, { useState, useEffect } from "react";

const UserAccountPopup = ({ onClose }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [userType, setUserType] = useState(""); // Updated to dropdown selection
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Construct the payload
    const payload = {
      employee_no: employeeId,
      username,
      password,
      user_role: selectedRole ? parseInt(selectedRole, 10) : "",
      user_type: userType, // Include dropdown selection
    };

    try {
      // Send the POST request
      const response = await fetch(
        `${API_URL}/v1/hris/user/createUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("User created successfully:", result);
        setSuccessMessage("User created successfully!");
        setShowSuccessPopup(true);
        setEmployeeId("");
        setUsername("");
        setPassword("");
        setSelectedRole("");
        setUserType("");
      } else {
        const errorData = await response.json();
        setErrorMessage(
          `Error creating user: ${errorData.message || response.status}`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 h-full">
      <div className="bg-white p-8 rounded-lg w-full relative">
        <h2 className="text-2xl font-semibold mb-6">Create User Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="items-center gap-8">
            <div className="grid grid-cols-2 gap-y-[30px] gap-x-[60px] text-[20px]">
              <div>
                <label className="block text-gray-700">Employee ID</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded mt-2"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
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
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 p-2 rounded mt-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700">Role</label>
                <select
                  className="w-full border border-gray-300 p-2 rounded mt-2"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Employee Type</label>
                <select
                  className="w-full border border-gray-300 p-2 rounded mt-2"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                >
                  <option value="">Select Employee Type</option>
                  <option value="superadmin">Superadmin</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>
          {errorMessage && (
            <div className="mt-4 text-red-500 text-center">{errorMessage}</div>
          )}
          <div className="mt-10">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="gap-4 flex">
                <button
                  type="button"
                  className="text-purple-600 bg-white border border-black px-4 py-2 rounded-xl"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 border border-black text-white px-4 py-2 rounded-xl"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </form>
        {showSuccessPopup && (
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="bg-[#8764A0] text-white p-6 rounded-lg">
              <h3>{successMessage}</h3>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="mt-4 bg-white text-red-500 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAccountPopup;
