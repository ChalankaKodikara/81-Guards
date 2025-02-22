import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

const AttendanceChart = ({ attendanceData }) => {
  return (
    <div>
      <p className="text-[18px] font-semibold">Attendance Overview (Last 5 Days)</p>
      <div className="flex gap-6 items-center mt-6">
        <div className="flex gap-3 items-center">
          <div className="bg-green-500 rounded-full p-2 mb-4"></div>
          <p>Present</p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="bg-red-500 rounded-full p-2 mb-4"></div>
          <p>Absent</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={attendanceData} barSize={20} barCategoryGap={30}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="present" fill="#4caf50" name="Present" radius={[10, 10, 0, 0]} />
          <Bar dataKey="absent" fill="#f44336" name="Absent" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;
