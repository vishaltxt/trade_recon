import React, {useState } from "react";
import { MdSearch } from "react-icons/md";
import dayjs from 'dayjs';
import { Pagination, Box} from "@mui/material";

const MasterLanding = ({ data = [], onAddNew , onEdit , onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 13;

  const filterData = data.filter((master) =>
    master.masterName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filterData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filterData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center flex-wrap">
        <h1 className="text-xl font-bold m-4">
          Masters <span className="text-sm text-gray-500">({filterData.length} items)</span>
        </h1>
        <div className="flex items-center space-x-2 mr-5">
          <MdSearch className="relative top-0.5 left-7 text-gray-500" />
          <input
            type="text"
            placeholder="Search by Master Name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page on new search
            }}
            className="border rounded-lg px-8 py-1 text-sm"
          />
          <button
            className="text-white bg-[#586f80] py-1 px-4 rounded-md"
            onClick={onAddNew}
          >
            +Add Master
          </button>
        </div>
      </div>

      {/* Table headers */}
      <div className="flex w-[98%] m-auto bg-gray-100 font-bold text-[#637f92]">
        <div className="border p-3 w-full md:w-1/3">Master Name</div>
        <div className="border p-3 w-full md:w-1/3">Master Id</div>
        <div className="border p-3 w-full md:w-1/3">Created At</div>
        <div className="border p-3 w-full md:w-1/3">Actions</div>
      </div>

      {/* Table rows */}
      {paginatedData.map((master, index) => (
        <div key={master.id || index} className="flex w-[98%] m-auto hover:bg-gray-50">
          <div className="border p-3 w-full md:w-1/3">{master.masterName}</div>
          <div className="border p-3 w-full md:w-1/3">{master.masterTraderId}</div>
          <div className="border p-3 w-full md:w-1/3">{dayjs(master.createdAt).format("YYYY-MM-DD HH:mm:ss")}</div>
          <div className="border p-3 w-full md:w-1/3">
            <button
              onClick={() => onEdit && onEdit(master)}
              className="text-blue-600 underline hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(master._id)}
              className="text-red-600 underline hover:text-red-800 ml-2"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Pagination Controls */}
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

export default MasterLanding;
