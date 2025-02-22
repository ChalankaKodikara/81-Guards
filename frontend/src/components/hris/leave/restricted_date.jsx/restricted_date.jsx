/** @format */

import React, { useState, useEffect } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./calendar.css";
import { registerLocale } from "react-datepicker";
import enGB from "date-fns/locale/en-GB";
import Modal from "react-modal";
import usePermissions from "../../../permissions/permission";
import "animate.css";

registerLocale("en-GB", enGB);

Modal.setAppElement("#root");

const Restricted_Date = () => {
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false); // New delete confirmation modal
  const [restrictedDates, setRestrictedDates] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectionModalIsOpen, setSelectionModalIsOpen] = useState(false); // New modal for selection
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRid, setSelectedRid] = useState(null);
  const [reason, setReason] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // State to store success messages
  const [canDelete, setCanDelete] = useState(false); // To manage delete action
  const currentDate = moment().format("MMMM Do YYYY");
  const [currentTime, setCurrentTime] = useState(moment().format("h:mm:ss a"));
  const { hasPermission } = usePermissions();
  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  const [specialDayModalIsOpen, setSpecialDayModalIsOpen] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format("h:mm:ss a"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchRestrictedDates = async () => {
      try {
        const response = await fetch(
          `${API_URL}/v1/hris/daterestriction/getAllDataRestrictions`
        );
        const data = await response.json();
        const formattedData = data.map((item) => ({
          rid: item.rid,
          date: new Date(item.restricted_dates),
          reason: item.reason_for_restriction,
          restriction_datetype: item.restriction_datetype,
        }));
        setRestrictedDates(formattedData);
      } catch (error) {
        console.error("Error fetching restricted dates:", error);
      }
    };

    fetchRestrictedDates();
  }, []);

  const handleDateChange = (date) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    setSelectedDate(dateString);

    const existingDate = restrictedDates.find((d) =>
      moment(d.date).isSame(moment(date), "day")
    );

    if (existingDate) {
      // If date exists, set the relevant states and open delete confirmation modal
      setReason(existingDate.reason);
      setSelectedRid(existingDate.rid);
      setDeleteModalIsOpen(true); // Open delete confirmation modal
    } else {
      // If date does not exist, open the selection modal
      setReason("");
      setSelectedRid(null);
      setSelectionModalIsOpen(true);
    }
  };

  const handleSelection = (type) => {
    setSelectionModalIsOpen(false);
    if (type === "Restriction") {
      setModalIsOpen(true);
    } else if (type === "Special Day") {
      setSpecialDayModalIsOpen(true);
    }
  };

  const saveSpecialDay = async () => {
    const data = {
      special_date: selectedDate,
      reason_for_special_day: reason,
    };

    try {
      const response = await fetch(`${API_URL}/v1/hris/leave/addSpecialDay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Save response:", result);

        setRestrictedDates((prev) => [
          ...prev,
          { date: selectedDate, reason, rid: result.rid, type: "Special Day" },
        ]);

        setSuccessMessage("Special Day saved successfully!");
        setSpecialDayModalIsOpen(false); // Close the modal
      } else {
        const errorText = await response.text();
        console.error("Failed to save special day:", errorText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const closeModalAfterDelay = () => {
    setTimeout(() => {
      setModalIsOpen(false);
      setSuccessMessage(""); // Clear the success message
    }, 2000); // Close modal after 2 seconds
  };

  const saveDate = async (type) => {
    if (!selectedDate) {
      setSuccessMessage("Please select a date before saving.");
      return;
    }

    // Map "Special Day" to "Holiday" for backend compatibility
    const restrictionType = type === "Special Day" ? "Holiday" : type;

    const data = {
      restricted_date: selectedDate,
      reason_for_restriction: reason || "No reason provided",
      restriction_datetype: restrictionType, // Send "Holiday" or "Restricted"
    };

    try {
      const response = await fetch(
        `${API_URL}/v1/hris/leave/addRestrictedDate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Save response:", result);

        setRestrictedDates((prev) => [
          ...prev,
          {
            date: new Date(selectedDate),
            reason,
            rid: result.rid,
            restriction_datetype: restrictionType,
          },
        ]);

        setSuccessMessage(`${type} date added successfully!`);
        setModalIsOpen(false);
        setSpecialDayModalIsOpen(false);
      } else {
        const errorText = await response.json();
        console.error(`Failed to add ${type} date:`, errorText);
        setSuccessMessage(`Error: ${errorText.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setSuccessMessage(`An error occurred while saving the ${type} date.`);
    }
  };

  const deleteDate = async () => {
    if (!selectedRid) {
      console.error("No rid available for deletion.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/v1/hris/daterestriction/deleteDataRestrictions?id=${selectedRid}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("Delete response:", await response.json());

        // Remove the deleted date from the state
        setRestrictedDates((prev) => prev.filter((d) => d.rid !== selectedRid));

        setSuccessMessage("Successfully deleted the date!");
        setDeleteModalIsOpen(false); // Close the delete modal
      } else {
        const errorText = await response.text();
        console.error("Failed to delete restricted date:", errorText);
        setSuccessMessage("Failed to delete the date.");
      }
    } catch (error) {
      console.error("Error deleting the date:", error);
      setSuccessMessage("An error occurred while deleting the date.");
    }
  };

  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const rowsPerPage = 5; // Number of rows per page

  const currentData = restrictedDates.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(restrictedDates.length / rowsPerPage);
  // Determine the pages to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + 4, totalPages);

    if (end - start < 4) {
      start = Math.max(end - 4, 1);
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  return (
    <div className="mx-10 mt-5 overflow-y-auto h-screen">
      <div className="">
        <div className="flex justify-between mt-6">
          <div>
            <p className="text-[30px] font-semibold">Date Restrictions</p>
          </div>
        </div>

        <div className="flex justify-between items-center mx-[5%] mt-10">
          <div>
            <h2 className="text-red-500 text-[35px] font-bold text-center">
              Restricted Dates
            </h2>
            <div className="flex justify-center mt-5 animate__slideInUp animate__animated">
              <DatePicker
                inline
                selected={null}
                onChange={handleDateChange}
                highlightDates={restrictedDates.map((d) => d.date)} // Pass only dates
                locale="en-GB"
                dayClassName={(date) => {
                  const restrictedDate = restrictedDates.find((d) =>
                    moment(d.date).isSame(moment(date), "day")
                  );

                  if (restrictedDate?.restriction_datetype === "Restricted") {
                    return "restricted-day"; // CSS class for restricted dates
                  }
                  if (restrictedDate?.restriction_datetype === "Holiday") {
                    return "special-day"; // CSS class for special days
                  }
                  return undefined; // Default
                }}
                renderCustomHeader={({
                  monthDate,
                  decreaseMonth,
                  increaseMonth,
                }) => (
                  <div className="flex justify-between mb-2">
                    <button onClick={decreaseMonth}>&lt;</button>
                    <span>{moment(monthDate).format("MMMM YYYY")}</span>
                    <button onClick={increaseMonth}>&gt;</button>
                  </div>
                )}
              />
            </div>
          </div>
          <div className="animate__slideInRight animate__animated ml-[80px]">
            <h3 className="text-purple-700 text-[35px] font-semibold">
              Instructions
            </h3>
            <ul className="list-disc ml-5 mt-2">
              <li>
                Click on the required date on the calendar to lock the date and
                continue the restricting
              </li>
              <li>
                To Update a restriction, click on the specific date and update
                the status.
              </li>
              <li>
                To Delete a restriction, click on the specific date and select
                delete restriction. Press Confirm on the Confirmation Screen.
              </li>
            </ul>
            <div className="mt-5">
              <div className="flex items-center">
                <div className="bg-red-500 w-6 h-6 mr-2"></div>
                <span>Restricted Date</span>
              </div>
              <div className="flex items-center mt-2">
                <div className="bg-gray-300 w-6 h-6 mr-2"></div>
                <span>Available Date</span>
              </div>
              <div className="flex items-center mt-2">
                <div className="bg-[#ffd700] w-6 h-6 mr-2"></div>
                <span>Special Date</span>
              </div>
            </div>
          </div>
        </div>
        <Modal
          isOpen={selectionModalIsOpen}
          onRequestClose={() => setSelectionModalIsOpen(false)}
          contentLabel="Select Date Type"
          className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50"
          overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-75"
        >
          <div className="bg-white text-black p-5 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold ">Please select the</h2>
              <button
                onClick={() => setSelectionModalIsOpen(false)}
                className="font-bold text-xl bg-red-600 p-1 rounded-full text-white"
              >
                &times;
              </button>
            </div>
            <h2 className="text-xl font-bold mb-4 ">assigning date type</h2>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => handleSelection("Special Day")}
                className="bg-orange-500 text-white px-4 py-2 rounded-md"
              >
                Special Day
              </button>
              <button
                onClick={() => handleSelection("Restriction")}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Restriction
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={deleteModalIsOpen}
          onRequestClose={() => setDeleteModalIsOpen(false)}
          contentLabel="Delete Restricted Date"
          className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50"
          overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-75"
        >
          <div className="bg-white text-black p-5 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Delete Restricted Date</h2>
            <p>Are you sure you want to delete this restricted date?</p>
            <p className="mt-2 text-red-500 font-semibold">
              {moment(selectedDate).format("DD/MM/YYYY")}
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setDeleteModalIsOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={deleteDate}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>

        {/* Existing Restriction Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          contentLabel="Restricted Date"
          className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50"
          overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-75"
        >
          <div className="bg-white text-black p-5 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">Restricted Date</h2>

            {successMessage && (
              <p className="text-green-500 text-lg font-semibold mb-4">
                {successMessage}
              </p>
            )}

            <label htmlFor="reason" className="block mb-2">
              Reasons:
              <input
                type="text"
                id="reason"
                name="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded-md text-black w-full"
              />
            </label>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setModalIsOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
              >
                Cancel
              </button>

              <button
                onClick={() => saveDate("Restricted")}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Save Restriction
              </button>

              <button
                onClick={deleteDate}
                className="bg-red-500 text-white px-4 py-2 rounded-md ml-2"
                disabled={!canDelete} // Disable delete if not allowed
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={specialDayModalIsOpen}
          onRequestClose={() => setSpecialDayModalIsOpen(false)}
          contentLabel="Special Day"
          className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50"
          overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-75"
        >
          <div className="bg-white text-black p-5 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">Special Day</h2>

            <label htmlFor="reason" className="block mb-2">
              Reason:
              <input
                type="text"
                id="reason"
                name="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded-md text-black w-full"
              />
            </label>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSpecialDayModalIsOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => saveDate("Special Day")}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Save Special Day
              </button>
            </div>
          </div>
        </Modal>

        <div className="mt-10">
          <h2 className="text-purple-700 text-[25px] font-semibold text-center mb-4">
            All Assigned Dates
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 text-gray-700 font-semibold">
                  Assigned Date
                </th>
                <th className="p-3 text-gray-700 font-semibold">Date Type</th>
                <th className="p-3 text-gray-700 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((date, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3 text-red-500 font-semibold">
                    {moment(date.date).format("DD/MM/YYYY")}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-white font-semibold ${
                        date.restriction_datetype === "Restricted"
                          ? "bg-red-500"
                          : date.restriction_datetype === "Holiday"
                          ? "bg-orange-500"
                          : "bg-gray-400"
                      }`}
                    >
                      {date.restriction_datetype === "Holiday"
                        ? "Special Day"
                        : date.restriction_datetype}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">
                    {date.reason || "No remark"}
                  </td>
                </tr>
              ))}
            </tbody>

            {/*  */}
            {/*  */}
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-4">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 mx-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 mx-1 rounded-md ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <button
                onClick={() => setCurrentPage(currentPage + 5)}
                className="px-4 py-2 mx-1 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                More
              </button>
            )}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 mx-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Restricted_Date;
