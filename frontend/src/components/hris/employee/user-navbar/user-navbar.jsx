import React, { useState } from "react";
import { FaUser } from "react-icons/fa";
import { IoIosArrowDown, IoMdCloseCircle } from "react-icons/io";
import { BiLogOutCircle } from "react-icons/bi";
import Logo from "../../../../assets/logo.png";
import Reset_Pw from "../../employee/dashbaord/reset_password";
import Hi from "../../../../assets/hi.png";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleLogout = () => {
    // Clear local storage
    localStorage.clear();
    // Clear cache and redirect to login
    window.location.href = "/login?cache_buster=" + new Date().getTime();
  };

  return (
    <div>
      <div className="flex justify-center mt-[69px] font-sans">
        <div className="shadow-lg bg-white w-[1600px] h-[83px] rounded-[24px] ">
          <div className="flex justify-between items-center mt-3 px-4">
            {/* logo */}
            <div>
              <img src={Logo} alt="logo" className="h-[70px] w-[80px]" />
            </div>

            {/* user */}
            <div className="flex items-center gap-5">
              <div>
                <FaUser className="w-[20px] h-[20px]" />
              </div>

              <div>
                <p>First Name</p>
                <p>Second Name</p>
              </div>

              <div
                className="ml-4"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <IoIosArrowDown className="w-[24px] h-[21px] cursor-pointer" />
                {showDropdown && (
                  <div className="absolute bg-white rounded-[30px] shadow-lg mt-1">
                    {/* Dropdown content */}
                    <p
                      className="py-2 cursor-pointer px-4 hover:bg-primary_purple hover:text-white  hover:rounded-t-2xl"
                      onClick={() => setShowPopup(true)}
                    >
                      Reset Password
                    </p>

                    <p className="py-2 cursor-pointer px-4 hover:bg-primary_purple hover:text-white">
                      User Profile
                    </p>

                    <p
                      className="py-2 cursor-pointer px-4 hover:bg-primary_purple hover:rounded-b-2xl hover:text-white"
                      onClick={handleLogout}
                    >
                      Log Out
                    </p>
                  </div>
                )}
              </div>

              <div className="ml-4">
                <BiLogOutCircle
                  className="w-[24px] h-[21px] cursor-pointer"
                  onClick={handleLogout}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup for Reset Password */}
      {showPopup && (
        <div className="fixed top-0 justify-center left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center z-50">
          <Reset_Pw onClose={() => setShowPopup(false)} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
