import { useState } from "react";
import { Pagination, Box } from "@mui/material";
import dayjs from "dayjs";
import { MdSearch } from "react-icons/md";

const Mappinglanding = ({ data = [], onAddNew, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 13;

  const filterData = data.filter((mapping) =>
    mapping.minionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||  mapping.masterId?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filterData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filterData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div>
      {/* <h2 className="text-lg m-3 font-bold">Mapping</h2>
      <hr /> */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl  font-bold m-4">
            All Mappings{" "}
            <span className="text-sm">({filterData.length} items)</span>
          </h1>
        </div>
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
        </div>
        <div>
          <button
            className="text-white bg-[#586f80] p-1 w-32 rounded-md mr-5"
            onClick={onAddNew}
          >
            +Add Mappings
          </button>
        </div>
      </div>
      <div>
        <div className="flex w-[98%] m-auto bg-gray-100 font-bold text-[#637f92]">
          <div className="border p-3 w-full md:w-1/3 ">Master ID</div>
          <div className="border p-3 w-full md:w-1/3 ">Minion Id</div>
          <div className="border p-3 w-full md:w-1/3">
            Percentage for Replication
          </div>
          <div className="border p-3 w-full md:w-1/3">Replication</div>
          <div className="border p-3 w-full md:w-1/3">Created At</div>
          <div className="border p-3 w-full md:w-1/3">Actions</div>
        </div>
      </div>
      {paginatedData.map((mapping, index) => (
        <div
          key={mapping.id || index}
          className="flex w-[98%] m-auto hover:bg-gray-50"
        >
          <div className="border p-3 w-full md:w-1/3 ">{mapping.masterId}</div>
          <div className="border p-3 w-full md:w-1/3 ">{mapping.minionId}</div>
          <div className="border p-3 w-full md:w-1/3">
            {mapping.replicationPercentage} 
          </div>
          <div className="border p-3 w-full md:w-1/3">{mapping.toggle}yes</div>
          {/* <div className="border p-3 w-full md:w-1/3">{mapping.replication}</div> */}
          <div className="border p-3 w-full md:w-1/3">
            {dayjs(mapping.createdAt).format("YYYY-MM-DD HH:mm:ss")}
          </div>
          <div className="border p-3 w-full md:w-1/3">
            <button
              onClick={() => onEdit && onEdit(mapping)}
              className="text-blue-600 underline hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(mapping._id)}
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

export default Mappinglanding;
