import React from "react";
import { Calendar } from "antd";
import "antd/dist/reset.css";
import "./calendar.css";

const CustomCalendar = () => {
  return (
    <div className="p-6 bg-white ">
      <Calendar
        fullscreen={false}
       
        headerRender={({ value, onChange }) => {
          const current = value.format("MMMM YYYY");
          return (
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => onChange(value.clone().subtract(1, "month"))}>
                &lt;
              </button>
              <span className="font-bold">{current}</span>
              <button onClick={() => onChange(value.clone().add(1, "month"))}>
                &gt;
              </button>
            </div>
          );
        }}
      />
    </div>
  );
};

export default CustomCalendar;
