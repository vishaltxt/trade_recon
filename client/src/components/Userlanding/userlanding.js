import React, { useState } from "react";
import { MdSearch } from "react-icons/md";
import { Pagination, Box } from "@mui/material";

const UserLanding = ({ data = [], onAddNew, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 13;

  const filterData = data.filter((user) =>
    `${user.firstname} ${user.lastname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
  // console.log("data",data)
  // console.log("filterdata",filterData)
  const totalPages = Math.ceil(filterData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filterData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  return (
    <div className="w-full">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold m-4">
            Users <span className="text-sm">{filterData.length} items</span>
          </h1>
        </div>
        <div>
          <MdSearch className="relative top-11 left-5 " />
          <input
            type="text"
            placeholder="Search by User Name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-lg p-1 m-4 text-center"
          />
          <button
            className="text-white bg-[#586f80] p-1 w-24 mr-5 rounded-md"
            onClick={onAddNew}
          >
            + Add User
          </button>
        </div>
      </div>

      <div className="flex w-[98%] m-auto bg-gray-100 font-bold text-[#637f92]">
        <div className="border p-3 w-full md:w-1/4">Name</div>
        <div className="border p-3 w-full md:w-1/4">E-mail</div>
        <div className="border p-3 w-full md:w-1/4">Role</div>
        <div className="border p-3 w-full md:w-1/4">Actions</div>
      </div>

      {paginatedData.map((user, index) => (
        <div
          key={user.id || index}
          className="flex w-[98%] m-auto hover:bg-gray-50"
        >
          <div className="border p-3 w-full md:w-1/4">{`${user.firstname} ${user.lastname}`}</div>
          <div className="border p-3 w-full md:w-1/4">{user.email}</div>
          <div className="border p-3 w-full md:w-1/4">{user.role}</div>
          <div className="border p-3 w-full md:w-1/4">
            <button
              onClick={() => onEdit && onEdit(user)}
              className="text-blue-600 underline hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(user._id)}
              className="text-red-600 underline hover:text-red-800 ml-2"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      <Box mt={4} display="flex" justifyContent="center">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                variant="outlined"
                shape="rounded"
              />
            </Box>
    </div>
  );
};

export default UserLanding;

// import React, { useState } from "react";
// import { MdSearch } from "react-icons/md";

// const UserLanding = ({ onAddNew, onEdit }) => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const data = [
//     { name: "vishal", email: "vis@gmail.com", role: "Admin" },
//     { name: "suraj", email: "suraj@gmail.com", role: "Manager" },
//     { name: "rahul", email: "rahul@gmail.com", role: "Reader" },
//   ];

//   const filterData = data.filter((user) =>
//     user.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );
//   return (
//     <div className="w-full">
//       <div className="flex justify-between">
//         <div>
//           <h1 className="text-2xl font-bold m-4">Users <span className="text-sm">1 items</span></h1>
//         </div>
//         <div>
//           <MdSearch className="relative top-11 left-5 " />
//           <input
//             type="text"
//             placeholder="Search by User Name"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="border rounded-lg p-1 m-4 text-center"
//           />
//           <button
//             className="text-white bg-[#586f80] p-1 w-24 mr-5 rounded-md"
//             onClick={onAddNew}
//           >
//             + Add User
//           </button>
//         </div>
//       </div>
//       <div>
//         <div className="flex w-[98%] m-auto bg-gray-100 font-bold text-[#637f92]">
//           <div className="border p-3 w-full md:w-1/3 ">Name</div>
//           <div className="border p-3 w-full md:w-1/3 ">E-mail</div>
//           <div className="border p-3 w-full md:w-1/3">Role</div>
//         </div>
//       </div>
//       {/* {data.map((items, index) => (
//         <div key={index} className="flex w-11/12 m-auto">
//           <div className="border p-3 w-full md:w-1/3 ">{items.name}</div>
//           <div className="border p-3 w-full md:w-1/3 ">{items.email}</div>
//           <div className="border p-3 w-full md:w-1/3">{items.role}</div>
//         </div>
//       ))} */}

//       {filterData.map((items, index) => (
//         <div key={index} className="flex w-[98%] m-auto hover:bg-gray-50">
//           <div className="border p-3 w-full md:w-1/3 ">{items.name}</div>
//           <div className="border p-3 w-full md:w-1/3 ">{items.email}</div>
//           <div className="border p-3 w-full md:w-1/3">{items.role}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default UserLanding;
