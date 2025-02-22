import React, { useState, useEffect } from "react";

const LeaveRequestPopup = ({ leaveId, onClose }) => {
  const [leaveDetails, setLeaveDetails] = useState(null);
  const [isEmailSectionVisible, setIsEmailSectionVisible] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [approvedStatus, setApprovedStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [emails, setEmails] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const API_URL = process.env.REACT_APP_FRONTEND_URL;

  useEffect(() => {
    fetchLeaveDetails();
  }, [leaveId]);

  const fetchLeaveDetails = async () => {
    try {
      const response = await fetch(
        `${API_URL}/v1/hris/leave/getleavebyid?id=${leaveId}`
      );
      const data = await response.json();
      setLeaveDetails(data);
      setApprovedStatus(data.approved_status_1 || "");
      setRemarks(data.remarks || "");
    } catch (error) {
      console.error("Error fetching leave details:", error);
    }
  };

  const handleAddHeadClick = () => {
    setIsEmailSectionVisible(true);
  };

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const handleEmailChange = (e) => {
    setEmails(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      approved_status_1: approvedStatus,
      remarks: remarks,
      emails: emails.split(","),
    };

    console.log("Sending body:", JSON.stringify(body)); // Log the body

    try {
      const response = await fetch(
        `${API_URL}/v1/hris/leave/updateLeaveStatus?leaveid=${leaveId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const responseText = await response.text();
      console.log("Response:", responseText); // Log the response text for more details

      if (response.ok) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          onClose();
        }, 3000);
      } else {
        console.error("Error updating leave status:", response.statusText);
        console.error("Error details:", responseText); // Log the response text for more details
      }
    } catch (error) {
      console.error("Error updating leave status:", error);
    }
  };

  if (!isFormOpen) {
    return null;
  }

  return (
    <div className="flex justify-center items-center h-full">
      <div className="rounded-lg w-full relative">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold mb-6">Action</h2>
        </div>

        {leaveDetails ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 items-center mt-5 grid-cols-1 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Employee ID: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={leaveDetails.employee_no}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Employee Name: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={leaveDetails.employee_fullname}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Department: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={leaveDetails.department}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>

            <div className="grid gap-5 items-center mt-5 grid-cols-1 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date of Leave Applied: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={leaveDetails.requesting_date}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Leave Category: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={leaveDetails.leave_category}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Leave Requested Date: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={leaveDetails.requested_date}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>

            <div className="flex gap-5 items-center mt-10">
              <label>
                Reason: <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={leaveDetails.reason}
                readOnly
                className="border border-gray-300 p-2 w-[50%] rounded-md shadow-sm"
              />
            </div>

            <div className="flex gap-6 mt-6 items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Action: <span className="text-red-600">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Approve:
                    </label>
                    <input
                      type="checkbox"
                      checked={approvedStatus === "APPROVED"}
                      onChange={() => setApprovedStatus("APPROVED")}
                      className="w-5 h-5 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Communicate:
                    </label>
                    <input
                      type="checkbox"
                      checked={approvedStatus === "COMMUNICATE"}
                      onChange={() => setApprovedStatus("COMMUNICATE")}
                      className="w-5 h-5 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Reject:
                    </label>
                    <input
                      type="checkbox"
                      checked={approvedStatus === "REJECTED"}
                      onChange={() => setApprovedStatus("REJECTED")}
                      className="w-5 h-5 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
{/* 
            {isEmailSectionVisible && (
              <div className="mt-6 flex justify-end items-center gap-8">
                <div className="flex gap-6 items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Add Email: <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    onChange={handleEmailChange}
                    className="mt-1 block w-[70%] px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </div>
            )} */}

            {approvedStatus === "COMMUNICATE" && (
              <div className="flex gap-5 items-center mt-5">
                <label>
                  Remark: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="border border-gray-300 p-2 w-[50%] rounded-md shadow-sm"
                />
              </div>
            )}

            <div className="flex mt-5 items-center gap-5">
              <button
                type="submit"
                className="text-white bg-purple-600 font-[12px] py-4 px-2 border border-purple-600 rounded-md shadow-sm hover:bg-purple-600 transition duration-300"
              >
                Send
              </button>
              {showSuccessMessage && (
                <div className="absolute bottom-10 right-10 bg-green-500 text-white px-4 py-2 rounded-md shadow-md opacity-75">
                  Request Sent Successfully
                </div>
              )}
            </div>
          </form>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequestPopup;