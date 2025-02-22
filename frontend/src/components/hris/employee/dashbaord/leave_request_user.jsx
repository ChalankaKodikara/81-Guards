import React from "react";
import { IoIosCloseCircle } from "react-icons/io";

const Leave_Request_User = ({ onClose }) => {
  return (
    <div className="bg-white p-5 rounded-lg">
      <div>
        <div className="flex justify-between items-center mb-5">
          <p className="text-[25px] font-semibold">Request for Leave</p>
          <IoIosCloseCircle
            className="w-8 h-8 cursor-pointer"
            onClick={onClose}
          />
        </div>
      </div>

      <form>
        <div>
          <div className="flex gap-[45px]">
            <label className="text-lg font-semibold">Type</label>
            <input className="border border-[#8764A0] rounded-lg h-10 w-[300px]" />
          </div>
        </div>

        <div className="mt-5">
          <div className="flex gap-[45px]">
            <label className="text-lg font-semibold">Date</label>
            <input
              type="date"
              className="border border-[#8764A0] rounded-lg  h-10 w-[300px]"
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="flex gap-[26px]">
            <label className="text-lg font-semibold">Reason</label>
            <textarea className="border border-[#8764A0] rounded-lg h-[200px] w-[300px]" />
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button className="bg-[#8764A0] text-white p-3 rounded-lg">
            Done
          </button>
        </div>
      </form>
    </div>
  );
};

export default Leave_Request_User;
