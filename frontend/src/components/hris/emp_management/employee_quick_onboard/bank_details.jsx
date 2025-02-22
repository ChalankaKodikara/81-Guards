import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { LuUpload } from "react-icons/lu";
import { FaRegFilePdf } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import { saveEmployeeData } from "../../../../reducers/employeeSlice";
import { useDispatch, useSelector } from "react-redux";

const Bank_Details = ({ data, setData, handlePrevStep, handleNextStep }) => {
  // Initialize state with all necessary fields from `data`
  const [bankDetails, setBankDetails] = useState({
    employee_account_no: "",
    employee_account_name: "",
    employee_bank_name: "",
    employee_branch_name: "",
    employee_bank_code: "",
    employee_branch_code: "",
    employee_bank_details_uploaded_file: null,
    employee_visa_category: "",
    employee_visa_office: "",
    ...data, // Spread the `data` prop to override defaults
  });

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

  // Update state when `data` prop changes
  useEffect(() => {
    setBankDetails((prevData) => ({
      ...prevData,
      ...data, // Merge new `data` into existing state
    }));
  }, [data]);

  // Handle change in input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file upload using react-dropzone
  const onDrop = (acceptedFiles) => {
    const validFile = acceptedFiles.find((file) =>
      ["application/pdf"].includes(file.type)
    );

    if (validFile) {
      const fileMetadata = {
        lastModified: validFile.lastModified,
        lastModifiedDate: validFile.lastModifiedDate,
        name: validFile.name,
        size: validFile.size,
        type: validFile.type,
        webkitRelativePath: validFile.webkitRelativePath,
      };

      setBankDetails((prevData) => ({
        ...prevData,
        employee_bank_details_uploaded_file: validFile,
      }));

      dispatch(
        saveEmployeeData({
          ...bankDetails,
          employee_bank_details_uploaded_file: fileMetadata,
        })
      );
    } else {
      alert("Invalid file type. Please upload a PDF.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  // Remove uploaded file
  const handleRemoveFile = () => {
    setBankDetails((prevData) => ({
      ...prevData,
      employee_bank_details_uploaded_file: null,
    }));
  };

  // Handle next step
  const handleNext = () => {
    setData(bankDetails); // Update parent state
    dispatch(saveEmployeeData(bankDetails)); // Save to Redux
    handleNextStep(true); // Move to the next step
  };

  // Handle previous step
  const handlePrev = () => {
    setData(bankDetails); // Save the current data before going to previous
    handlePrevStep(true); // Go to the previous step
  };

  return (
    <div>
      <h1 className="text-[30px] font-bold col-span-3 mt-8">Bank Details</h1>
      <div className="grid grid-cols-2 gap-y-[30px] gap-x-[60px] text-[20px]">
        {/* Account Number */}
        <div>
          <label className="block text-gray-700">Account Number</label>
          <input
            type="text"
            name="employee_account_no"
            value={bankDetails.employee_account_no}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
          {errors.employee_account_no && (
            <p className="text-red-500">{errors.employee_account_no}</p>
          )}
        </div>

        {/* Account Name */}
        <div>
          <label className="block text-gray-700">Account Name</label>
          <input
            type="text"
            name="employee_account_name"
            value={bankDetails.employee_account_name}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
          {errors.employee_account_name && (
            <p className="text-red-500">{errors.employee_account_name}</p>
          )}
        </div>

        {/* Bank Name */}
        <div>
          <label className="block text-gray-700">Bank Name</label>
          <input
            type="text"
            name="employee_bank_name"
            value={bankDetails.employee_bank_name}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
          {errors.employee_bank_name && (
            <p className="text-red-500">{errors.employee_bank_name}</p>
          )}
        </div>

        {/* Branch Name */}
        <div>
          <label className="block text-gray-700">Branch Name</label>
          <input
            type="text"
            name="employee_branch_name"
            value={bankDetails.employee_branch_name}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
          {errors.employee_branch_name && (
            <p className="text-red-500">{errors.employee_branch_name}</p>
          )}
        </div>

        {/* Bank Code */}
        <div>
          <label className="block text-gray-700">Bank Code</label>
          <input
            type="text"
            name="employee_bank_code"
            value={bankDetails.employee_bank_code || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
          {errors.employee_bank_code && (
            <p className="text-red-500">{errors.employee_bank_code}</p>
          )}
        </div>

        {/* Branch Code */}
        <div>
          <label className="block text-gray-700">Branch Code</label>
          <input
            type="text"
            name="employee_branch_code"
            value={bankDetails.employee_branch_code || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
          {errors.employee_branch_code && (
            <p className="text-red-500">{errors.employee_branch_code}</p>
          )}
        </div>
      </div>

      {/* File Upload Section */}
      <div className="mt-8">
        <div
          {...getRootProps()}
          className={`border-dashed border-2 p-6 rounded-lg ${isDragActive ? "bg-gray-200" : "bg-gray-0"
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <LuUpload size={32} color="#4b5563" />
            {bankDetails.employee_bank_details_uploaded_file ? (
              <div className="mt-4 flex items-center">
                <FaRegFilePdf size={32} color="#4b5563" />
                <span className="text-gray-600 text-lg">
                  {bankDetails.employee_bank_details_uploaded_file.name}
                </span>
                <button
                  className="ml-4 text-red-500 font-bold"
                  onClick={handleRemoveFile}
                >
                  Remove
                </button>
              </div>
            ) : (
              <p className="mt-4 text-lg text-gray-600">
                {isDragActive
                  ? "Drop your file here..."
                  : "Drag and drop your Document here"}
              </p>
            )}
            {!bankDetails.employee_bank_details_uploaded_file &&
              !isDragActive && (
                <p className="mt-2 text-blue-500 cursor-pointer">
                  or <span className="font-semibold">Browse Document</span>
                </p>
              )}
          </div>
        </div>
      </div>

      {/* Visa Details Section */}
      <h1 className="text-[20px] font-bold col-span-3 mt-8">Visa Details</h1>
      <div className="grid grid-cols-2 gap-y-[30px] gap-x-[60px] text-[20px]">
        <div>
          <label className="block text-gray-700">Visa Category</label>
          <input
            type="text"
            name="employee_visa_category"
            value={bankDetails.employee_visa_category}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
          {errors.employee_visa_category && (
            <p className="text-red-500">{errors.employee_visa_category}</p>
          )}
        </div>
        <div>
          <label className="block text-gray-700">Visa Office</label>
          <input
            type="text"
            name="employee_visa_office"
            value={bankDetails.employee_visa_office}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
          {errors.employee_visa_office && (
            <p className="text-red-500">{errors.employee_visa_office}</p>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          className="bg-gray-100 p-3 text-gray-400 rounded-lg flex items-center"
          onClick={handlePrev}
        >
          <FaArrowRight className="rotate-180 mr-2" /> Previous
        </button>
        <button
          className="bg-blue-500 p-3 text-white rounded-lg flex items-center"
          onClick={handleNext}
        >
          Save & Next <FaArrowRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default Bank_Details;