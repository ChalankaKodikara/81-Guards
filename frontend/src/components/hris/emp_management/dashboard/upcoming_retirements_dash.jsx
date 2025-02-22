import React from "react";
import { RiErrorWarningLine } from "react-icons/ri";

const Upcoming_Retirements = () => {
    const requests = [
        { name: "Talan Culhane", id: "Emp74651", date: "2025 Jan 25", color: "bg-purple-200" },
        { name: "Ruben Carder", id: "Emp74651", date: "2025 Jan 25", color: "bg-green-200" },
        { name: "Jakob Schleifer", id: "Emp74651", date: "2025 Jan 25", color: "bg-yellow-200" },
        { name: "Terry Westervelt", id: "Emp74651", date: "2025 Jan 25", color: "bg-red-200" },
    ];

    return (
        <div className="bg-white shadow-lg rounded-2xl p-6 w-[500px]">
            <h3 className="text-lg font-bold mb-4">Upcoming Retirement</h3>
            <p className="text-sm text-gray-500 mb-6">Upcoming Retirement Dates & Employees.</p>

            <div className="space-y-4">
                {requests.map((request, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between  p-3 rounded-lg hover:shadow-md transition"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`h-10 w-10 flex items-center justify-center rounded-full ${request.color}`}
                            >
                                <span className="text-gray-700 font-bold">
                                    {request.name
                                        .split(" ")
                                        .map((word) => word[0])
                                        .join("")}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium">{request.name}</p>
                                <p className="text-sm text-gray-400">{request.id}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">{request.date}</p>
                        <span className="text-purple-600 text-lg">
                            <div className="bg-purple-100 p-1 rounded-full">
                                <RiErrorWarningLine />
                            </div>
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center -space-x-2">
               
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-200 text-sm rounded-full border-2 border-white">
                        +12
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-orange-100 text-orange-600 text-xs font-medium py-1 px-2 rounded-lg">
                    Upcoming Retirement
                    </span>
                 
                </div>
            </div>

            <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                View All
            </button>
        </div>
    );
};

export default Upcoming_Retirements;
