import React, { useState, useEffect } from "react";
import moment from "moment";
import Time_And_Attendance_Table from "./time_and_attendance_table.jsx";
import usePermissions from "../../permissions/permission.jsx";
import { LuUsers2 } from "react-icons/lu";
import { GrUserExpert } from "react-icons/gr";
import { FiUserX } from "react-icons/fi";
import { TbUserExclamation } from "react-icons/tb";
import { LiaUserAltSlashSolid } from "react-icons/lia";


const Time_And_Attendance = () => {
  const [data, setData] = useState({
    totalWorkforce: 0,
    presentWorkforce: 0,
    absentWorkforce: 0,
    lateArrivals: 0,
    inLeave: 0,
  });

  const API_URL = process.env.REACT_APP_FRONTEND_URL;
  const currentDate = moment().format("MMMM Do YYYY");
  const [currentTime, setCurrentTime] = useState(moment().format("h:mm:ss a"));
  const { hasPermission } = usePermissions();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format("h:mm:ss a"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
          const { totalWorkforce, presentWorkforce, inLeave } = result.data;

          // Update the state with fetched data
          setData((prevData) => ({
            ...prevData,
            totalWorkforce,
            presentWorkforce,
            inLeave,
          }));
        } else {
          console.error(
            "Error fetching attendance stats:",
            result.error || result
          );
        }

        // Fetch absent workforce count with today's date as startDate and endDate
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
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchLateInCount = async () => {
      try {
        const today = moment().format("YYYY-MM-DD");

        // Fetch late in count with today's date
        const response = await fetch(
          `${API_URL}/v1/hris/attendence/getLateInCount?date=${today}`
        );
        const result = await response.json();

        if (result.success) {
          const { late_in_count } = result;

          // Update the state with fetched late in count
          setData((prevData) => ({
            ...prevData,
            lateArrivals: late_in_count,
          }));
        } else {
          console.error(
            "Error fetching late in count:",
            result.error || result
          );
        }
      } catch (error) {
        console.error("Error fetching late in count:", error);
      }
    };
    fetchLateInCount();
  }, []);

  return (
    <div className="mx-10 mt-5">
      {/* second layer */}
      <div className="flex justify-between items-center mt-6">
        <div>
          <p className="text-[30px] font-semibold">
            Time and Attendance - Overview
          </p>
        </div>
      </div>

      {/* card layer */}
      <div className="border border-gray-300 rounded-lg p-5">
        <p className="text-[18px] font-semibold mb-10">Statistics</p>

        <div className="grid grid-cols-4 grid-flow-col gap-2">

          <div className="flex gap-3 items-center">
            <div className="text-4xl rounded-full p-2 bg-purple-100 text-purple-600"><LuUsers2 /></div>
            <div>
              <div className="text-2xl font-semibold ">{data.totalWorkforce}</div>
              <div className="text-sm text-gray-500">Total Workforce</div>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className="text-4xl rounded-full p-2 bg-green-100 text-green-600"><GrUserExpert />
            </div>
            <div>
              <div className="text-2xl font-semibold ">{data.presentWorkforce}</div>
              <div className="text-sm text-gray-500">Present Workforce</div>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className="text-4xl rounded-full p-2 bg-red-100 text-red-600"><FiUserX />
            </div>
            <div>
              <div className="text-2xl font-semibold ">{data.absentWorkforce}</div>
              <div className="text-sm text-gray-500">Absent Workforce</div>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className="text-4xl rounded-full p-2 bg-blue-100 text-blue-600"><TbUserExclamation />
            </div>
            <div>
              <div className="text-2xl font-semibold ">{data.lateArrivals}</div>
              <div className="text-sm text-gray-500">Late Arrivals</div>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className="text-4xl rounded-full p-2 bg-orange-100 text-orange-600"><LiaUserAltSlashSolid />
            </div>
            <div>
              <div className="text-2xl font-semibold ">{data.inLeave}</div>
              <div className="text-sm text-gray-500">In Leave</div>
            </div>
          </div>

        </div>
      </div>

      {/* lower layer */}
      <div className="mt-5">
        <Time_And_Attendance_Table
          selectedDate={moment().format("YYYY-MM-DD")}
        />
      </div>
    </div>
  );
};

export default Time_And_Attendance;
