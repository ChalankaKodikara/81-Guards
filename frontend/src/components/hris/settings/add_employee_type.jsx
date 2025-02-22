import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineFileDownload } from "react-icons/md";

const EmployeeTypeManager = () => {
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [typeName, setTypeName] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editType, setEditType] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState("success"); // "success" or "error"
    const [showPopup, setShowPopup] = useState(false);
    
    // Reusable fetch function
    const fetchEmployeeTypes = async () => {
        try {
            const response = await fetch(
                "http://localhost:8599/v1/hris/employmentType/all"
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
          setPopupMessage("Please enter an employment type name.");
          setPopupType("error");
          setShowPopup(true);
          return;
        }
      
        try {
          const response = await fetch(
            "http://localhost:8599/v1/hris/employmentType/add",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ employment_type_name: typeName }),
            }
          );
      
          if (response.ok) {
            setPopupMessage("Employment type added successfully!");
            setPopupType("success");
            setShowPopup(true);
            setTypeName(""); // Reset the input field
            fetchEmployeeTypes(); // Refresh the list
          } else {
            setPopupMessage("Failed to add employment type. Please try again.");
            setPopupType("error");
            setShowPopup(true);
          }
        } catch (error) {
          console.error("Error adding employment type:", error);
          setPopupMessage("An error occurred while adding the employment type.");
          setPopupType("error");
          setShowPopup(true);
        }
      };
      
    const handleEditClick = (type) => {
        setEditType(type);
        setIsEditModalOpen(true);
    };

    const handleUpdateEmployeeType = async () => {
        if (!editType || !editType.employment_type_name) {
          setPopupMessage("Please enter an employment type name.");
          setPopupType("error");
          setShowPopup(true);
          return;
        }
      
        try {
          const response = await fetch(
            `http://localhost:8599/v1/hris/employmentType/update/${editType.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ employment_type_name: editType.employment_type_name }),
            }
          );
      
          if (response.ok) {
            setPopupMessage("Employment type updated successfully!");
            setPopupType("success");
            setShowPopup(true);
            setIsEditModalOpen(false); // Close the edit modal
            fetchEmployeeTypes(); // Refresh the list
          } else {
            setPopupMessage("Failed to update employment type. Please try again.");
            setPopupType("error");
            setShowPopup(true);
          }
        } catch (error) {
          console.error("Error updating employment type:", error);
          setPopupMessage("An error occurred while updating the employment type.");
          setPopupType("error");
          setShowPopup(true);
        }
      };
      

    const handleDeleteClick = (type) => {
        setTypeToDelete(type);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteEmployeeType = async () => {
        try {
          const response = await fetch(
            `http://localhost:8599/v1/hris/employmentType/delete/${typeToDelete.id}`,
            { method: "DELETE" }
          );
      
          if (response.ok) {
            setPopupMessage("Employment type deleted successfully!");
            setPopupType("success");
            setShowPopup(true);
            setEmployeeTypes(employeeTypes.filter((type) => type.id !== typeToDelete.id));
            setIsDeleteModalOpen(false);
          } else {
            setPopupMessage("Failed to delete employment type. Please try again.");
            setPopupType("error");
            setShowPopup(true);
          }
        } catch (error) {
          console.error("Error deleting employment type:", error);
          setPopupMessage("An error occurred while deleting the employment type.");
          setPopupType("error");
          setShowPopup(true);
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
    return (
        <div className="mx-10 mt-5 font-montserrat">
            <p className="text-[26px] font-semibold mb-8">Employee Types</p>
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
                                <th className="px-6 py-4 font-medium text-gray-900">Type</th>
                                <th className="px-6 py-4 font-medium text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 border-t border-gray-200">
                            {currentEmployeeTypes.map((type) => (
                                <tr key={type.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{type.employment_type_name}</td>
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
                    <p className="text-[20px] font-mono">Add Employment Type</p>
                    <div className="mt-5 ">
                        <label>
                            <p>Employment Type</p>
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
                            <label className="block text-sm font-medium text-gray-700">Type Name:</label>
                            <input
                                className="border border-gray-300 rounded-lg w-full p-2 mt-1"
                                value={editType?.employment_type_name || ""}
                                onChange={(e) =>
                                    setEditType({ ...editType, employment_type_name: e.target.value })
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
                                Do you want to delete:{" "}
                                <span className="text-blue-500 font-semibold">
                                    {typeToDelete?.employment_type_name}
                                </span>
                                ?
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-gray-300 text-gray-700 rounded-lg px-4 py-2"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                No
                            </button>
                            <button
                                className="bg-blue-600 text-white rounded-lg px-4 py-2"
                                onClick={handleDeleteEmployeeType}
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-[400px] relative">
      {/* Close Button */}
      <button
        onClick={() => setShowPopup(false)}
        className="absolute top-2 right-2 text-gray-500 text-xl"
      >
        &times;
      </button>

      {/* Header */}
      <h2
        className={`text-center text-xl font-bold mb-4 ${
          popupType === "success" ? "text-green-500" : "text-red-500"
        }`}
      >
        {popupType === "success" ? "Success" : "Error"}
      </h2>

      {/* Message */}
      <p className="text-center mb-4">{popupMessage}</p>

      {/* Close Button */}
      <div className="flex justify-center">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setShowPopup(false)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

        </div>
    );
};

export default EmployeeTypeManager;
