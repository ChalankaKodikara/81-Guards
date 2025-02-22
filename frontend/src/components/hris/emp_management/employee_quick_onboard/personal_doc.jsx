import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { LuUpload } from "react-icons/lu";
import { AiOutlineClose } from "react-icons/ai";
import { FaRegFilePdf, FaArrowRight, FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { saveEmployeeData } from "../../../../reducers/employeeSlice"; // Keep the existing import

// Submission Status Popup Component
const SubmissionStatusPopup = ({ statuses, onClose }) => {
  const [loadingStatuses, setLoadingStatuses] = useState({});

  useEffect(() => {
    const timeoutIds = Object.keys(statuses).map((stage, index) =>
      setTimeout(() => {
        setLoadingStatuses((prev) => ({
          ...prev,
          [stage]: statuses[stage],
        }));
      }, 2000 * index)
    );

    return () => timeoutIds.forEach(clearTimeout);
  }, [statuses]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="relative bg-white p-6 rounded-lg w-1/5 h-[40%] shadow-lg">
        {/* Close Icon in the Top-Right Corner */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <AiOutlineClose size={20} />
        </button>

        <h2 className="text-lg font-bold mb-4 flex justify-center">Submission Status</h2>
        <div className="flex justify-center">
          <ul className="space-y-[40px] mt-8">
            {Object.keys(statuses).map((stage) => (
              <li key={stage} className="flex items-center">
                {loadingStatuses[stage] === undefined ? (
                  <FaSpinner className="animate-spin text-gray-500 mr-3" />
                ) : loadingStatuses[stage] ? (
                  <FaCheckCircle className="text-green-500 mr-3" />
                ) : (
                  <FaTimesCircle className="text-red-500 mr-3" />
                )}
                <span>{stage}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

  );
};

// Main Personal Document Component
const PersonalDoc = ({
  data,
  setData,
  handlePrevStep,
  handleNextStep,
  errorMessage,
}) => {
  const [uploadedFile, setUploadedFile] = useState(data || null);
  const [showPopup, setShowPopup] = useState(false);
  const [statuses, setStatuses] = useState({
    "Personal Details": false,
    "Next of Kin 1 Details": false,
    "Employment Details": false,
    "Personal Documents": false,
  });
  const dispatch = useDispatch();

  const validateFileType = (file) => {
    const allowedTypes = ["application/pdf"];
    return allowedTypes.includes(file.type);
  };

  const onDrop = (acceptedFiles) => {
    const validFile = acceptedFiles.find(validateFileType);
    if (validFile) {
      setUploadedFile((prevData) => ({
        ...prevData,
        employee_personal_document: validFile,
      }));
    } else {
      alert("Invalid file type. Please upload a PDF.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleRemoveFile = () => {
    setUploadedFile((prevData) => ({
      ...prevData,
      employee_personal_document: null,
    }));
  };

  const handleSaveAndFinish = () => {
    // Dispatch the uploaded file to Redux
    dispatch(saveEmployeeData(uploadedFile));

    // Simulate statuses (replace with actual status checks from API or Redux)
    setStatuses({
      "Personal Details": true,
      "Next of Kin 1 Details": true,
      "Employment Details": false,
      "Personal Documents": !!uploadedFile?.employee_personal_document,
    });

    setShowPopup(true); // Show the popup
  };

  return (
    <div>
      <h1 className="text-[30px] font-bold col-span-3 mt-8">Personal Document</h1>

      <div className="flex mt-8 space-x-8">
        <div
          {...getRootProps()}
          className={`border-dashed border-2 p-6 rounded-lg w-1/2 ${isDragActive ? "bg-gray-200" : "bg-gray-100"
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <LuUpload size={32} color="#4b5563" />
            <p className="mt-4 text-lg text-gray-600">
              {isDragActive
                ? "Drop your file here..."
                : "Drag and drop your document here"}
            </p>
            {!uploadedFile?.employee_personal_document && !isDragActive && (
              <p className="mt-2 text-blue-500 cursor-pointer">
                or <span className="font-semibold">Browse Document</span>
              </p>
            )}
          </div>
        </div>

        <div className="w-1/2">
          <h2 className="text-lg font-bold">Uploaded File</h2>
          {uploadedFile?.employee_personal_document ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-4">
                <FaRegFilePdf size={20} color="#4b5563" />
                <p className="text-gray-700">
                  {uploadedFile.employee_personal_document.name}
                </p>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-700"
              >
                <AiOutlineClose size={20} />
              </button>
            </div>
          ) : (
            <p className="text-gray-500">No document uploaded</p>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="text-red-600 text-sm mt-4">{errorMessage}</div>
      )}

      <div className="flex justify-between mt-8">
        <button
          className="bg-gray-100 p-3 text-gray-400 rounded-lg flex items-center"
          onClick={handlePrevStep}
        >
          <FaArrowRight className="rotate-180 mr-2" /> Previous
        </button>
        <button
          className="bg-blue-500 p-3 text-white rounded-lg flex items-center"
          onClick={handleSaveAndFinish}
        >
          Save & Finish <FaArrowRight className="ml-2" />
        </button>
      </div>

      {showPopup && (
        <SubmissionStatusPopup
          statuses={statuses}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default PersonalDoc;
