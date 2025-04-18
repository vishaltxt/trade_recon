import React, { useState } from "react";
import { MdSearch } from "react-icons/md";
import Pagination from "@mui/material/Pagination";

const Minionlanding = ({ onAddNew, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const data = [
    {
      minion_name: "09",
      minion_id: "544",
      client_code: 12345,
      created_at: "12-01-20250",
      server: "---",
    },
    {
      minion_name: "08",
      minion_id: "223",
      client_code: 2245,
      created_at: "01-01-2025",
      server: "---",
    },
    {
      minion_name: "07",
      minion_id: "123",
      client_code: 33345,
      created_at: "10-04-2025",
      server: "---",
    },
  ];
  const filterData = data.filter((user) =>
    user.minion_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="w-full">
        <div className="flex justify-between">
          <div>
            <h1 className="text-xl  font-bold m-4">Minions</h1>
          </div>
          <div></div>
          <div>
            <MdSearch className="relative top-11 left-5 " />
            <input
              type="text"
              placeholder="Search by Minion Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-lg p-1 m-4  text-center"
            />
            <button
              className="text-white bg-[#586f80] p-1 w-28 mr-5 rounded-md"
              onClick={onAddNew}
            >
              +Add Minion
            </button>
          </div>
        </div>
        <div>
          <div className="flex w-[98%] m-auto bg-gray-100 font-bold text-[#637f92]">
            <div className="border p-3 w-full md:w-1/3 ">Minion Name</div>
            <div className="border p-3 w-full md:w-1/3 ">Minion Id</div>
            <div className="border p-3 w-full md:w-1/3">Client Code</div>
            <div className="border p-3 w-full md:w-1/3">Created At</div>
            <div className="border p-3 w-full md:w-1/3">Server</div>
          </div>
        </div>
        {filterData.map((items, index) => (
          <div key={index} className="flex w-[98%] m-auto hover:bg-gray-50">
            <div className="border p-3 w-full md:w-1/3 ">{items.minion_name}</div>
            <div className="border p-3 w-full md:w-1/3 ">{items.minion_id}</div>
            <div className="border p-3 w-full md:w-1/3">{items.client_code}</div>
            <div className="border p-3 w-full md:w-1/3">{items.created_at}</div>
            <div className="border p-3 w-full md:w-1/3">{items.server}</div>
          </div>
        ))}
      </div>
      <div className="m-5">
        {/* <Stack spacing={2}> */}
        <Pagination count={10}  variant="outlined" shape="rounded"/>
        {/* </Stack> */}
      </div>
    </div>
  );
};

export default Minionlanding;
