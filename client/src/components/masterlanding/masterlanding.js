import React, { useState } from "react";
import { MdSearch } from "react-icons/md";

const MasterLanding = ({ onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const data = [
    { master_name: "vishal", master_id: "544", created_at: "12-01-20250" },
    { master_name: "suraj", master_id: "223", created_at: "01-01-2025" },
    { master_name: "rahul", master_id: "123", created_at: "10-04-2025" },
  ];

  const filterData = data.filter((user) =>
    user.master_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="w-full">
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-bold m-4">
            Masters<span className="text-sm">1 items</span>
          </h1>
        </div>
        <div>
          <MdSearch className="relative top-11 left-5 " />
          <input
            type="text"
            placeholder="Search by Master Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg p-1 m-4 text-center"
          />
          <button
            className="text-white bg-[#586f80] p-1 w-28 mr-5 rounded-md"
            onClick={onAddNew}
          >
            +Add Master
          </button>
        </div>
      </div>
      <div>
        <div className="flex w-[98%] m-auto bg-gray-100 font-bold text-[#637f92]">
          <div className="border p-3 w-full md:w-1/3 ">Master Name</div>
          <div className="border p-3 w-full md:w-1/3 ">Master Id</div>
          <div className="border p-3 w-full md:w-1/3">Created At</div>
        </div>
      </div>
      {filterData.map((items, index) => (
        <div key={index} className="flex w-[98%] m-auto">
          <div className="border p-3 w-full md:w-1/3 ">{items.master_name}</div>
          <div className="border p-3 w-full md:w-1/3 ">{items.master_id}</div>
          <div className="border p-3 w-full md:w-1/3">{items.created_at}</div>
        </div>
      ))}
    </div>
  );
};

export default MasterLanding;
