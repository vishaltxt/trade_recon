import React, { useEffect, useState } from "react";
import { MdSearch } from "react-icons/md";
import axios from "axios";
import { Pagination, Box } from "@mui/material";
import Dashboard from "../components/Dashboard/dashboard";

const Search = ({ onAddNew}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    useEffect(() => {
        axios.get("http://localhost:8000/api/auth/master")
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
        user.order_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log("trades", trades)
    console.log("filterdata", filterData)
    const totalPages = Math.ceil(filterData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filterData.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="flex">
            <Dashboard />
            <div className="w-full">
                <div className="flex justify-between items-center flex-wrap">
                    <h1 className="text-xl font-bold m-4">
                        Search data <span className="text-sm text-gray-500">({filterData.length} items)</span>
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
                        {/* <button
                            className="text-white bg-[#586f80] py-1 px-4 rounded-md"
                            onClick={onAddNew}
                        >
                            +Add Master
                        </button> */}
                    </div>
                </div>

                {/* Table headers */}
                <div className="flex w-[98%] m-auto bg-gray-100 font-bold text-[#637f92]">
                    {/* <div className="border p-1 w-full md:w-1/3">id</div> */}
                    {/* <div className="border p-1 w-full md:w-1/3">segment</div> */}
                    {/* <div className="border p-1 w-full md:w-1/3">instrument</div> */}
                    <div className="border p-1 w-full md:w-1/3">symbol</div>
                    <div className="border p-1 w-full md:w-1/3">expiry</div>
                    <div className="border p-1 w-full md:w-1/3">strike_price</div>
                    <div className="border p-1 w-full md:w-1/3">contract</div>
                    <div className="border p-1 w-full md:w-1/3">multiplier</div>
                    <div className="border p-1 w-full md:w-1/3">product_type</div>
                    <div className="border p-1 w-full md:w-1/3">lot_size</div>
                    <div className="border p-1 w-full md:w-1/3">client_code</div>
                    {/* <div className="border p-1 w-full md:w-1/3">field_1</div> */}
                    <div className="border p-1 w-full md:w-1/3">field_2</div>
                    <div className="border p-1 w-full md:w-1/3">price</div>
                    <div className="border p-1 w-full md:w-1/3">quantity</div>
                    <div className="border p-1 w-full md:w-1/3">field_3</div>
                    <div className="border p-1 w-full md:w-1/3">order_no</div>
                    <div className="border p-1 w-full md:w-1/3">trade_no</div>
                    <div className="border p-1 w-full md:w-1/3">status</div>
                    <div className="border p-1 w-full md:w-1/3">cover</div>
                    <div className="border p-1 w-full md:w-1/3">order_time</div>
                    <div className="border p-1 w-full md:w-1/3">trade_time</div>
                    <div className="border p-1 w-full md:w-1/3">exchange_order_id</div>
                    <div className="border p-1 w-full md:w-1/3">ref_no</div>
                    <div className="border p-1 w-full md:w-1/3">entry_time</div>
                    <div className="border p-1 w-full md:w-1/3">branch_code</div>
                </div>

                {/* Table rows */}
                {paginatedData.map((master, index) => (
                    <div key={master.id || index} className="flex w-[98%] m-auto hover:bg-gray-50">
                        {/* <div className="border p-1 w-full md:w-1/3">{master.id}</div> */}
                        {/* <div className="border p-1 w-full md:w-1/3">{master.segment}</div> */}
                        {/* <div className="border p-1 w-full md:w-1/3">{master.instrument}</div> */}
                        <div className="border p-1 w-full md:w-1/3">{master.symbol}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.expiry}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.strike_price}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.contract}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.multiplier}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.product_type}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.lot_size}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.client_code}</div>
                        {/* <div className="border p-1 w-full md:w-1/3">{master.field_1}</div> */}
                        <div className="border p-1 w-full md:w-1/3">{master.field_2}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.price}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.quantity}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.field_3}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.order_no}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.trade_no}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.status}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.cover}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.order_time}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.trade_time}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.exchange_order_id}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.ref_no}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.entry_time}</div>
                        <div className="border p-1 w-full md:w-1/3">{master.branch_code}</div>
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
        </div>
    );
};

export default Search;