import React, { useState, useEffect } from "react";
import Navbar from "../navbar/navbar";
import moment from "moment";
import Checkin_checkout_report_table from "./checking_checkout_report_table";

const Checkin_checkout_report = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentDate = moment().format("MMMM Do YYYY");
  const [currentTime, setCurrentTime] = useState(moment().format("h:mm:ss a"));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format("h:mm:ss a"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Change page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const handleSelectRow = (index) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(index)
        ? prevSelectedRows.filter((i) => i !== index)
        : [...prevSelectedRows, index]
    );
  };

  return (
    <div className="mx-10 mt-5  overflow-y-auto">
      <div className="overflow-x-hidden ">
        {/* second layer */}
        <div className="flex justify-between items-center mt-6">
          <div>
            <p className="text-[30px] font-semibold">
              Check in – Check out Report{" "}
            </p>
           
          </div>
        </div>
      </div>

      <div>
        <Checkin_checkout_report_table />
      </div>
    </div>
  );
};

export default Checkin_checkout_report;
