import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const LoanComponent = () => {
    const location = useLocation();
    const { id, name } = location.state;
    const [loanRequests, setLoanRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const API_URL = process.env.REACT_APP_FRONTEND_URL;

    const fetchLoanRequests = async () => {
        try {
            const response = await fetch(`${API_URL}/v1/hris/loan/loan-requests-by-id?id=${id}`);
            const data = await response.json();
            setLoanRequests(data);
        } catch (error) {
            console.error("Error fetching loan requests:", error);
        }
    };

    useEffect(() => {
        fetchLoanRequests();
    }, [id]);

    const handleRowClick = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            const response = await fetch(`${API_URL}/v1/hris/loan/approveLoanRequest`, {
                method: "PUT", // Changed to PUT
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ loanRequestId: selectedRequest.loan_request_id }), // Passing loan_request_id as loanRequestId
            });

            if (response.ok) {
                console.log("Loan request approved successfully");

                // Refresh the loan requests after approval
                fetchLoanRequests();

                // Close the modal
                closeModal();
            } else {
                console.error("Failed to approve loan request");
            }
        } catch (error) {
            console.error("Error approving loan request:", error);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;

        try {
            const response = await fetch(`${API_URL}/v1/hris/loan/rejectLoanRequest`, {
                method: "PUT", // Corrected to PUT
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    loanRequestId: selectedRequest.loan_request_id, // Passing loan_request_id as loanRequestId
                }),
            });

            if (response.ok) {
                console.log("Loan request rejected successfully");

                // Refresh the loan requests after rejection
                fetchLoanRequests();

                // Close the modal
                closeModal();
            } else {
                console.error("Failed to reject loan request");
            }
        } catch (error) {
            console.error("Error rejecting loan request:", error);
        }
    };



    return (
        <div className="mx-5 mt-5 font-montserrat">
            <div>
                <p className="text-[24px] mb-5">Loan information / {name}</p>
            </div>
            <div className="mt-5">
                <div className="table-container">
                    <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-900">Employee Name</th>
                                <th className="px-6 py-3 font-medium text-gray-900">Loan Title</th>
                                <th className="px-6 py-3 font-medium text-gray-900">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 border-t border-gray-200">
                            {loanRequests.map((request) => (
                                <tr
                                    key={request.loan_request_id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleRowClick(request)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
                                                {request.employee_fullname
                                                    .split(" ")
                                                    .map((name) => name[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {request.employee_fullname}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {request.employee_email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{request.loan_type_name}</td>
                                    <td className="px-6 py-4">
                                        {request.approveStatus === "Approved" ? (
                                            <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                Approved
                                            </span>
                                        ) : request.approveStatus === "Rejected" ? (
                                            <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                                Rejected
                                            </span>
                                        ) : (
                                            <div className="bg-gray-200 text-black p-2 rounded-full w-[150px]">
                                                <p className="text-sm">No Available Loan</p>
                                            </div>
                                        )}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg w-1/3">
                        <h2 className="text-lg font-semibold mb-4">
                            Loan Request for

                        </h2>
                        <form>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Loan Type</label>
                                    <input
                                        type="text"
                                        value={selectedRequest.loan_type_name}
                                        readOnly
                                        className="rounded-md border-gray-200 p-2 w-full border"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Requested Date</label>
                                    <input
                                        type="text"
                                        value={selectedRequest.requestedDate}
                                        readOnly
                                        className="rounded-md border-gray-200 p-2 w-full border"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Approval Status</label>
                                    <input
                                        type="text"
                                        value={selectedRequest.approveStatus}
                                        readOnly
                                        className="rounded-md border-gray-200 p-2 w-full border"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4">
                                {selectedRequest.approveStatus !== "Approved" && selectedRequest.approveStatus !== "Rejected" ? (
                                    <>
                                        <button
                                            type="button"
                                            className="bg-green-200 text-green-500 px-4 py-2 rounded-lg font-semibold"
                                            onClick={handleApprove}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-red-200 text-red-500 px-4 py-2 rounded-lg font-semibold"
                                            onClick={handleReject}
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : null}
                                <button
                                    type="button"
                                    className="bg-gray-200 text-black px-4 py-2 rounded-lg font-semibold"
                                    onClick={closeModal}
                                >
                                    Close
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanComponent;
