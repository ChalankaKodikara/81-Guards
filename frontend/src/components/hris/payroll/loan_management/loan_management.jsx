import React, { useEffect, useState } from "react";
import { FaRupeeSign } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // Import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

const LoanManagement = () => {
    const [loanTypes, setLoanTypes] = useState([]); // State to store loan types
    const API_URL = process.env.REACT_APP_FRONTEND_URL;
    const navigate = useNavigate(); // Initialize the useNavigate hook

    // Fetch loan types from the API
    const fetchLoanTypes = async () => {
        try {
            const response = await fetch(`${API_URL}/v1/hris/loan/loan-types`);
            const data = await response.json();
            console.log("Fetched Loan Types:", data); // Debugging log
            setLoanTypes(data);
        } catch (error) {
            console.error("Error fetching loan types:", error);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchLoanTypes();
    }, []);

    // Handle navigation to loan component with condition
    const handleViewClick = (id, name, employment) => {
        if (employment === "No") {
            toast.error("No Employees are found"); // Show error toast
        } else {
            navigate("/loan-component", { state: { id, name } }); // Navigate to loan-component
        }
    };

    return (
        <div>
            <div className="grid grid-cols-4 grid-flow-row gap-4">
                {loanTypes.map((loan) => (
                    <div key={loan.id} className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-center items-center bg-red-50 rounded-lg h-24 w-full mb-4">
                            <div className="text-red-600 text-4xl border-2 border-dashed border-red-400 rounded-full p-4">
                                <FaRupeeSign />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-gray-800">{loan.name}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{loan.pendingCount}</p>
                            <p className="text-sm text-gray-500">Pending Count</p>
                        </div>
                        <div className="mt-6">
                            <button
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
                                onClick={() => handleViewClick(loan.id, loan.name, loan.employment)} // Pass id, name, and employment status
                            >
                                View
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ToastContainer to display the toast notifications */}
            <ToastContainer
                position="top-right" // Adjust position if needed
                autoClose={5000} // Auto close after 5 seconds
                hideProgressBar={false} // Show progress bar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default LoanManagement;
