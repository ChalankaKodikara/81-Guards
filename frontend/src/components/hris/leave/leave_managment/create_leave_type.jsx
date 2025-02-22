import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineFileDownload } from "react-icons/md";
import { Link } from "react-router-dom";

const Create_Leave_Type = () => {
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [typeName, setTypeName] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editType, setEditType] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const API_URL = process.env.REACT_APP_FRONTEND_URL;

    // Reusable fetch function
    const fetchEmployeeTypes = async () => {
        try {
            const response = await fetch(
                `${API_URL}/v1/hris/leave/get-leave-name`
            );
            const data = await response.json();
            if (data.success) {
                setEmployeeTypes(data.data); // Assuming the API returns data under `data`
            }
        } catch (error) {
            console.error("Error fetching employee types:", error);
        }
    };

    // Call fetchEmployeeTypes initially
    useEffect(() => {
        fetchEmployeeTypes();
    }, []);

    const handleSaveEmployeeType = async () => {
        if (!typeName) {
            alert("Please enter a leave category name");
            return;
        }

        const payload = {
            name: typeName.trim(), // Ensure no empty spaces in the name
        };

        try {
            const response = await fetch(
                `${API_URL}/v1/hris/leave/add-leave-categoryName`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();

            console.log("Response status:", response.status);
            console.log("Response body:", result);

            if (response.ok && result.success) {
                alert("Leave category added successfully!");
                setTypeName(""); // Reset the input field
                fetchEmployeeTypes(); // Refresh the list to reflect changes
            } else {
                console.error("Failed to add leave category:", result.message || result.error);
                alert(`Failed to add leave category. Error: ${result.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error adding leave category:", error);
            alert("An error occurred while adding the leave category.");
        }
    };




    const handleUpdateEmployeeType = async () => {
        if (!editType || !editType.id || !editType.name) {
            alert("Please select a valid leave category and enter a name");
            return;
        }

        const payload = {
            name: editType.name.trim(), // The updated category name
        };

        try {
            const response = await fetch(
                `${API_URL}/v1/hris/leave/update-leave-category-name?id=${editType.id}`, // Pass ID as a query parameter
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload), // Send name in the body
                }
            );

            const result = await response.json();

            console.log("Response status:", response.status);
            console.log("Response body:", result);

            if (response.ok && result.success) {
                alert("Leave category updated successfully!");
                setIsEditModalOpen(false); // Close the edit modal
                fetchEmployeeTypes(); // Refresh the list to reflect changes
            } else {
                console.error("Failed to update leave category:", result.message || result.error);
                alert(`Failed to update leave category. Error: ${result.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error updating leave category:", error);
            alert("An error occurred while updating the leave category.");
        }
    };




    const handleDeleteEmployeeType = async () => {
        if (!typeToDelete || !typeToDelete.id) {
            alert("Please select a valid leave category to delete");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/v1/hris/leave/delete-leave-category-name?id=${typeToDelete.id}`, // Pass ID as query parameter
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            console.log("Response status:", response.status);
            console.log("Response body:", result);

            if (response.ok && result.success) {
                alert("Leave category deleted successfully!");
                setEmployeeTypes(employeeTypes.filter((type) => type.id !== typeToDelete.id)); // Remove from UI
                setIsDeleteModalOpen(false); // Close the delete modal
            } else {
                console.error("Failed to delete leave category:", result.message || result.error);
                alert(`Failed to delete leave category. Error: ${result.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error deleting leave category:", error);
            alert("An error occurred while deleting the leave category.");
        }
    };

    const handleExportCSV = () => {
        const csvHeader = "Employment Type\n";
        const csvRows = employeeTypes.map((type) => type.employment_type_name).join("\n");
        const csvContent = csvHeader + csvRows;
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "employee_types.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEmployeeTypes = employeeTypes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(employeeTypes.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleEditClick = (type) => {
        setEditType({
            id: type.id,    // Include the ID of the selected leave category
            name: type.name // The current name of the category
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (type) => {
        setTypeToDelete(type); // Store the leave category to delete
        setIsDeleteModalOpen(true); // Open the delete modal
    };

    return (
        <div className="mx-10 mt-5 font-montserrat">
            <p className="text-[26px] mb-8">Leave Management Settings / Add Leave Type</p>
            <div className="flex items-center gap-5">
                <div>
                    <button className="bg-blue-500 text-white p-2 rounded-lg font-semibold">Add Leave Type</button>
                </div>

                <Link to="/leave-allocation">
                    <div>
                        <button>Leave Allocation</button>
                    </div>
                </Link>

                <div>
                    <button >Reset Leave</button>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 w-full shadow-lg p-3 rounded-lg">
                    <div>
                        <label>Search by type</label>
                        <input className="border border-gray-200 rounded-lg w-[250px] p-2 mt-2" />
                    </div>
                    <div>
                        <button
                            className="px-4 py-2 text-white bg-[#2495FE] bg-opacity-55 rounded hover:bg-blue-600 flex justify-center mb-2 w-[150px] mt-5"
                            onClick={handleExportCSV}
                        >
                            <div className="flex items-center gap-3 justify-end">
                                <MdOutlineFileDownload />
                                <div>Export</div>
                            </div>
                        </button>
                    </div>
                    <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-900">Leave Type Name</th>
                                <th className="px-6 py-4 font-medium text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 border-t border-gray-200">
                            {currentEmployeeTypes.map((type) => (
                                <tr key={type.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{type.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-6">
                                            <div
                                                className="rounded-lg bg-orange-300 p-2 text-orange-600 cursor-pointer"
                                                onClick={() => handleEditClick(type)}
                                            >
                                                <FaEdit />
                                            </div>
                                            <div
                                                className="rounded-lg bg-red-300 p-2 text-red-600 cursor-pointer"
                                                onClick={() => handleDeleteClick(type)}
                                            >
                                                <RiDeleteBin6Line />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-between items-center mt-4">
                        <button
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
                <div className="col-span-1 w-full shadow-lg p-3 rounded-lg h-[350px]">
                    <p className="text-[20px] font-mono">Add Leave Type</p>
                    <div className="mt-5">
                        <label>
                            <p>Leave Category Name</p>
                        </label>
                        <input
                            className="border border-gray-200 rounded-lg w-full p-2 mt-3"
                            value={typeName}
                            onChange={(e) => setTypeName(e.target.value)}
                        />

                    </div>


                    <div className="flex items-center gap-4 mt-3 justify-center">
                        <div>
                            <button className="bg-gray-400 text-white rounded-lg p-2">Cancel</button>
                        </div>
                        <div>
                            <button
                                className="bg-blue-600 text-white rounded-lg p-2"
                                onClick={handleSaveEmployeeType}
                            >
                                Save
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Edit Type</h2>
                            <button
                                className="text-gray-400"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Category Name:</label>
                            <input
                                className="border border-gray-300 rounded-lg w-full p-2 mt-1"
                                value={editType?.name || ""}
                                onChange={(e) =>
                                    setEditType({ ...editType, name: e.target.value })
                                }
                            />
                        </div>




                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-gray-300 text-gray-700 rounded-lg px-4 py-2"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-600 text-white rounded-lg px-4 py-2"
                                onClick={handleUpdateEmployeeType}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Delete?</h2>
                            <button
                                className="text-gray-400"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm">
                                Are you sure you want to delete:{" "}
                                <span className="text-blue-500 font-semibold">
                                    {typeToDelete?.name}
                                </span>
                                ?
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-gray-300 text-gray-700 rounded-lg px-4 py-2"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 text-white rounded-lg px-4 py-2"
                                onClick={handleDeleteEmployeeType}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Create_Leave_Type;
