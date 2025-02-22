import React, { useState, useEffect } from "react";
import { FaRegBell } from "react-icons/fa";
import Cookies from "js-cookie";
import Hi from "../../../assets/hi.png";
import LeaveRequestPopup from "../leave/leave_request/leave_request_popup";

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const user = Cookies.get("employee_calling_name");
  const supervisorId = Cookies.get("supervisorId"); // Get supervisorId from cookies

  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 12) {
      return "Good Morning 🌞";
    } else if (hour < 17) {
      return "Good Afternoon 🌞";
    } else {
      return "Good Evening 🌑";
    }
  };

  const fetchNotifications = async () => {
    try {
      if (!supervisorId) {
        throw new Error("supervisorId not found in cookies");
      }
      const response = await fetch(`https://back-demo-local-hris.quortech-technologies.com/v1/hris/leave/notifications?user_id=${supervisorId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      // Filter only unread notifications
      setNotifications(data.filter((notification) => notification.is_read === 0));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `https://back-demo-local-hris.quortech-technologies.com/v1/hris/leave/notifications/mark-read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: supervisorId, notification_id: notificationId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      // Remove the notification from the state
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleActionClick = (leaveId, notificationId) => {
    setSelectedLeaveId(leaveId); // Open the popup with the selected leave ID
    markNotificationAsRead(notificationId); // Mark the notification as read
  };

  const handleClosePopup = () => {
    setSelectedLeaveId(null); // Close the popup
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <p className="text-[20px] font-bold">
              {getGreeting()}, {user}
            </p>
            <img src={Hi} alt="hi" className="w-10 h-8 mb-5" />
          </div>
        </div>
        <div>
          <div className="flex gap-4 items-center relative">
            <div className="relative" onClick={() => setShowNotifications(!showNotifications)}>
              <FaRegBell className="w-[30px] h-[30px] cursor-pointer" />
              {notifications.length > 0 && (
                <span className="absolute top-3 left-4 bg-[#8764A0] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {notifications.length}
                </span>
              )}
            </div>
            <div>
              <p className="text-[20px] font-semibold">{user}</p>
            </div>
            {showNotifications && (
              <div
                className="absolute top-[40px] right-0 w-[380px] bg-white rounded-lg z-10 shadow-xl max-h-[450px] overflow-y-auto"
              >
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border-b animate__animated animate__fadeInRight"
                  >
                    <div className="flex items-center justify-between">
                      <div className="mr-3">
                        <div className="bg-[#8764A0] rounded-full h-[120px] w-2"></div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center cursor-pointer">
                            <FaRegBell className="mr-2 text-gray-500" />
                            <p className="text-sm text-gray-600">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            X
                          </button>
                        </div>
                        <div className="mt-2">
                          <p>{notification.message}</p>
                          <p className="text-sm text-gray-500">
                            {notification.type} Notification
                          </p>
                          <button
                            onClick={() => handleActionClick(notification.related_entity_id, notification.id)}
                            className="text-[#8764A0] text-sm mt-2 inline-block font-semibold"
                          >
                            Click here to take an Action
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render the LeaveRequestPopup */}
      {selectedLeaveId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[600px] relative">
            {/* Close Button */}
            <button
              onClick={handleClosePopup}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              ✖
            </button>
            {/* Leave Request Popup */}
            <LeaveRequestPopup leaveId={selectedLeaveId} onClose={handleClosePopup} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
