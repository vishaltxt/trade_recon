import React, { useEffect, useState } from "react";
import { MdSearch } from "react-icons/md";
import axios from "axios";
import { Pagination, Box} from "@mui/material";

const MasterLanding = ({ onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 13;

  useEffect(() => {
    axios.get("http://localhost:8000/api/data/master")
      .then(res => {
        setTrades(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching trade data:", err);
        setLoading(false);
      });
  }, []);

  const filterData = trades.filter((user) =>
    user.trade_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filterData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filterData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  if (loading) return <div className="p-4">Loading...</div>;

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
            placeholder="Search by Client Code"
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
      </div>

      {/* Table rows */}
      {paginatedData.map((item, index) => (
        <div key={index} className="flex w-[98%] m-auto hover:bg-gray-50">
          <div className="border p-3 w-full md:w-1/3">{item.trade_no}</div>
          <div className="border p-3 w-full md:w-1/3">{item.trade_no}</div>
          <div className="border p-3 w-full md:w-1/3">{item.order_time}</div>
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

// import React, { useEffect, useState } from "react";
// import { MdSearch } from "react-icons/md";
// import axios from "axios";
// const MasterLanding = ({ onAddNew }) => {
//   const [searchTerm, setSearchTerm] = useState("");

//   // const data = [/
//     // { master_name: "vishal", master_id: "544", created_at: "12-01-20250" },
//     // { master_name: "suraj", master_id: "223", created_at: "01-01-2025" },
//     // { master_name: "rahul", master_id: "123", created_at: "10-04-2025" },
//   // ];
//   const [trades, setTrades] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const filterData = trades.filter((user) =>
//     user.client_code.toLowerCase().includes(searchTerm.toLowerCase())
//   );
//   useEffect(() => {
//     axios.get('http://localhost:8000/api/data/master') // Adjust port/path as needed
//       .then(res => {
//         setTrades(res.data);
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error('Error fetching trade data:', err);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <div className="p-4">Loading...</div>;
//   return (
//     <div className="w-full">
//       <div className="flex justify-between">
//         <div>
//           <h1 className="text-xl font-bold m-4">
//             Masters<span className="text-sm">1 items</span>
//           </h1>
//         </div>
//         <div>
//           <MdSearch className="relative  top-7 left-1 " />
//           <input
//             type="text"
//             placeholder="Search by Master Name"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="border rounded-lg p-1 mr-4 text-center"
//           />
//           <button
//             className="text-white bg-[#586f80] p-1 w-28 mr-5 rounded-md"
//             onClick={onAddNew}
//           >
//             +Add Master
//           </button>
//         </div>
//       </div>
//       <div>
//         <div className="flex w-[98%] m-auto bg-gray-100 font-bold text-[#637f92]">
//           <div className="border p-3 w-full md:w-1/3 ">Master Name</div>
//           <div className="border p-3 w-full md:w-1/3 ">Master Id</div>
//           <div className="border p-3 w-full md:w-1/3">Created At</div>
//         </div>
//       </div>
//       {filterData.map((items, index) => (
//         <div key={index} className="flex w-[98%] m-auto hover:bg-gray-50">
//           <div className="border p-3 w-full md:w-1/3 ">{items.trade_no}</div>
//           <div className="border p-3 w-full md:w-1/3 ">{items.trade_no}</div>
//           <div className="border p-3 w-full md:w-1/3">{items.order_time}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default MasterLanding;
