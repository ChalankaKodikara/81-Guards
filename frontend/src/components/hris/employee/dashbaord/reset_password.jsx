import React, { useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";

const ResetPassword = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    // Validate passwords and send data to backend
    const formData = {
      oldPassword,
      newPassword,
      confirmPassword,
    };
    console.log(formData); // Replace with actual backend API call
    // After submitting, close the popup
    onClose();
  };

  return (
    <div className="fixed ">
      <div className="bg-white rounded-lg p-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-10">
            <div>
              <p className="text-primary_purple text-[40px] font-semibold mb-5">
                Reset Password
              </p>
            </div>
            <div>
              <IoMdCloseCircle
                className="w-8 h-8 cursor-pointer"
                onClick={onClose}
              />
            </div>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit}>
            <div>
              <label className="text-primary_purple font-semibold text-[20px]">
                Old Password
              </label>
              <input
                type="password"
                className="w-full h-[35px] border border-black rounded-xl"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="mt-2">
              <label className="text-primary_purple font-semibold text-[20px]">
                New Password
              </label>
              <input
                type="password"
                className="w-full h-[35px] border border-black rounded-xl"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="mt-2">
              <label className="text-primary_purple font-semibold text-[20px]">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full h-[35px] border border-black rounded-xl"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                className="bg-[#3D0B5E] p-3 text-white font-semibold rounded-lg"
              >
                Done
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
