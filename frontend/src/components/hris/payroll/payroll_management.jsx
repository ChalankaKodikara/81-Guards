import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileInvoiceDollar,
  FaMoneyCheck,
  FaPercent,
  FaChartPie,
  FaRegListAlt,
} from "react-icons/fa";
import moment from "moment";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { GiMoneyStack } from "react-icons/gi";
import { FaRegMoneyBill1 } from "react-icons/fa6";
import { LiaMoneyBillWaveSolid } from "react-icons/lia";


const PayrollManagement = () => {
  const API_URL = process.env.REACT_APP_FRONTEND_URL;

  const [data, setData] = useState({
    totalWorkforce: 0,
    absentWorkforce: 0,
    allowanceCount: 0, // Add state fields for counts
    deductionCount: 0,
  });

  const navigate = useNavigate();

  const cards = [
    {
      title: "Month End Payroll",
      count: data.totalWorkforce,
      label: "Assigned Employees",
      bgColor: "bg-blue-50",
      iconBg: "border-blue-400",
      icon: <FaFileInvoiceDollar className="text-blue-500 text-2xl" />,
      onClick: () => navigate("/month-end-payroll"),
    },
    {
      title: "Generated Month End Payroll",
      count:  data.totalWorkforce,
      label: "Assigned Employees",
      bgColor: "bg-blue-50",
      iconBg: "border-blue-400",
      icon: <FaMoneyCheck className="text-blue-500 text-2xl" />,
      onClick: () =>
        navigate("/Generated-payroll"),
        },
    {
      title: "Payroll Allowance",
      count: data.allowanceCount, // Use the fetched allowance count here
      label: "Salary Components",
      bgColor: "bg-green-50",
      iconBg: "border-green-400",
      icon: <FaPercent className="text-green-500 text-2xl" />,
      onClick: () =>
        navigate("/payroll-allowance", { state: { type: "allowance" } }),
    },
    {
      title: "Payroll Deduction",
      count: data.deductionCount, // Use the fetched deduction count here
      label: "Salary Components",
      bgColor: "bg-red-50",
      iconBg: "border-red-400",
      icon: <FaChartPie className="text-red-500 text-2xl" />,
      onClick: () =>
        navigate("/payroll-deduction", { state: { type: "deduction" } }),
    },
    {
      title: "Salary Breakdown",
      count:  data.totalWorkforce,
      label: "Assigned Employees",
      bgColor: "bg-blue-50",
      iconBg: "border-blue-400",
      icon: <FaRegListAlt className="text-blue-500 text-2xl" />,
      onClick: () => navigate("/salary-breakdown"),
    },

    {
      title: "Incentive Payroll",
     // count:  data.totalWorkforce,
      label: "Assigned Employees",
      bgColor: "bg-blue-50",
      iconBg: "border-blue-400",
      icon: <RiMoneyDollarCircleFill
      className="text-blue-500 text-2xl" />,
      onClick: () => navigate("/service-charge-payroll"),
    },

    {
      title: "Salary Advance",
     // count:  data.totalWorkforce,
      label: "Assigned Employees",
      bgColor: "bg-blue-50",
      iconBg: "border-blue-400",
      icon: <GiMoneyStack 
      className="text-blue-500 text-2xl" />,
      onClick: () => navigate("/salary-advance"),
    },

    {
      title: "Genarated Incentive Payroll",
     // count:  data.totalWorkforce,
      label: "Assigned Employees",
      bgColor: "bg-blue-50",
      iconBg: "border-blue-400",
      icon: <FaRegMoneyBill1
      className="text-blue-500 text-2xl" />,
      onClick: () => navigate("/genarated-incentive-payroll"),
    },

    {
      title: "Service Charge Percentage",
     // count:  data.totalWorkforce,
      label: "Assigned Employees",
      bgColor: "bg-blue-50",
      iconBg: "border-blue-400",
      icon: <LiaMoneyBillWaveSolid
      className="text-blue-500 text-2xl" />,
      onClick: () => navigate("/service-charge-percentage"),
    },
  ];
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = moment().format("YYYY-MM-DD");

        // Fetch attendance stats
        const response = await fetch(
          `${API_URL}/v1/hris/employees/getAttendanceStats`
        );
        const result = await response.json();

        if (result.success) {
          const { totalWorkforce } = result.data;
          setData((prevData) => ({ ...prevData, totalWorkforce }));
        } else {
          console.error(
            "Error fetching attendance stats:",
            result.error || result
          );
        }

        // Fetch absent workforce count
        const absentResponse = await fetch(
          `${API_URL}/v1/hris/attendence/getNotAttendCount?startDate=${today}&endDate=${today}`
        );
        const absentResult = await absentResponse.json();

        if (absentResult.not_attended_count !== undefined) {
          setData((prevData) => ({
            ...prevData,
            absentWorkforce: absentResult.not_attended_count,
          }));
        } else {
          console.error(
            "Error fetching absent workforce count:",
            absentResult.error || absentResult
          );
        }

        // Fetch allowance and deduction counts
        const adResponse = await fetch(
          `${API_URL}/v1/hris/payroll/allowances-deductions-count`
        );
        const adResult = await adResponse.json();

        if (
          adResult.allowance_count !== undefined &&
          adResult.deduction_count !== undefined
        ) {
          setData((prevData) => ({
            ...prevData,
            allowanceCount: adResult.allowance_count,
            deductionCount: adResult.deduction_count,
          }));
        } else {
          console.error(
            "Error fetching allowances/deductions count:",
            adResult.error || adResult
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [API_URL]);

  return (
    <div className="mx-5 mt-5 font-montserrat">
      <div>
        <p className="text-[24px] font-bold mb-5">Payroll Navigation</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="rounded-lg border shadow-md p-6 flex flex-col cursor-pointer"
            onClick={card.onClick}
          >
            <div className={`${card.bgColor} p-5 rounded-lg`}>
              <div
                className={`flex items-center justify-center border-dashed border-2 rounded-full h-16 w-16 mx-auto mb-4 ${card.iconBg}`}
              >
                {card.icon}
              </div>
            </div>
            <h3 className="text-center font-semibold text-lg mb-2">
              {card.title}
            </h3>
            <div className="text-center text-gray-500 mb-4">
              <span className="block font-bold">{card.count}</span>
              <span>{card.label}</span>
            </div>
            <button className="mt-auto bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600">
              View
            </button>
          </div>
        ))}
        <div className="hidden sm:block"></div>
      </div>
    </div>
  );
};

export default PayrollManagement;
