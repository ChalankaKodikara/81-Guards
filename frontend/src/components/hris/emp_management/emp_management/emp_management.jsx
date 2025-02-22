import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaFileInvoiceDollar,
    FaMoneyCheck,
    FaPercent,
} from "react-icons/fa";
import moment from "moment";
import { FaUsers } from "react-icons/fa";
import { TbListDetails } from "react-icons/tb";
import { LiaUserEditSolid } from "react-icons/lia";

const Emp_Management = () => {
    const API_URL = process.env.REACT_APP_FRONTEND_URL;

    const [data, setData] = useState({
        totalWorkforce: 0,
        absentWorkforce: 0,
        allowanceCount: 0, // State fields for additional data
        deductionCount: 0,
    });

    const navigate = useNavigate();

    const cards = [
        {
            title: "Employee Onboarding",
            count: data.totalWorkforce,
            label: "Total Employees",
            bgColor: "bg-blue-50",
            iconBg: "border-blue-400",
            icon: <FaUsers
            className="text-blue-500 text-2xl" />,
            onClick: () => navigate("/onboard_new"),
        },
        {
            title: "View Employee Details",
            count: data.totalWorkforce,
            label: "Total Employees",
            bgColor: "bg-blue-50",
            iconBg: "border-blue-400",
            icon: <TbListDetails
            className="text-blue-500 text-2xl" />,
            onClick: () => navigate("/emp-details"),
        },
        {
            title: "Employee Edit Details",
            count: data.allowanceCount, // Display allowanceCount as a placeholder
            label: "Edit Details",
            bgColor: "bg-blue-50",
            iconBg: "border-green-400",
            icon: <LiaUserEditSolid 
            className="text-blue-500 text-2xl" />,
            onClick: () => navigate("/history-logged"),
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
                <p className="text-[24px] font-bold mb-5">Employee Management</p>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-1 lg:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="rounded-lg border shadow-md p-3 flex flex-col cursor-pointer"
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

export default Emp_Management;