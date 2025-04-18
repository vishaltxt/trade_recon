import React, { useState } from "react";
import { MdSearch } from "react-icons/md";
const UserLanding = ({ users, onAddNew, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const data = [
    { name: "vishal", email: "vis@gmail.com", role: "Admin" },
    { name: "suraj", email: "suraj@gmail.com", role: "Manager" },
    { name: "rahul", email: "rahul@gmail.com", role: "Reader" },
  ];

  const filteredData = data.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="w-full">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold m-4">Users <span className="text-sm">1 items</span></h1>
        </div>
        <div>
          <MdSearch className="relative top-11 left-5 " />
          <input
            type="text"
            placeholder="Search by User Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg p-1 m-4  text-center"
          />
          <button
            className="text-white bg-[#586f80] p-0.5 w-24 mr-5 rounded-md"
            onClick={onAddNew}
          >
            + Add User
          </button>
        </div>
      </div>
      <div>
        <div className="flex w-[98%] m-auto bg-gray-100 font-bold text-[#637f92]">
          <div className="border p-3 w-full md:w-1/3 ">Name</div>
          <div className="border p-3 w-full md:w-1/3 ">E-mail</div>
          <div className="border p-3 w-full md:w-1/3">Role</div>
        </div>
      </div>
      {/* {data.map((items, index) => (
        <div key={index} className="flex w-11/12 m-auto">
          <div className="border p-3 w-full md:w-1/3 ">{items.name}</div>
          <div className="border p-3 w-full md:w-1/3 ">{items.email}</div>
          <div className="border p-3 w-full md:w-1/3">{items.role}</div>
        </div>
      ))} */}

      {filteredData.map((items, index) => (
        <div key={index} className="flex w-[98%] m-auto">
          <div className="border p-3 w-full md:w-1/3 ">{items.name}</div>
          <div className="border p-3 w-full md:w-1/3 ">{items.email}</div>
          <div className="border p-3 w-full md:w-1/3">{items.role}</div>
        </div>
      ))}
    </div>
  );
};

export default UserLanding;
