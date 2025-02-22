import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPersonWalking } from "react-icons/fa6"; // Replace with appropriate icons
import { FaListAlt } from "react-icons/fa";

const LeaveHistory = () => {
    const [leaveData, setLeaveData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Number of rows per page

    useEffect(() => {
        // Fetching the data from the API
        const fetchLeaveHistory = async () => {
            try {
                const response = await fetch('https://back-demo-local-hris.quortech-technologies.com/v1/hris/leave/getleave');
                const data = await response.json();

                if (data.success) {
                    setLeaveData(data.data); // Set the data if successful
                }
            } catch (error) {
                console.error('Error fetching leave history:', error);
            }
        };

        fetchLeaveHistory(); // Call the function when the component mounts
    }, []);

    // Calculate the index range for the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = leaveData.slice(indexOfFirstItem, indexOfLastItem);

    // Change page handler
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calculate total pages
    const totalPages = Math.ceil(leaveData.length / itemsPerPage);

    return (
        <div>
            <div className="mt-5">

                <div className="flex space-x-4 mt-5 mb-5">
                    {/* Employee Leaves Card */}
                    <Link to="/leave-management">
                        <div className="w-48 h-32 flex flex-col items-center justify-center border rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                            <div className="w-10 h-10  rounded-full flex items-center justify-center mb-2">
                                <FaPersonWalking className="text-gray-500" size={20} />
                            </div>
                            <p className="text-gray-500 text-sm">Employee Leaves</p>
                        </div></Link>

                    {/* Leave History Card */}
                    <Link to="/leave-history">
                        <div className="w-48 h-32 flex flex-col items-center justify-center border rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                <FaListAlt  className="text-gray-500"  size={20} />
                            </div>
                            <p className="text-gray-500 text-sm">Leave History</p>
                        </div>
                    </Link>
                </div>
                <div className="table-container">
                    <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-900">Employee ID</th>
                                <th className="px-6 py-3 font-medium text-gray-900">Employee</th>
                                <th className="px-6 py-3 font-medium text-gray-900">Leave Category</th>
                                <th className="px-6 py-3 font-medium text-gray-900">Requested Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.map((leave) => (
                                <tr key={leave.id} className="hover:bg-blue-50 cursor-pointer">
                                    <td className="px-6 py-4">{leave.employee_no}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                                                {leave.employee_fullname
                                                    .split(" ")
                                                    .map((name) => name[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {leave.employee_fullname}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {leave.employee_email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{leave.leave_category_id ? `Category ${leave.leave_category_id}` : 'N/A'}</td>
                                    <td className="px-6 py-4">{leave.requested_date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination controls */}
                <div className="mt-4 flex justify-center space-x-2">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                    >
                        Prev
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={`px-4 py-2 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeaveHistory;
