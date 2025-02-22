/** @format */

import React from "react";
import { FaUser, FaClock } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { IoSettings } from "react-icons/io5";
import { TfiMoney } from "react-icons/tfi";

const sidebarData = [

  {
    _id: "1",
    name: "Dashboard",
    icon: <MdDashboard />,
    url: "/emp-dashboard",
  },

  {
    _id: "1",
    name: "Employee Management",
    icon: <MdDashboard />,
    url: "/emp-management",
  },

  {
    _id: "2",
    name: "Time & Attendance",
    icon: <FaClock />,

    subModules: [
      {
        _id: "2.1",
        name: "Live Dashboard",
        url: "/time-attendance-dashboard",
      },
      {
        _id: "2.2",
        name: "Time Management",
        url: "/time-management",
      },

      {
        _id: "4.1",
        name: "Absence Report",
        url: "/absence-report",
      },
      {
        _id: "4.2",
        name: "Summary Report",
        url: "/summary-report",
      },
      {
        _id: "4.3",
        name: "Checkin-checkout Report",
        url: "/checkin-checkout-Report",
      },
    ],
  },
  {
    _id: "3",
    name: "Leave Management",
    icon: <FaUser />,

    subModules: [

      {
        _id: "3.2",
        name: "Employee Leave Management",
        url: "/leave-management",
      },
      {
        _id: "3.3",
        name: "Leave Approval process",
        url: "/leave-approve",
      },
      {
        _id: "3.4",
        name: "Calendar",
        url: "/restricted-date",
      },
      {
        _id: "3.5",
        name: "Leave Request",
        url: "/leave-request",
      },


    ],
  },

  {
    _id: "4",
    name: "Payroll Management",
    icon: <TfiMoney />,

    subModules: [
      {
        _id: "4.1",
        name: "Payroll Navigation",
        url: "/payroll-navigation",
      },

      {
        _id: "4.2",
        name: "Loan Management",
        url: "/loan-management",
      },
    ],
  },

  {
    _id: "5",
    name: "Settings",
    icon: <IoSettings />,

    subModules: [
      {
        _id: "5.1",
        name: "User Management",
        url: "/create-user-account",
      },
      {
        _id: "5.2",
        name: "Role Management",
        url: "/user-permission",
      },
      {
        _id: "5.3",
        name: "Supervisor",
        url: "/Supervisor",
      },
      {
        _id: "5.4",
        name: "Designation & Department",
        url: "/Designation",
      },

      {
        _id: "5.5",
        name: "Add Branch Type",
        url: "/branch",
      },
      {
        _id: "5.6",
        name: "Add Employee Type",
        url: "/add-employee-type",
      },
      {
        _id: "5.7",
        name: "salary Component ",
        url: "/salaray-component-management",
      },
      {
        _id: "5.8",
        name: "Leave Types",
        url: "/create-leave-types",
      },

      {
        _id: "5.11",
        name: "Assign Roster",
        url: "/assign-roster",
      },

      {
        _id: "5.12",
        name: "Create Loan",
        url: "/create-loan",
      },

    ],
  },

  {
    _id: "6",
    name: "Employee Recruitment",
    icon: <IoSettings />,

    subModules: [
      {
        _id: "6.1",
        name: "Job Posting & Management",
        url: "/job-posting-management",
      },
     
    ],
  },
];

export default sidebarData;
