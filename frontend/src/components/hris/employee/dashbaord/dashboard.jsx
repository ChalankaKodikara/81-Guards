import React, { useState, useEffect } from "react";
import User_Nav from "../user-navbar/user-navbar";
import { FiSun } from "react-icons/fi";
import moment from "moment";
import { HiUsers } from "react-icons/hi";
import { TfiStatsUp } from "react-icons/tfi";
import { IoMdTimer } from "react-icons/io";
import Attendance_Overview from "./attendance_table";
import Leave_Request_User from "./leave_request_user";
import { FiMoon } from "react-icons/fi";

const Dashboard = () => {
  const currentDate = moment().format("MMMM Do YYYY");
  const [currentTime, setCurrentTime] = useState(moment().format("h:mm:ss a"));
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format("h:mm:ss a"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#F1F2F6] overflow-y-auto h-screen">
      <div>
        <User_Nav />
      </div>

      <div className="flex gap-10 mt-10 mx-[5%] justify-center">
        {/* Time and date card */}
        <div>
          <div className="bg-white p-6 py-[100px] rounded-lg h-[540px] w-[400px]">
            <div className="flex items-center gap-5 px-10">
              <div>
                <FiSun className="w-[80px] h-[80px] opacity-45" />
              </div>
              <div className="font-bold text-[28px] text-[#3D0B5E]">
                {currentTime}
                <p className="text-lg font-normal">Real Time Insight</p>
              </div>
            </div>

            <div className="mt-[50px] font-bold px-10">
              <p className="font-bold text-[#3D0B5E] text-[25px]">Today :</p>
              <div className="text-[#3D0B5E] text-[20px]">{currentDate}</div>
            </div>

            <div className="mt-5 px-10">
              <button
                onClick={handleOpenModal}
                className="bg-primary_purple text-white p-2 rounded-lg text-[20px]"
              >
                New Leave Application
              </button>
            </div>
          </div>
        </div>

        {/* Other cards */}
        <div className="grid grid-cols-3 grid-flow-row gap-8">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-lg w-[320px] h-[250px]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[48px] text-[#3D0B5E]">12/20</p>
              </div>
              <div className="bg-[#E6EAF5] rounded-full p-3">
                <HiUsers className="h-[20px] w-[18px]" />
              </div>
            </div>

            <div>
              <p className="text-[25px]">Medical Leaves</p>

              <div className="flex items-center gap-3 mt-5">
                <div className="bg-[#A07AF0] rounded-full p-2"></div>
                <p className="text-lg">Remaining Count : 12</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-lg w-[320px] h-[250px]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[48px] text-[#3D0B5E]">12/20</p>
              </div>
              <div className="bg-[#E6EAF5] rounded-full p-3">
                <TfiStatsUp />
              </div>
            </div>

            <div>
              <p className="text-[25px]">Medical Leaves</p>

              <div className="flex items-center gap-3 mt-5">
                <div className="bg-[#F2E56F] rounded-full p-2"></div>
                <p className="text-lg">Remaining Count : 12</p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-lg w-[320px] h-[250px]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[48px] text-[#3D0B5E]">12/20</p>
              </div>
              <div className="bg-[#E6EAF5] rounded-full p-3">
                <IoMdTimer />
              </div>
            </div>

            <div>
              <p className="text-[25px]">Medical Leaves</p>

              <div className="flex items-center gap-3 mt-5">
                <div className="bg-[#FA0BA9] rounded-full p-2"></div>
                <p className="text-lg">Remaining Count : 12</p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-lg w-[320px] h-[250px]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[48px] text-[#3D0B5E]">12/20</p>
              </div>
              <div className="bg-[#E6EAF5] rounded-full p-3">
                <HiUsers />
              </div>
            </div>

            <div>
              <p className="text-[25px]">Medical Leaves</p>

              <div className="flex items-center gap-3 mt-5">
                <div className="bg-[#B0F07A] rounded-full p-2"></div>
                <p className="text-lg">Remaining Count : 12</p>
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white p-5 rounded-lg w-[320px] h-[250px]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[48px] text-[#3D0B5E]">12/20</p>
              </div>
              <div className="bg-[#E6EAF5] rounded-full p-3">
                <FiMoon />
              </div>
            </div>

            <div>
              <p className="text-[25px]">Medical Leaves</p>

              <div className="flex items-center gap-3 mt-5">
                <div className="bg-[#FF8A00] rounded-full p-2"></div>
                <p className="text-lg">Remaining Count : 12</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Attendance_Overview />
      </div>

      {/* Modal for Leave_Request_User */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-400 bg-opacity-55 z-50">
          <div className="bg-white rounded-lg p-8">
            <Leave_Request_User onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
