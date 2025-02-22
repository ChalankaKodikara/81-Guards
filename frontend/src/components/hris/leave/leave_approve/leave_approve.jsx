import React, { useState,useEffect } from "react";
import Navbar from "./../../navbar/navbar";
import moment from "moment";
import Leave_approve_table from "./leave_approve_table";


 const Leave_approve = () => {
 
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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="mx-10 mt-5 ">
 
      <div className="flex justify-between mt-6">
        <p className="text-[30px] font-semibold">Leave Information</p>
        <div className="flex gap-6 items-center">
          
       
        </div>
      </div>
      <div>
        <Leave_approve_table />
      </div>
    </div>
  );
};

export default Leave_approve;
