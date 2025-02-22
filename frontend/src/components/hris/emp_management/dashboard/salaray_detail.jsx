import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import moment from "moment";

const SalaryOverview = ({ onDataFetched }) => {
  const [data, setData] = useState([]);
  const API_URL = process.env.REACT_APP_FRONTEND_URL;

  useEffect(() => {
    const fetchSalaryData = async () => {
      try {
        const response = await fetch(`${API_URL}/v1/hris/payroll/getPayrollTotal`);
        const result = await response.json();

        if (result.success) {
          // Transform the data for the bar chart
          const formattedData = result.data.map((item) => ({
            name: moment(item.month, "YYYY-MM").format("MMMM"), // Convert "YYYY-MM" to month name
            salary: parseFloat(item.total), // Convert total to a number
          }));
          setData(formattedData);

          // Pass the latest month's total and percentageChange to the parent component
          if (result.data.length > 0) {
            const latestMonth = result.data[result.data.length - 1];
            onDataFetched({
              total: latestMonth.total,
              percentageChange: latestMonth.percentageChange,
            });
          }
        } else {
          console.error("Error fetching salary data:", result.error || result);
        }
      } catch (error) {
        console.error("Error fetching salary data:", error);
      }
    };

    fetchSalaryData();
  }, [API_URL, onDataFetched]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6"></div>
      <ResponsiveContainer width="120%" height={200}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
          <XAxis dataKey="name" /> {/* Display month names on the X-axis */}
          <YAxis hide />
          <Tooltip />
          <Bar dataKey="salary" fill="#236adb" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalaryOverview;