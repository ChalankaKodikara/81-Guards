import React, { useState, useEffect } from "react";
import moment from "moment";
import { MdKeyboardArrowDown } from "react-icons/md";


import User_account_creation_table from "./user_account_creation_table";


const User_account_creation = () => {


  const currentDate = moment().format("MMMM Do YYYY");
  const [currentTime, setCurrentTime] = useState(moment().format("h:mm:ss a"));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format("h:mm:ss a"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [issetShowPopup, setShowPopup] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const handleCreateUserClick = () => {
    setShowPopup(true);
  };
  const handleClosePopup = () => {
    setShowPopup(false);
  };
  
 

  return (
    <div className="mx-10 mt-5 overflow-y-auto ">
     

      <div className="flex justify-between mt-6">
        <p className="text-[30px] font-semibold">User Account</p>
        <div className="flex gap-6 items-center">

          <div className="text-[20px] font-bold">{currentTime}</div>
        </div>
      </div>

   

      <div className="mt-5"></div>

      {/* table */}
      <div>
        <User_account_creation_table />
      </div>
     
    </div>
  );
};

export default User_account_creation;
