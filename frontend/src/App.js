/** @format */

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Cookies from "js-cookie";


import "./App.css";
// Import components
import Sidebar from "./components/sidebar/sidebar.jsx";
import Navbar from "./components/hris/navbar/navbar.jsx";
import Login from "./components/hris/login/login.jsx";
import Leave from "./components/hris/leave/leave/leave.jsx";
import Leave_Management from "./components/hris/leave/leave_managment/leave_management.jsx";
import Leave_Request from "./components/hris/leave/leave_request/leave_request.jsx";
import Leave_Approve from "./components/hris/leave/leave_approve/leave_approve.jsx";
import Leave_process_popup from "./components/hris/leave/leave_request/leave_process_popup.jsx";
import Leave_approve_popup from "./components/hris/leave/leave_approve/leave_approve_popup.jsx";
import Restricted_Date from "./components/hris/leave/restricted_date.jsx/restricted_date.jsx";
import Reports from "./components/hris/leave/reports/reports.jsx";
import HR_Reports from "./components/hris/leave/reports/hr_report/hr_report.jsx";
import Home from "./components/hris/employee/dashbaord/dashboard.jsx";
import Reset_Pw from "./components/hris/employee/dashbaord/reset_password.jsx";
import User_Profile from "./components/hris/employee/dashbaord/user_profile.jsx";
import Emp_Dashboard from "./components/hris/emp_management/dashboard/dashboard.jsx";
import Emp_details from "./components/hris/emp_management/view_emp_details/emp_details.jsx";
import Emp_Onboard from "./components/hris/emp_management/employee_quick_onboard/emp_onboard.jsx";
import Permission from "./components/hris/emp_management/permission/permission.jsx";
import History_login_details from "./components/hris/emp_management/history_login_details/history_login_details.jsx";
import User_account_creation from "./components/hris/emp_management/user_account_creation/user_account_creation.jsx";
import Time_Attendance_Dashboard from "./components/hris/time_and_attendance/time_and_attendance.jsx";
import Time_Management from "./components/hris/time_and_attendance/timetable.jsx";
import Absence_Report from "./components/hris/time_and_attendance/absence_report.jsx";
import Leave_Report from "./components/hris/leave/reports/leave_report/leave_report.jsx";
import Checkin_checkout_report from "./components/hris/time_and_attendance/checking_checkout_report.jsx";
import LeaveRequestPopup from "./components/hris/leave/leave_request/leave_request_popup.jsx";
import Hr_Report_Pdf from "./components/hris/leave/reports/hr_report/hr_report_pdf.jsx";
import Modal from "./components/hris/emp_management/employee_quick_onboard/testModal.jsx";
import Emp_details_pdf from "./components/hris/emp_management/view_emp_details/emp_details_pdf.jsx";
import Departmental_Comparison from "./components/hris/time_and_attendance/departmental_comparison.jsx";
import User_Permission from "./components/hris/settings/permission.jsx";
import Create_User_Permission from "./components/hris/settings/create_user_permission.jsx";
import Edit_User_Permission from "./components/hris/settings/edit_user_permission.jsx";
import History_Logged from "./components/hris/emp_management/history_logged_details/history_logged_details.jsx";
import Summary_Report from "./components/hris/time_and_attendance/summary_report.jsx";
import Attendance_History_Report from "./components/hris/time_and_attendance/attendance_history_report.jsx";
import Service_Charge from "./components/hris/settings/service_charge.jsx";
import Deignation from "./components/hris/settings/designation.jsx";
import Supervisor from "./components/hris/settings/supervisor.jsx";
import Onboard_new from "./components/hris/emp_management/employee_quick_onboard/onboard_new.jsx";
import Next_Of_Kings from "./components/hris/emp_management/employee_quick_onboard/next_of_kings.jsx";
import Branch from "./components/hris/settings/create_branch.jsx";
import Employee_Type_Add from "./components/hris/settings/add_employee_type.jsx";
import Salaray_Component_Management from "./components/hris/settings/salaray_component_management.jsx";
import Payroll_Navigation from "./components/hris/payroll/payroll_management.jsx";
import Payroll_Allowance from "./components/hris/payroll/payroll_allowance.jsx";
import Payroll_Deduction from "./components/hris/payroll/payroll_deduction.jsx";
import Allowance_Component from "./components/hris/payroll/allowance_component.jsx";
import Deduction_Component from "./components/hris/payroll/deduction_component.jsx";
import Salary_Breakdown from "./components/hris/payroll/salary_breakdown.jsx";
import Service_Charge_Payroll from "./components/hris/payroll/service_charge_payroll.jsx";
import Salary_Advance from "./components/hris/payroll/salary_advance.jsx";
import Month_End_Payroll from "./components/hris/payroll/month_end_payroll.jsx";
import Genarated_Payroll from "./components/hris/payroll/genarated_payroll.jsx";
import Create_Leave_Types from "./components/hris/leave/leave_managment/create_leave_type.jsx";
import Leave_Allocation from "./components/hris/leave/leave_managment/leave_allocation.jsx";
import View_Leave_Table from "./components/hris/leave/leave_managment/view_leave_table.jsx";
import Leave_History from "./components/hris/leave/leave_managment/leave_history.jsx";
import Genarated_Incentive_Payroll from "./components/hris/payroll/genarated_incentive_payroll.jsx";
import Service_Charge_Percentage from "./components/hris/payroll/service_charge_percentage.jsx";
import Assign_Roster from "./components/hris/settings/assign_roster.jsx";
import Loan_Managemnt from "./components/hris/payroll/loan_management/loan_management.jsx";
import Loan_Component from "./components/hris/payroll/loan_management/loan_component.jsx";
import Create_Loan from "./components/hris/settings/create_loan.jsx";
import Emp_Management from "./components/hris/emp_management/emp_management/emp_management.jsx";
import Job_Posting_Management from "./components/hris/employee_recruitment/job_posting_management.jsx"
import Collect_Job_Details from "./components/hris/employee_recruitment/collect_job_details.jsx";

const AppContent = ({
  isSidebarOpen,
  toggleSidebar,
  showSessionExpiredPopup,
  notifications,
  setNotifications,
  showNotificationPopup,
  setShowNotificationPopup,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSessionExpired = () => {
    if (
      window.confirm(
        "Your session has expired. Would you like to log in again?"
      )
    ) {
      Cookies.remove("yourCookieName"); // Adjust cookie name accordingly
      localStorage.removeItem("sessionStartTime");
      navigate("/login");
    }
  };

  const resetSessionTimer = () => {
    localStorage.setItem("sessionStartTime", new Date().getTime());
  };

  useEffect(() => {
    const checkSession = () => {
      const sessionStartTime = localStorage.getItem("sessionStartTime");
      if (sessionStartTime) {
        const currentTime = new Date().getTime();
        const sessionExpiryTime = parseInt(sessionStartTime) + 30 * 60 * 1000; // 30 minutes
        if (currentTime > sessionExpiryTime) {
          showSessionExpiredPopup();
          handleSessionExpired();
        }
      }
    };

    checkSession();

    // Add event listeners for user activity
    window.addEventListener("mousemove", resetSessionTimer);
    window.addEventListener("keypress", resetSessionTimer);
    window.addEventListener("click", resetSessionTimer);

    return () => {
      // Clean up event listeners
      window.removeEventListener("mousemove", resetSessionTimer);
      window.removeEventListener("keypress", resetSessionTimer);
      window.removeEventListener("click", resetSessionTimer);
    };
  }, [location, showSessionExpiredPopup]);

  const isOnboardNewRoute = location.pathname === "/onboard_new";

  return (
    <div className="App flex">
      {location.pathname !== "/login" && (
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}
      <div
        className={`flex-grow p-5 transition-all duration-300 ${isSidebarOpen && location.pathname !== "/login" ? "ml-64" : "ml-20"
          }`}
        style={
          isOnboardNewRoute
            ? { position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }
            : {}
        }
      >
        {location.pathname !== "/login" && (
          <Navbar
            notifications={notifications}
            setNotifications={setNotifications}
            showNotificationPopup={showNotificationPopup}
            setShowNotificationPopup={setShowNotificationPopup}
          />
        )}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/leave-info" element={<Leave />} />
          <Route path="/leave-management" element={<Leave_Management />} />
          <Route path="/leave-request" element={<Leave_Request />} />
          <Route path="/leave-approve" element={<Leave_Approve />} />
          <Route path="/leave-taken" element={<Leave_process_popup />} />
          <Route
            path="/leave-approve-popup"
            element={<Leave_approve_popup />}
          />
          <Route path="/restricted-date" element={<Restricted_Date />} />
          <Route path="/hr-report" element={<HR_Reports />} />
          <Route path="/leave-reports" element={<Reports />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/emp-details" element={<Emp_details />} />
          <Route path="/emp-onboard" element={<Emp_Onboard />} />
          <Route path="/permission" element={<Permission />} />
          <Route
            path="/history-Login-Details"
            element={<History_login_details />}
          />

          {/* employee portal */}
          <Route path="/home" element={<Home />} />
          <Route path="/reset-pw" element={<Reset_Pw />} />
          <Route path="/user-profile" element={<User_Profile />} />
          <Route path="/emp-dashboard" element={<Emp_Dashboard />} />
          <Route
            path="/create-user-account"
            element={<User_account_creation />}
          />
          <Route path="/leave-balance-report" element={<Leave_Report />} />

          {/* Time and Attendance */}
          <Route
            path="/time-attendance-dashboard"
            element={<Time_Attendance_Dashboard />}
          />
          <Route path="/time-management" element={<Time_Management />} />
          <Route path="/absence-report" element={<Absence_Report />} />
          <Route
            path="/Checkin-checkout-Report"
            element={<Checkin_checkout_report />}
          />
          <Route path="/Leave-Request-Popup" element={<LeaveRequestPopup />} />
          <Route path="/hr-report-pdf" element={<Hr_Report_Pdf />} />
          <Route path="/Modal-popup" element={<Modal />} />
          <Route path="/emp_details_pdf" element={<Emp_details_pdf />} />
          <Route
            path="/department-comparison"
            element={<Departmental_Comparison />}
          />
          <Route path="/user-permission" element={<User_Permission />} />
          <Route
            path="/create-user-permission"
            element={<Create_User_Permission />}
          />
          <Route
            path="/edit-user-permission"
            element={<Edit_User_Permission />}
          />
          <Route path="/history-logged" element={<History_Logged />} />
          <Route path="/summary-report" element={<Summary_Report />} />
          <Route
            path="/attendance-history-report"
            element={<Attendance_History_Report />}
          />
          <Route path="/Designation" element={<Deignation />} />
          <Route path="/Supervisor" element={<Supervisor />} />
          <Route path="/service-charge" element={<Service_Charge />} />

          {/* dlh updates */}
          <Route path="/onboard_new" element={<Onboard_new />} />
          <Route path="/next-of-kings" element={<Next_Of_Kings />} />
          <Route path="/branch" element={<Branch />} />
          <Route path="/add-employee-type" element={<Employee_Type_Add />} />
          <Route path="/salaray-component-management" element={<Salaray_Component_Management />} />
          <Route path="/payroll-navigation" element={<Payroll_Navigation />} />
          <Route path="/payroll-allowance" element={<Payroll_Allowance />} />
          <Route path="/payroll-deduction" element={<Payroll_Deduction />} />
          <Route path="/allowance-component" element={<Allowance_Component />} />
          <Route path="/deduction-component" element={<Deduction_Component />} />
          <Route path="/salary-breakdown" element={<Salary_Breakdown />} />
          <Route path="/service-charge-payroll" element={<Service_Charge_Payroll />} />
          <Route path="/salary-advance" element={<Salary_Advance />} />
          <Route path="/month-end-payroll" element={<Month_End_Payroll />} />
          <Route path="/Generated-payroll" element={<Genarated_Payroll />} />
          <Route path="/create-leave-types" element={<Create_Leave_Types />} />
          <Route path="/leave-allocation" element={<Leave_Allocation />} />
          <Route path="/view-leave-table" element={<View_Leave_Table />} />
          <Route path="/leave-history" element={<Leave_History />} />
          <Route path="/genarated-incentive-payroll" element={<Genarated_Incentive_Payroll />} />
          <Route path="/service-charge-percentage" element={<Service_Charge_Percentage />} />
          <Route path="/assign-roster" element={<Assign_Roster />} />
          <Route path="/loan-management" element={<Loan_Managemnt />} />
          <Route path="/loan-component" element={<Loan_Component />} />
          <Route path="/create-loan" element={<Create_Loan />} />
          <Route path="/emp-management" element={<Emp_Management />} />
          <Route path="/job-posting-management" element={<Job_Posting_Management />} />
          <Route path="/collect-job-details" element={<Collect_Job_Details />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const showSessionExpiredPopup = () => {
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000); // Hide popup after 3 seconds
  };
  return (
    <Router>

      <AppContent
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        showSessionExpiredPopup={showSessionExpiredPopup}
        notifications={notifications}
        setNotifications={setNotifications}
        showNotificationPopup={showNotificationPopup}
        setShowNotificationPopup={setShowNotificationPopup}
      />
      {showPopup && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center p-4">
          Your session has expired. Please log in again.
        </div>
      )}
    </Router>
  );
}

export default App;
