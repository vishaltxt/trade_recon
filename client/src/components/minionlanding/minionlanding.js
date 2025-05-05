import React, { useState } from "react";
import { MdSearch } from "react-icons/md";
import { Pagination, Box } from "@mui/material";

const Minionlanding = ({ data = [], onAddNew, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 13;

  const filterData = data.filter((minion) =>
    minion.minionName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filterData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filterData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  return (
    <div>
      <div className="w-full">
        <div className="flex justify-between">
          <div>
            <h1 className="text-xl  font-bold m-4">
              Minions{" "}
              <span className="text-sm text-gray-500">
                ({filterData.length} items)
              </span>
            </h1>
          </div>
          <div></div>
          <div>
            <MdSearch className="relative top-11 left-5 " />
            <input
              type="text"
              placeholder="Search by Minion Name"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset page on new search
              }}
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
            <div className="border p-3 w-full md:w-1/3">Actions</div>
          </div>
        </div>
        {paginatedData.map((minion, index) => (
          <div
            key={minion.id || index}
            className="flex w-[98%] m-auto hover:bg-gray-50"
          >
            <div className="border p-3 w-full md:w-1/3 ">{minion.minionName}</div>
            <div className="border p-3 w-full md:w-1/3 ">{minion.minionTraderId}</div>
            <div className="border p-3 w-full md:w-1/3">{minion.minionClientCode}</div>
            <div className="border p-3 w-full md:w-1/3">{minion.createdAt}</div>
            <div className="border p-3 w-full md:w-1/3">{minion.server}</div>
            <div className="border p-3 w-full md:w-1/3">
              <button
                onClick={() => onEdit && onEdit(minion)}    
                className="text-blue-600 underline hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(minion._id)}
                className="text-red-600 underline hover:text-red-800 ml-2"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

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
      {/* <div className="m-5"> */}
      {/* <Stack spacing={2}> */}
      {/* <Pagination count={10}  variant="outlined" shape="rounded"/> */}
      {/* </Stack> */}
      {/* </div> */}
    </div>
  );
};

export default Minionlanding;
