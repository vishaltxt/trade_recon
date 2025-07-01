import { useEffect, useState } from 'react';
import Dashboard from '../../components/Dashboard/dashboard';
import { MdSearch } from "react-icons/md";
import { getMasters } from '../apis/masterApi';
import { getMinionsByMasterIds } from '../apis/mappingApi';
import { toast } from 'react-toastify';
import axios from 'axios';

const Recon = () => {
    const [masters, setMasters] = useState([]);
    const [searchMasters, setSearchMasters] = useState("");
    const [searchMinions, setSearchMinions] = useState("");
    const [strikeFilter, setStrikeFilter] = useState("");

    const [showResults, setShowResults] = useState(false);
    const [selectedMasters, setSelectedMasters] = useState([]);
    const [selectedMinions, setSelectedMinions] = useState([]);

    const [filteredMinions, setFilteredMinions] = useState([]);
    const [masterDetails, setMasterDetails] = useState([]);
    const [minionDetails, setMinionDetails] = useState([]);


    const [selectedMasterCode, setSelectedMasterCode] = useState([]);
    const [selectedMinionMasterCode, setSelectedMinionMasterCode] = useState([]); // for minion container 
    const [selectedMinionMasterCodeDifference, setSelectedMinionMasterCodeDifference] = useState([]); // for minion diference container 
    // const filteredDetails = masterDetails.filter(item => item.code === selectedMasterCode);
    // console.log("filtered data ", filteredDetails)

    // Fetch all masters
    const fetchMasters = async () => {
        try {
            const res = await getMasters();
            setMasters(res.data);
        } catch (error) {
            console.error("Error fetching masters:", error);
        }
    };

    useEffect(() => {
        fetchMasters();
    }, []);

    useEffect(() => {
        const fetchMappedMinions = async (masterIds) => {
            try {
                const res = await getMinionsByMasterIds(masterIds);
                setFilteredMinions(res.data); // Assuming API returns an array of minions
            } catch (error) {
                console.error("Error fetching mapped minions:", error);
            }
        };

        if (selectedMasters.length > 0) {
            const masterIds = selectedMasters.map(m => m.masterTraderId);
            fetchMappedMinions(masterIds);
        } else {
            setFilteredMinions([]);
        }
    }, [selectedMasters]); // No need to include fetchMappedMinions in dependencies anymore

    const handleMasterSelect = (master) => {
        const exists = selectedMasters.some(m => m.masterTraderId === master.masterTraderId);
        if (exists) {
            const updated = selectedMasters.filter(m => m.masterTraderId !== master.masterTraderId);
            setSelectedMasters(updated);
        } else {
            setSelectedMasters([...selectedMasters, master]);
        }
    };

    const fetchResults = async () => {
        if (selectedMasters.length > 0 && selectedMinions.length > 0) {
            setShowResults(true);
        } else {
            toast.warning("Please select at least one master and one minion.");
            return;
        }
        try {
            const masterTraderIds = selectedMasters.map(m => m.masterTraderId);
            const minionClientCodes = selectedMinions.map(m => m.minionClientCode);
            const res = await axios.post("http://localhost:8000/api/data/tradeDatareconcile", { masterTraderIds, minionClientCodes });
            const masterSide = await res.data.masterData || [];
            const minionSide = await res.data.minionData;
            console.log("masterside data", masterSide);
            console.log("minionside data", minionSide);
            setMasterDetails(masterSide);
            setMinionDetails(minionSide);
            // Set first master code from selectedMasters as default selected master code
            if (selectedMasters.length > 0) {
                setSelectedMasterCode(selectedMasters[0].masterTraderId);
            }
            setShowResults(true);
        } catch (error) {
            console.error("Error fetching reconciliation data:", error);
            toast.error("Failed to fetch reconciliation data.");
        }
    };

    // useEffect(() => {
    //     if (showResults) {
    //         setMasterDetails(selectedMasters);
    //         setMinionDetails(selectedMinions);
    //     }
    // }, [selectedMasters, selectedMinions, showResults]);

    const handleMinionSelect = (minion) => {
        const exists = selectedMinions.some(m => m.minionClientCode === minion.minionClientCode);
        if (exists) {
            setSelectedMinions(selectedMinions.filter(m => m.minionClientCode !== minion.minionClientCode));
        } else {
            setSelectedMinions([...selectedMinions, minion]);
        }
    };

    const handleSelectAllMasters = () => {
        const filtered = masters.filter(master =>
            master.masterName.toLowerCase().includes(searchMasters.toLowerCase())
        );
        const allSelected = filtered.every(master =>
            selectedMasters.some(m => m.masterTraderId === master.masterTraderId)
        );

        if (allSelected) {
            // Unselect all in filtered list
            const updated = selectedMasters.filter(m =>
                !filtered.some(f => f.masterTraderId === m.masterTraderId)
            );
            setSelectedMasters(updated);
        } else {
            // Add only missing ones from filtered
            const updated = [...selectedMasters];
            filtered.forEach(master => {
                if (!updated.some(m => m.masterTraderId === master.masterTraderId)) {
                    updated.push(master);
                }
            });
            setSelectedMasters(updated);
        }
    };

    const handleSelectAllMinions = () => {
        const filtered = filteredMinions.filter(minion =>
            (minion.minionName || "").toLowerCase().includes(searchMinions.toLowerCase())
        );
        const allSelected = filtered.every(minion =>
            selectedMinions.some(m => m.minionClientCode === minion.minionClientCode)
        );

        if (allSelected) {
            // Unselect all in filtered list
            const updated = selectedMinions.filter(m =>
                !filtered.some(f => f.minionClientCode === m.minionClientCode)
            );
            setSelectedMinions(updated);
        } else {
            // Add only missing ones from filtered
            const updated = [...selectedMinions];
            filtered.forEach(minion => {
                if (!updated.some(m => m.minionClientCode === minion.minionClientCode)) {
                    updated.push(minion);
                }
            });
            setSelectedMinions(updated);
        }
    };

    const handlePlaceOrder = async (m) => {
        const diffQty = m.master_net_quantity - m.total_quantity;
        const orderSide = diffQty > 0 ? 'BUY' : 'SELL';
        const requestBody = {
            symbol: m.symbol + m.strike_price + m.option_type + m.expiry,
            exchangeSegment: m.exchange_segment || 'NSEFO',
            exchangeInstrumentID: m.instrument_token, // replace with actual token from your symbol map
            productType: 'NRML',
            orderType: 'MARKET',
            orderSide,
            timeInForce: 'DAY',
            disclosedQuantity: 0,
            orderQuantity: diffQty,
            limitPrice: m.price || 0,
            stopPrice: m.price || 0,
            orderUniqueIdentifier: `client-${Date.now()}`,
            apiOrderSource: 'TradeReconFrontend'
        };
        try {
            const response = await fetch('http://localhost:8000/api/data/place_order', {
                method: 'POST',
                headers: {
                    // 'Authorization': `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();
            console.log("Order response:", result);
            toast.success(`Order placed: ${result?.orderID || 'Check console'}`);
        } catch (error) {
            console.error("Error placing order", error);
            toast.error("Order failed.");
        }
    };


    return (
        <div className='flex h-full'>
            <Dashboard />
            <div className='w-full max-h-[950px] overflow-y-auto bg-amber50'>
                <h1 className='text-xl mt-3 ml-3 font-bold text-gray-500'>Recon</h1>
                <hr className='h-0.5 bg-gray-300 w-[99%] m-auto' />
                <div className='flex mt-3 w-full p-3'>
                    {/* Masters */}
                    <div className='border-2 w-1/2 rounded-md mr-4'>
                        <div className='flex justify-between items-center p-2'>
                            <h2 className='font-semibold'>Masters</h2>
                            <div className='relative'>
                                <MdSearch className="absolute left-2 top-2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search for a master"
                                    value={searchMasters}
                                    onChange={(e) => setSearchMasters(e.target.value)}
                                    className="border rounded-md pl-8 py-1 text-sm"
                                />
                            </div>
                        </div>
                        <hr />
                        <table className="w-full text-gray-600">
                            <thead className='bg-gray-100'>
                                <tr className='flex p-2 justify-around'>
                                    <th className="w-1/3 text-left ml-2">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAllMasters}
                                            checked={
                                                masters.filter(master =>
                                                    master.masterName.toLowerCase().includes(searchMasters.toLowerCase())
                                                ).every(master =>
                                                    selectedMasters.some(m => m.masterTraderId === master.masterTraderId)
                                                )
                                            }
                                        />
                                    </th>
                                    {/* <th className="w-1/3 text-left">Checkbox</th> */}
                                    <th className="w-1/3 text-left">System ID</th>
                                    <th className="w-1/3 text-left">Name</th>
                                </tr>
                            </thead>
                        </table>
                        <div className="max-h-[200px] overflow-y-auto">
                            <table className="w-full text-gray-600">
                                <tbody>
                                    {masters
                                        .filter(master =>
                                            master.masterName.toLowerCase().includes(searchMasters.toLowerCase()))
                                        .map((master, index) => (
                                            <tr key={index} className='flex justify-around p-2'>
                                                <td className="w-1/3 pl-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMasters.some(m => m.masterTraderId === master.masterTraderId)}
                                                        onChange={() => handleMasterSelect(master)}
                                                    />
                                                </td>
                                                <td className="w-1/3 pl-2">{master.masterTraderId}</td>
                                                <td className="w-1/3 pl-2">{master.masterName}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Minions */}
                    <div className='border-2 w-1/2 rounded-md'>
                        <div className='flex justify-between items-center p-2'>
                            <h2 className='font-semibold'>Minions</h2>
                            <div className='relative'>
                                <MdSearch className="absolute left-2 top-2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search for a minion"
                                    value={searchMinions}
                                    onChange={(e) => setSearchMinions(e.target.value)}
                                    className="border rounded-md pl-8 py-1 text-sm"
                                />
                            </div>
                        </div>
                        <hr />
                        <table className="w-full text-gray-600">
                            <thead className='bg-gray-100'>
                                <tr className='flex p-2 justify-around'>
                                    <th className="w-1/3 text-left ml-2">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAllMinions}
                                            checked={
                                                filteredMinions.filter(minion =>
                                                    (minion.minionName || "").toLowerCase().includes(searchMinions.toLowerCase())
                                                ).every(minion =>
                                                    selectedMinions.some(m => m.minionClientCode === minion.minionClientCode)
                                                )
                                            }
                                        />
                                    </th>
                                    {/* <th className="w-1/3 text-left">Checkbox</th> */}
                                    <th className="w-1/3 text-left">Client ID</th>
                                    <th className="w-1/3 text-left">Name</th>
                                </tr>
                            </thead>
                        </table>
                        <div className="max-h-[200px] overflow-y-auto">
                            <table className="w-full text-gray-600">
                                <tbody>
                                    {filteredMinions
                                        .filter(minion =>
                                            (minion.minionName || "").toLowerCase().includes(searchMinions.toLowerCase()))
                                        .map((minion, index) => (
                                            <tr key={index} className='flex justify-around p-2'>
                                                <td className="w-1/3 pl-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMinions.some(m => m.minionClientCode === minion.minionClientCode)}
                                                        onChange={() => handleMinionSelect(minion)}
                                                    />
                                                </td>
                                                <td className="w-1/3 pl-2">{minion.minionClientCode}</td>
                                                <td className="w-1/3 pl-2">{minion.minionName}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Show Results Button */}
                <div className='text-center mt-2'>
                    <button
                        className='bg-black text-white rounded-lg text-lg w-5/6 p-2'
                        onClick={fetchResults}
                    >
                        Show Results
                    </button>
                </div>

                {/* Results Section */}
                {showResults && masterDetails.length > 0 && minionDetails.length > 0 && (                    // <div className='grid grid-cols-3 gap-4 p-4'>
                    <div className='flex flex-wrap gap-5 p-4'>
                        <div className='border rounded-md w-[49%]'>
                            {/* Only show selected masters as clickable items */}
                            <div className='flex p-3 mb-2 font-bold gap-5 flex-wrap'>
                                {[...new Set(masterDetails.map(m => m.master_id))].map((id) => (
                                    <p
                                        key={id}
                                        className={`cursor-pointer ${selectedMasterCode === id ? 'text-blue-600 underline' : ''}`}
                                        onClick={() => setSelectedMasterCode(id)}
                                    >
                                        {id}
                                    </p>
                                ))}

                                {/* {masterDetails.map(master => (
                                    <p
                                        key={master.master_id}
                                        className={`cursor-pointer ${selectedMasterCode === master.master_id ? 'text-blue-600 underline' : ''}`}
                                        onClick={() => setSelectedMasterCode(master.master_id)}
                                    >
                                        {master.master_id}
                                    </p>
                                ))} */}
                            </div>

                            <div className="ml-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Filter by strike price"
                                    value={strikeFilter}
                                    onChange={(e) => setStrikeFilter(e.target.value)}
                                    className="border rounded-md px-3 py-1 text-sm"
                                />
                            </div>


                            {/* Table Header */}
                            <div className='grid grid-cols-3 bg-gray-100 p-2 text-sm font-semibold'>
                                <p className='ml-4'>Security  Name</p>
                                <p className='ml-4'>Quantity</p>
                                <p className='ml-5'>Type</p>
                            </div>

                            {/* Filtered Data */}
                            <div className="max-h-[185px] overflow-y-auto">
                                {masterDetails
                                    .filter(m => m.master_id === selectedMasterCode && (m.strike_price?.toString() || '').includes(strikeFilter))
                                    .map((m, idx) => (
                                        <div key={idx} className='grid grid-cols-3 gap-12 text-sm text-gray-800 p-2 border-t hover:bg-blue-100'>
                                            <div className='break-words whitespace-normal ml-4'>{m.symbol + " " + m.strike_price + m.option_type + " " + m.expiry}</div>
                                            <div className='break-words whitespace-normal ml-4'>{m.total_quantity}</div>
                                            <div className={`break-words whitespace-normal font-semibold ${m.actionType === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                                                {(m.actionType || '').toUpperCase()}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className='border rounded-md w-[49%]'>
                            <div className='flex flex-wrap p-3 mb-2 font-bold gap-5'>
                                {[...new Set(minionDetails.map(m => m.master_id))].map((id) => (
                                    <p
                                        key={id}
                                        className={`cursor-pointer ${selectedMinionMasterCode === id ? 'text-blue-600 underline' : ''}`}
                                        onClick={() => setSelectedMinionMasterCode(id)}
                                    >
                                        {id}
                                    </p>
                                ))}
                                {/* {minionDetails.map(master => (
                                    <p
                                        key={master.master_id}
                                        className={`cursor-pointer ${selectedMasterCode === master.master_id ? 'text-blue-600 underline' : ''}`}
                                        onClick={() => setSelectedMasterCode(master.master_id)}
                                    >
                                        {master.master_id}
                                    </p>
                                ))} */}
                            </div>
                            <div className='grid grid-cols-3 bg-gray-100 p-2 text-sm font-semibold'>
                                <p className='ml-4'>Security Name</p>
                                <p className='ml-4'>Quantity</p>
                                <p className='ml-6'>Type</p>
                            </div>
                            <div className="max-h-[185px] overflow-y-auto">
                                {minionDetails
                                    .filter(m => m.master_id === selectedMinionMasterCode && (m.strike_price?.toString() || '').includes(strikeFilter)) // 👈 Filter based on selected master
                                    .map((m, idx) => (
                                        <div key={idx} className='grid grid-cols-3 gap-14 text-sm text-gray-800 p-2 border-t hover:bg-blue-100'>
                                            <div className="break-words whitespace-normal">{m.symbol + " " + m.strike_price + m.option_type + " " + m.expiry}</div>
                                            <div className="break-words whitespace-normal ml-2">{m.total_quantity}</div>
                                            <div className={`break-words whitespace-normal font-semibold ${m.actionType === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                                                {(m.actionType || '').toUpperCase()}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <h1 className='text-2xl font-bold text-red-600'>Trade Difference</h1>

                        <div className='border rounded-md w[98%]'>
                            <div className='flex flex-wrap p-3 mb-2 font-bold gap-5'>
                                {[...new Set(minionDetails.map(m => m.master_id))].map((id) => (
                                    <p
                                        key={id}
                                        className={`cursor-pointer ${selectedMinionMasterCodeDifference === id ? 'text-blue-600 underline' : ''}`}
                                        onClick={() => setSelectedMinionMasterCodeDifference(id)}
                                    >
                                        Minion {id}
                                    </p>
                                ))}
                            </div>


                            <div className="ml-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Filter by strike price"
                                    value={strikeFilter}
                                    onChange={(e) => setStrikeFilter(e.target.value)}
                                    className="border rounded-md px-3 py-1 text-sm"
                                />
                            </div>


                            <div className='grid grid-cols-6 gap-5 bg-gray-100 p-2 text-sm font-semibold'>
                                <div className='ml-4'>Security Name</div>
                                <div>Type</div>
                                <div>Total quantity of masters</div>
                                <div>Total quantity of minion</div>
                                <div>Difference in quantities</div>
                                <div>ACTION</div>

                            </div>
                            <div className="max-h-[500px] overflow-y-auto">
                                {minionDetails
                                    // .filter(m => m.master_id === selectedMinionMasterCodeDifference) // 👈 Filter based on selected master
                                    .filter(m => m.master_id === selectedMinionMasterCodeDifference && m.master_net_quantity !== 0 && (m.strike_price?.toString() || '').includes(strikeFilter)) // 🚨 Only show items with non-zero master_net_quantity
                                    .map((m, idx) => (
                                        <div key={idx} className='grid grid-cols-6 text-sm text-gray-800 p-2 border-t hover:bg-blue-100'>
                                            <div className='break-words whitespace-normal ml-1'>{m.symbol + " " + m.strike_price + m.option_type + " " + m.expiry}</div>
                                            <div className={`ml-3 font-semibold ${m.actionType === 'buy' ? 'text-green-600' : 'text-red-600'}`}> {(m.actionType || '').toUpperCase()}</div>
                                            <div className='ml-10'>{m.master_net_quantity}</div>
                                            <div className='ml-10'>{m.total_quantity}</div>
                                            <div className='ml-10'>{m.master_net_quantity - m.total_quantity}</div>
                                            {/* <div><button className='text-white ml-7 bg-green-500 w-12 rounded-md'>Buy</button></div> */}
                                            <button
                                                className='text-white ml-7 bg-green-500 w-12 rounded-md'
                                                onClick={() => handlePlaceOrder(m)}
                                            >
                                                Buy
                                            </button>

                                        </div>
                                    ))}
                            </div>
                        </div>
                        {/* <div className='w-full'>
                            <h1 className='text-xl font-bold mb-2'>Trade Difference</h1>
                            <div className='border rounded-md'>
                                <div className='grid grid-cols-7 gap-8 bg-gray-100 p-2 text-sm font-semibold'>
                                    <div className='ml-10'>Security Name</div>
                                    <div>Type</div>
                                    <div>Total quantity of masters</div>
                                    <div>Total quantity of minion</div>
                                    <div>Quantities in progress</div>
                                    <div>Difference of quantities</div>
                                    <div className='ml-1'>CALL</div>
                                </div>
                                <div className="max-h-[220px] overflow-y-auto">
                                    {masterDetails
                                        // .filter(m => m.total_quantity - m.minion_net_quantity !== 0)
                                        .map((m, idx) => (
                                            <div key={idx} className='grid grid-cols-7 gap-12 text-sm text-gray-800 p-2 border-t'>
                                                <div className='break-words whitespace-normal ml-4'>{m.symbol + " " + m.strike_price + m.option_type + " " + m.expiry}</div>
                                                <div className={`font-semibold ${m.actionType === 'buy' ? 'text-green-600' : 'text-red-600'}`}> {(m.actionType || '').toUpperCase()}</div>
                                                <div className='ml-12'>{m.total_quantity}</div>
                                                <div className='ml-12'>{m.minion_net_quantity}</div>
                                                <div className='ml-12'>0</div>
                                                <div className='ml-12'>{m.total_quantity - m.minion_net_quantity}</div>
                                                <div><button className='text-white bg-green-500 w-12 rounded-md'>Buy</button></div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div> */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recon;










// import { useEffect, useState } from 'react';
// import Dashboard from '../../components/Dashboard/dashboard';
// import { MdSearch } from "react-icons/md";
// import { getMasters } from '../apis/masterApi';
// import { getMinionsByMasterIds } from '../apis/mappingApi';
// import { toast } from 'react-toastify';
// import axios from 'axios';

// // Helper to group trade data by securityName and type
// // const groupData = (data, isMinion = false) => {
// //     const grouped = {};
// //     // console.log(data)
// //     data.forEach(item => {
// //         const key = `${item.contract_Name}-${item.buy_sell}-${item.quantity}-${item.master_id}`;
// //         if (!grouped[key]) {
// //             grouped[key] = {
// //                 contract_Name: item.contract_Name,
// //                 quantity: item.quantity,
// //                 buy_sell: item.buy_sell,
// //                 master_id: item.master_id,
// //                 // quantity: 0,
// //                 // totalQtyMaster: 0,
// //                 // totalQtyMinion: 0,
// //                 inProgress: 0,
// //                 // quantityDiff: 0,
// //                 // call: item.option_type,
// //             };
// //         }

// //         grouped[key].quantity += item.quantity || 0;
// //         // grouped[key].price += item.price || 0;
// //         // grouped[key].totalQtyMaster += item.totalQtyMaster || 0;
// //         // grouped[key].totalQtyMinion += item.totalQtyMinion || 0;
// //         grouped[key].inProgress += item.inProgress || 0;
// //         // grouped[key].quantityDiff += item.quantityDiff || 0;
// //         // if (item.call) grouped[key].call = item.call;
// //     });

// //     return Object.values(grouped);
// // };

// const groupData = (data) => {
//     const grouped = {};

//     data.forEach((item) => {
//         const key = `${item.contract_Name}-${item.expiry}-${item.buy_sell}`;
//         if (!grouped[key]) {
//             grouped[key] = {
//                 contract_Name: item.contract_Name,
//                 expiry: item.expiry,
//                 buy_sell: item.buy_sell,
//                 total_quantity: 0,
//                 entries: [],
//             };
//         }
//         grouped[key].total_quantity += item.quantity;
//         grouped[key].entries.push(item);
//     });

//     return Object.values(grouped);
// };


// const Recon = () => {
//     const [masters, setMasters] = useState([]);
//     const [searchMasters, setSearchMasters] = useState("");
//     const [searchMinions, setSearchMinions] = useState("");
//     const [selectedMasters, setSelectedMasters] = useState([]);
//     const [selectedMinions, setSelectedMinions] = useState([]);

//     const [filteredMinions, setFilteredMinions] = useState([]);
//     const [masterDetails, setMasterDetails] = useState([]);
//     const [minionDetails, setMinionDetails] = useState([]);
//     const [showResults, setShowResults] = useState(false);
//     const [selectedMinionCode, setSelectedMinionCode] = useState(null);

//     useEffect(() => {
//         const fetchMasters = async () => {
//             try {
//                 const res = await getMasters();
//                 setMasters(res.data);
//             } catch (error) {
//                 console.error("Error fetching masters:", error);
//             }
//         };
//         fetchMasters();
//     }, []);

//     useEffect(() => {
//         const fetchMappedMinions = async (masterIds) => {
//             try {
//                 const res = await getMinionsByMasterIds(masterIds);
//                 setFilteredMinions(res.data);
//             } catch (error) {
//                 console.error("Error fetching mapped minions:", error);
//             }
//         };

//         if (selectedMasters.length > 0) {
//             const masterIds = selectedMasters.map(m => m.masterTraderId);
//             fetchMappedMinions(masterIds);
//         } else {
//             setFilteredMinions([]);
//         }
//     }, [selectedMasters]);

//     const handleMasterSelect = (master) => {
//         const exists = selectedMasters.some(m => m.masterTraderId === master.masterTraderId);
//         setSelectedMasters(prev => exists
//             ? prev.filter(m => m.masterTraderId !== master.masterTraderId)
//             : [...prev, master]
//         );
//     };

//     const handleMinionSelect = (minion) => {
//         const exists = selectedMinions.some(m => m.minionClientCode === minion.minionClientCode);
//         setSelectedMinions(prev => exists
//             ? prev.filter(m => m.minionClientCode !== minion.minionClientCode)
//             : [...prev, minion]
//         );
//     };

//     const fetchResults = async () => {
//         if (selectedMasters.length === 0 || selectedMinions.length === 0) {
//             toast.warning("Please select at least one master and one minion.");
//             return;
//         }
//         const masterIds = selectedMasters.map(m => m.masterTraderId);
//         const payload = { masterTraderIds: masterIds };

//         const res = await axios.post("http://localhost:8000/api/data/tradeData", payload);
//         const masterGrouped = groupData(res.data.masterData);
//         const minionGrouped = groupData(res.data.minionData);

//         setMasterDetails(masterGrouped);
//         setMinionDetails(minionGrouped);
//         setShowResults(true);

//         //     const payload = {
//         //         masterIds: selectedMasters.map(m => m.masterTraderId),
//         //         minionIds: selectedMinions.map(m => m.minionClientCode)
//         //     };

//         //     try {
//         //         const res = await axios.post("http://localhost:8000/api/data/tradeData", payload);
//         //         console.log("API Response:", res.data);

//         //         const masterData = await res?.data.insertedData || [];
//         //         const minionData = await res?.data.insertedData || [];

//         //         setMasterDetails(groupData(masterData));
//         //         setMinionDetails(groupData(minionData, true));
//         //         setShowResults(true);
//         //     } catch (error) {
//         //         console.error("Error fetching reconciliation data:", error);
//         //         toast.error("Failed to fetch reconciliation data.");
//         //     }
//     };

//     const getBuySellLabel = (val) => {
//         const label = val === 1 ? "BUY" : val === 2 ? "SELL" : val;
//         const className = val === 1 ? "text-green-600" : val === 2 ? "text-red-600" : "text-black";
//         return <span className={className}>{label}</span>;
//     };


//     return (
//         <div className='flex h-full'>
//             <Dashboard />
//             <div className='w-full max-h-[950px] overflow-y-auto '>
//                 <h1 className='text-xl mt-3 ml-3 font-bold text-gray-500'>Recon</h1>
//                 <hr className='h-0.5 bg-gray-300 w-[99%] m-auto' />

//                 <div className='flex mt-3 w-full p-3'>
//                     {/* Masters */}
//                     <div className='border-2 w-1/2 rounded-md mr-4'>
//                         <div className='flex justify-between items-center p-2'>
//                             <h2 className='font-semibold'>Masters</h2>
//                             <div className='relative'>
//                                 <MdSearch className="absolute left-2 top-2 text-gray-500" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search for a master"
//                                     value={searchMasters}
//                                     onChange={(e) => setSearchMasters(e.target.value)}
//                                     className="border rounded-md pl-8 py-1 text-sm"
//                                 />
//                             </div>
//                         </div>
//                         <hr />
//                         <div className="max-h-[250px] overflow-y-auto">
//                             <table className="w-full text-sm text-gray-600">
//                                 <thead className='bg-gray-100 sticky top-0 z-10'>
//                                     <tr className='flex p-2 justify-around'>
//                                         <th className="w-1/3 text-left">Checkbox</th>
//                                         <th className="w-1/3 text-left">System ID</th>
//                                         <th className="w-1/3 text-left">Name</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {masters
//                                         .filter(master =>
//                                             master.masterName.toLowerCase().includes(searchMasters.toLowerCase()))
//                                         .map((master, index) => (
//                                             <tr key={index} className='flex justify-around p-2'>
//                                                 <td className="w-1/3">
//                                                     <input
//                                                         type="checkbox"
//                                                         checked={selectedMasters.some(m => m.masterTraderId === master.masterTraderId)}
//                                                         onChange={() => handleMasterSelect(master)}
//                                                     />
//                                                 </td>
//                                                 <td className="w-1/3">{master.masterTraderId}</td>
//                                                 <td className="w-1/3">{master.masterName}</td>
//                                             </tr>
//                                         ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>

//                     {/* Minions */}
//                     <div className='border-2 w-1/2 rounded-md'>
//                         <div className='flex justify-between items-center p-2'>
//                             <h2 className='font-semibold'>Minions</h2>
//                             <div className='relative'>
//                                 <MdSearch className="absolute left-2 top-2 text-gray-500" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search for a minion"
//                                     value={searchMinions}
//                                     onChange={(e) => setSearchMinions(e.target.value)}
//                                     className="border rounded-md pl-8 py-1 text-sm"
//                                 />
//                             </div>
//                         </div>
//                         <hr />
//                         <div className="max-h-[250px] overflow-y-auto">
//                             <table className="w-full text-sm text-gray-600">
//                                 <thead className='bg-gray-100 sticky top-0 z-10'>
//                                     <tr className='flex p-2 justify-around'>
//                                         <th className="w-1/3 text-left">Checkbox</th>
//                                         <th className="w-1/3 text-left">Client ID</th>
//                                         <th className="w-1/3 text-left">Name</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filteredMinions
//                                         .filter(minion =>
//                                             (minion.minionName || "").toLowerCase().includes(searchMinions.toLowerCase()))
//                                         .map((minion, index) => (
//                                             <tr key={index} className='flex justify-around p-2'>
//                                                 <td className="w-1/3">
//                                                     <input
//                                                         type="checkbox"
//                                                         checked={selectedMinions.some(m => m.minionClientCode === minion.minionClientCode)}
//                                                         onChange={() => handleMinionSelect(minion)}
//                                                     />
//                                                 </td>
//                                                 <td className="w-1/3">{minion.minionClientCode}</td>
//                                                 <td className="w-1/3">{minion.minionName}</td>
//                                             </tr>
//                                         ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Show Results Button */}
//                 <div className='text-center mt-2'>
//                     <button
//                         className='bg-black text-white rounded-lg text-lg w-5/6 p'
//                         onClick={fetchResults}
//                     >
//                         Show Result
//                     </button>
//                 </div>

//                 {/* Results Section */}
//                 {showResults && (
//                     <div className='flex flex-wrap gap-4 p-4'>
//                         {/* Master Details */}
//                         <div className='border rounded-md w-1/4'>
//                             {/* <h2 className='font-bold text-gray-700 mb-2 p-2'>Selected Master Codes</h2> */}
//                             {/* <div className='flex p-3 mb-2 font-bold gap-5'>
//                                 <p>40596</p>
//                                 <p>41306</p>
//                                 <p>41222</p>
//                             </div> */}
//                             <div className='flex p-3 mb-2 font-bold gap-5'>
//                                 {selectedMasters.map(m => <p key={m.masterTraderId}>{m.masterTraderId}</p>)}
//                             </div>

//                             <div className='grid grid-cols-3 bg-gray-100 p-2 text-sm font-semibold'>
//                                 <p className='ml-4'>Security Name</p>
//                                 <p className='ml-4'>Quantity</p>
//                                 <p className='ml-4'>Type</p>
//                             </div>
//                             <div className="max-h-[185px] overflow-y-auto">
//                                 {masterDetails.map((m, idx) => (
//                                     <div key={idx} className='grid grid-cols-3 gap-12 text-sm text-gray-800 p-2 border-t'>
//                                         <div className='break-words whitespace-normal ml-4' title={m.contract_Name}>{m.contract_Name}</div>
//                                         <div className='break-words whitespace-normal ml-4'>{m.quantity}</div>
//                                         <div className='break-words whitespace-normal'>{getBuySellLabel(m.buy_sell)}</div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Minion Details */}
//                         <div className='border rounded-md w-1/4'>
//                             {/* <h2 className='font-bold text-gray-700 mb-2 p-3'>Mapped Minion Codes</h2> */}
//                             <div className='flex p-3 mb-2 font-bold gap-5'>
//                                 <p>01280</p>
//                                 <p>41191</p>
//                                 <p>4444</p>
//                             </div>
//                             <div className='grid grid-cols-3 bg-gray-100 p-2 text-sm font-semibold'>
//                                 <p className='ml-4'>Security Name</p>
//                                 <p className='ml-4'>Quantity</p>
//                                 <p className='ml-6'>Type</p>
//                             </div>
//                             <div className="max-h-[185px] overflow-y-auto">
//                                 {minionDetails.map((m, idx) => (
//                                     <div key={idx} className='grid grid-cols-3 gap-14 text-sm text-gray-800 p-2 border-t'>
//                                         <div className="break-words whitespace-normal ml-4">{m.contract_Name}</div>
//                                         <div className="break-words whitespace-normal ml-4">{m.quantity}</div>
//                                         <div className="break-words whitespace-normal">{getBuySellLabel(m.buy_sell)}</div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>


//                         {/* Minion Summary */}
//                         <div className='border rounded-md w-[48%]'>
//                             {/* <h2 className='font-bold text-gray-700 mb-2 p-2'>Minion Summary</h2> */}
//                             <div className='flex p-3 mb-2 font-bold gap-5'>
//                                 {selectedMinions.map((m) => (
//                                     <p
//                                         key={m.minionClientCode}
//                                         onClick={() => setSelectedMinionCode(m.minionClientCode)}
//                                         className={`cursor-pointer p-1 rounded ${selectedMinionCode === m.minionClientCode ? 'bg-blue-200' : 'hover:bg-gray-200'
//                                             }`}
//                                     >
//                                         {m.minionClientCode}
//                                     </p>
//                                 ))}
//                             </div>

//                             <div className='grid grid-cols-5 gap-5 bg-gray-100 p-2 text-sm font-semibold'>
//                                 <div className='ml-4'>Security Name</div>
//                                 <div className='ml-4'>Type</div>
//                                 <div>Total quantity of Masters</div>
//                                 <div>Total quantity of Minion</div>
//                                 <div>Difference in quantities</div>
//                             </div>

//                             <div className="max-h-[170px] overflow-y-auto">
//                                 {minionDetails
//                                     .filter((m) => m.minionClientCode === selectedMinionCode) // filter by selected
//                                     .map((m, idx) => (
//                                         <div key={idx} className='grid grid-cols-5 text-sm text-gray-800 p-2 border-t'>
//                                             <div className='break-words whitespace-normal ml-1'>{m.contract_Name}</div>
//                                             <div className='ml-7'>{getBuySellLabel(m.buy_sell)}</div>
//                                             <div className='ml-10'>{m.quantity}</div>
//                                             <div className='ml-10'>{m.quantity * 2}</div>
//                                             <div className='ml-10'>{m.quantity * 2 - m.quantity}</div>
//                                         </div>
//                                     ))}
//                             </div>

//                         </div>

//                         {/* Trade Difference */}
//                         <div className='w-full'>
//                             <h1 className='text-xl font-bold mb-2'>Trade Difference</h1>
//                             <div className='border rounded-md'>
//                                 <div className='grid grid-cols-7 gap-8 bg-gray-100 p-2 text-sm font-semibold'>
//                                     <div className='ml-10'>Security</div>
//                                     <div>Type</div>
//                                     <div>Total quantity of Masters</div>
//                                     <div>Total quantity of Minion</div>
//                                     <div>Quantities In Progress</div>
//                                     <div>Difference in quantities</div>
//                                     <div>Action</div>
//                                 </div>
//                                 <div className="max-h-[220px] overflow-y-auto">
//                                     {minionDetails.map((m, idx) => (
//                                         <div key={idx} className='grid grid-cols-7 gap-12 text-sm text-gray-800 p-2 border-t'>
//                                             <div className='break-words whitespace-normal ml-2'>{m.contract_Name}</div>
//                                             <div>{getBuySellLabel(m.buy_sell)}</div>
//                                             <div className='ml-10'>{m.quantity}</div>
//                                             <div className='ml-10'>{m.quantity * 2}</div>
//                                             <div className='ml-10'>{m.inProgress}</div>
//                                             <div className='ml-10'>{m.quantity * 2 - m.quantity}</div>
//                                             {/* <div>{m.call || "-"}</div> */}
//                                             <div><button className='text-white bg-green-500 w-12 rounded-md'>Buy</button></div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Recon;




// import { useEffect, useState } from 'react';
// import Dashboard from '../../components/Dashboard/dashboard';
// import { MdSearch } from "react-icons/md";
// import { getMasters } from '../apis/masterApi';
// import { getMinionsByMasterIds } from '../apis/mappingApi';
// import { toast } from 'react-toastify';
// import axios from 'axios';

// // Helper to group trade data by securityName and type
// const groupData = (data, isMinion = false) => {
//     const grouped = {};
//     // console.log(data)
//     data.forEach(item => {
//         const key = `${item.contract_Name}-${item.buy_sell}-${item.quantity}-${item.master_id}`;
//         if (!grouped[key]) {
//             grouped[key] = {
//                 contract_Name: item.contract_Name,
//                 quantity: item.quantity,
//                 buy_sell: item.buy_sell,
//                 master_id: item.master_id,
//                 // quantity: 0,
//                 // totalQtyMaster: 0,
//                 // totalQtyMinion: 0,
//                 inProgress: 0,
//                 // quantityDiff: 0,
//                 // call: item.option_type,
//             };
//         }

//         grouped[key].quantity += item.quantity || 0;
//         // grouped[key].price += item.price || 0;
//         // grouped[key].totalQtyMaster += item.totalQtyMaster || 0;
//         // grouped[key].totalQtyMinion += item.totalQtyMinion || 0;
//         grouped[key].inProgress += item.inProgress || 0;
//         // grouped[key].quantityDiff += item.quantityDiff || 0;
//         // if (item.call) grouped[key].call = item.call;
//     });

//     return Object.values(grouped);
// };

// const Recon = () => {
//     const [masters, setMasters] = useState([]);
//     const [searchMasters, setSearchMasters] = useState("");
//     const [searchMinions, setSearchMinions] = useState("");
//     const [selectedMasters, setSelectedMasters] = useState([]);
//     const [selectedMinions, setSelectedMinions] = useState([]);

//     const [filteredMinions, setFilteredMinions] = useState([]);
//     const [masterDetails, setMasterDetails] = useState([]);
//     const [minionDetails, setMinionDetails] = useState([]);
//     const [showResults, setShowResults] = useState(false);

//     useEffect(() => {
//         const fetchMasters = async () => {
//             try {
//                 const res = await getMasters();
//                 setMasters(res.data);
//             } catch (error) {
//                 console.error("Error fetching masters:", error);
//             }
//         };
//         fetchMasters();
//     }, []);

//     useEffect(() => {
//         const fetchMappedMinions = async (masterIds) => {
//             try {
//                 const res = await getMinionsByMasterIds(masterIds);
//                 setFilteredMinions(res.data);
//             } catch (error) {
//                 console.error("Error fetching mapped minions:", error);
//             }
//         };

//         if (selectedMasters.length > 0) {
//             const masterIds = selectedMasters.map(m => m.masterTraderId);
//             fetchMappedMinions(masterIds);
//         } else {
//             setFilteredMinions([]);
//         }
//     }, [selectedMasters]);

//     const handleMasterSelect = (master) => {
//         const exists = selectedMasters.some(m => m.masterTraderId === master.masterTraderId);
//         setSelectedMasters(prev => exists
//             ? prev.filter(m => m.masterTraderId !== master.masterTraderId)
//             : [...prev, master]
//         );
//     };

//     const handleMinionSelect = (minion) => {
//         const exists = selectedMinions.some(m => m.minionClientCode === minion.minionClientCode);
//         setSelectedMinions(prev => exists
//             ? prev.filter(m => m.minionClientCode !== minion.minionClientCode)
//             : [...prev, minion]
//         );
//     };

//     const fetchResults = async () => {
//         if (selectedMasters.length === 0 || selectedMinions.length === 0) {
//             toast.warning("Please select at least one master and one minion.");
//             return;
//         }

//         const payload = {
//             masterIds: selectedMasters.map(m => m.masterTraderId),
//             minionIds: selectedMinions.map(m => m.minionClientCode)
//         };

//         try {
//             const res = await axios.post("http://localhost:8000/api/data/tradeData", payload);
//             console.log("API Response:", res.data);

//             const masterData = await res?.data.insertedData || [];
//             const minionData = await res?.data.insertedData || [];

//             setMasterDetails(groupData(masterData));
//             setMinionDetails(groupData(minionData, true));
//             setShowResults(true);
//         } catch (error) {
//             console.error("Error fetching reconciliation data:", error);
//             toast.error("Failed to fetch reconciliation data.");
//         }
//     };

//     const getBuySellLabel = (val) => {
//         const label = val === 1 ? "BUY" : val === 2 ? "SELL" : val;
//         const className = val === 1 ? "text-green-600" : val === 2 ? "text-red-600" : "text-black";
//         return <span className={className}>{label}</span>;
//     };


//     return (
//         <div className='flex h-full'>
//             <Dashboard />
//             <div className='w-full max-h-[950px] overflow-y-auto '>
//                 <h1 className='text-xl mt-3 ml-3 font-bold text-gray-500'>Recon</h1>
//                 <hr className='h-0.5 bg-gray-300 w-[99%] m-auto' />

//                 <div className='flex mt-3 w-full p-3'>
//                     {/* Masters */}
//                     <div className='border-2 w-1/2 rounded-md mr-4'>
//                         <div className='flex justify-between items-center p-2'>
//                             <h2 className='font-semibold'>Masters</h2>
//                             <div className='relative'>
//                                 <MdSearch className="absolute left-2 top-2 text-gray-500" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search for a master"
//                                     value={searchMasters}
//                                     onChange={(e) => setSearchMasters(e.target.value)}
//                                     className="border rounded-md pl-8 py-1 text-sm"
//                                 />
//                             </div>
//                         </div>
//                         <hr />
//                         <div className="max-h-[250px] overflow-y-auto">
//                             <table className="w-full text-sm text-gray-600">
//                                 <thead className='bg-gray-100 sticky top-0 z-10'>
//                                     <tr className='flex p-2 justify-around'>
//                                         <th className="w-1/3 text-left">Checkbox</th>
//                                         <th className="w-1/3 text-left">System ID</th>
//                                         <th className="w-1/3 text-left">Name</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {masters
//                                         .filter(master =>
//                                             master.masterName.toLowerCase().includes(searchMasters.toLowerCase()))
//                                         .map((master, index) => (
//                                             <tr key={index} className='flex justify-around p-2'>
//                                                 <td className="w-1/3">
//                                                     <input
//                                                         type="checkbox"
//                                                         checked={selectedMasters.some(m => m.masterTraderId === master.masterTraderId)}
//                                                         onChange={() => handleMasterSelect(master)}
//                                                     />
//                                                 </td>
//                                                 <td className="w-1/3">{master.masterTraderId}</td>
//                                                 <td className="w-1/3">{master.masterName}</td>
//                                             </tr>
//                                         ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>

//                     {/* Minions */}
//                     <div className='border-2 w-1/2 rounded-md'>
//                         <div className='flex justify-between items-center p-2'>
//                             <h2 className='font-semibold'>Minions</h2>
//                             <div className='relative'>
//                                 <MdSearch className="absolute left-2 top-2 text-gray-500" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search for a minion"
//                                     value={searchMinions}
//                                     onChange={(e) => setSearchMinions(e.target.value)}
//                                     className="border rounded-md pl-8 py-1 text-sm"
//                                 />
//                             </div>
//                         </div>
//                         <hr />
//                         <div className="max-h-[250px] overflow-y-auto">
//                             <table className="w-full text-sm text-gray-600">
//                                 <thead className='bg-gray-100 sticky top-0 z-10'>
//                                     <tr className='flex p-2 justify-around'>
//                                         <th className="w-1/3 text-left">Checkbox</th>
//                                         <th className="w-1/3 text-left">Client ID</th>
//                                         <th className="w-1/3 text-left">Name</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filteredMinions
//                                         .filter(minion =>
//                                             (minion.minionName || "").toLowerCase().includes(searchMinions.toLowerCase()))
//                                         .map((minion, index) => (
//                                             <tr key={index} className='flex justify-around p-2'>
//                                                 <td className="w-1/3">
//                                                     <input
//                                                         type="checkbox"
//                                                         checked={selectedMinions.some(m => m.minionClientCode === minion.minionClientCode)}
//                                                         onChange={() => handleMinionSelect(minion)}
//                                                     />
//                                                 </td>
//                                                 <td className="w-1/3">{minion.minionClientCode}</td>
//                                                 <td className="w-1/3">{minion.minionName}</td>
//                                             </tr>
//                                         ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Show Results Button */}
//                 <div className='text-center mt-2'>
//                     <button
//                         className='bg-black text-white rounded-lg text-lg w-5/6 p'
//                         onClick={fetchResults}
//                     >
//                         Show Result
//                     </button>
//                 </div>

//                 {/* Results Section */}
//                 {showResults && (
//                     <div className='flex flex-wrap gap-4 p-4'>
//                         {/* Master Details */}
//                         <div className='border rounded-md w-1/4'>
//                             {/* <h2 className='font-bold text-gray-700 mb-2 p-2'>Selected Master Codes</h2> */}
//                             {/* <div className='flex p-3 mb-2 font-bold gap-5'>
//                                 <p>40596</p>
//                                 <p>41306</p>
//                                 <p>41222</p>
//                             </div> */}
//                             <div className='flex p-3 mb-2 font-bold gap-5'>
//                                 {selectedMasters.map(m => <p key={m.masterTraderId}>{m.masterTraderId}</p>)}
//                             </div>

//                             <div className='grid grid-cols-3 bg-gray-100 p-2 text-sm font-semibold'>
//                                 <p className='ml-4'>Security Name</p>
//                                 <p className='ml-4'>Quantity</p>
//                                 <p className='ml-4'>Type</p>
//                             </div>
//                             <div className="max-h-[185px] overflow-y-auto">
//                                 {masterDetails.map((m, idx) => (
//                                     <div key={idx} className='grid grid-cols-3 gap-12 text-sm text-gray-800 p-2 border-t'>
//                                         <div className='break-words whitespace-normal ml-4' title={m.contract_Name}>{m.contract_Name}</div>
//                                         <div className='break-words whitespace-normal ml-4'>{m.quantity}</div>
//                                         <div className='break-words whitespace-normal'>{getBuySellLabel(m.buy_sell)}</div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Minion Details */}
//                         <div className='border rounded-md w-1/4'>
//                             {/* <h2 className='font-bold text-gray-700 mb-2 p-3'>Mapped Minion Codes</h2> */}
//                             <div className='flex p-3 mb-2 font-bold gap-5'>
//                                 <p>01280</p>
//                                 <p>41191</p>
//                                 <p>4444</p>
//                             </div>
//                             <div className='grid grid-cols-3 bg-gray-100 p-2 text-sm font-semibold'>
//                                 <p className='ml-4'>Security Name</p>
//                                 <p className='ml-4'>Quantity</p>
//                                 <p className='ml-6'>Type</p>
//                             </div>
//                             <div className="max-h-[185px] overflow-y-auto">
//                                 {minionDetails.map((m, idx) => (
//                                     <div key={idx} className='grid grid-cols-3 gap-14 text-sm text-gray-800 p-2 border-t'>
//                                         <div className="break-words whitespace-normal ml-4">{m.contract_Name}</div>
//                                         <div className="break-words whitespace-normal ml-4">{m.quantity}</div>
//                                         <div className="break-words whitespace-normal">{getBuySellLabel(m.buy_sell)}</div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>


//                         {/* Minion Summary */}
//                         <div className='border rounded-md w-[48%]'>
//                             {/* <h2 className='font-bold text-gray-700 mb-2 p-2'>Minion Summary</h2> */}
//                             <div className='flex p-3 mb-2 font-bold gap-5'>
//                                 <p>01280</p>
//                                 <p>41191</p>
//                                 <p>4444</p>
//                             </div>
//                             <div className='grid grid-cols-5 gap-5 bg-gray-100 p-2 text-sm font-semibold'>
//                                 <div className='ml-4'>Security Name</div>
//                                 <div className=' ml-4'>Type</div>
//                                 <div className=''>Total quantity of Masters</div>
//                                 <div className=''>Total quantity of Minion</div>
//                                 <div className=''>Difference in quantities</div>
//                             </div>
//                             <div className="max-h-[170px] overflow-y-auto">
//                                 {minionDetails.map((m, idx) => (
//                                     <div key={idx} className='grid grid-cols-5 text-sm text-gray-800 p-2 border-t'>
//                                         <div className='break-words whitespace-normal ml-1'>{m.contract_Name}</div>
//                                         <div className='ml-7'>{getBuySellLabel(m.buy_sell)}</div>
//                                         <div className='ml-10'>{m.quantity}</div>
//                                         <div className='ml-10'>{m.quantity * 2}</div>
//                                         <div className='ml-10'>{m.quantity * 2 - m.quantity}</div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Trade Difference */}
//                         <div className='w-full'>
//                             <h1 className='text-xl font-bold mb-2'>Trade Difference</h1>
//                             <div className='border rounded-md'>
//                                 <div className='grid grid-cols-7 gap-8 bg-gray-100 p-2 text-sm font-semibold'>
//                                     <div className='ml-10'>Security</div>
//                                     <div>Type</div>
//                                     <div>Total quantity of Masters</div>
//                                     <div>Total quantity of Minion</div>
//                                     <div>Quantities In Progress</div>
//                                     <div>Difference in quantities</div>
//                                     <div>Action</div>
//                                 </div>
//                                 <div className="max-h-[220px] overflow-y-auto">
//                                     {minionDetails.map((m, idx) => (
//                                         <div key={idx} className='grid grid-cols-7 gap-12 text-sm text-gray-800 p-2 border-t'>
//                                             <div className='break-words whitespace-normal ml-2'>{m.contract_Name}</div>
//                                             <div>{getBuySellLabel(m.buy_sell)}</div>
//                                             <div className='ml-10'>{m.quantity}</div>
//                                             <div className='ml-10'>{m.quantity * 2}</div>
//                                             <div className='ml-10'>{m.inProgress}</div>
//                                             <div className='ml-10'>{m.quantity * 2 - m.quantity}</div>
//                                             {/* <div>{m.call || "-"}</div> */}
//                                             <div><button className='text-white bg-green-500 w-12 rounded-md'>Buy</button></div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Recon;


// import { useEffect, useState } from 'react';
// import Dashboard from '../../components/Dashboard/dashboard';
// import { MdSearch } from "react-icons/md";
// import { getMasters } from '../apis/masterApi';
// import { getMinionsByMasterIds } from '../apis/mappingApi';
// import { toast } from 'react-toastify';
// import axios from 'axios';

// // Helper to group trade data by securityName and type
// const groupData = (data, isMinion = false) => {
//     const grouped = {};
//     // console.log(data)
//     data.forEach(item => {
//         const key = `${item.contract_Name}-${item.type}-${item.price}-${item.option_type}`;
//         if (!grouped[key]) {
//             grouped[key] = {
//                 contract_Name: item.contract_Name,
//                 price: item.price,
//                 // type: item.type,
//                 // quantity: 0,
//                 // totalQtyMaster: 0,
//                 // totalQtyMinion: 0,
//                 inProgress: 0,
//                 // quantityDiff: 0,
//                 call: item.option_type,
//             };
//         }

//         grouped[key].quantity += item.quantity || 0;
//         // grouped[key].price += item.price || 0;
//         grouped[key].totalQtyMaster += item.totalQtyMaster || 0;
//         grouped[key].totalQtyMinion += item.totalQtyMinion || 0;
//         grouped[key].inProgress += item.inProgress || 0;
//         grouped[key].quantityDiff += item.quantityDiff || 0;
//         if (item.call) grouped[key].call = item.call;
//     });

//     return Object.values(grouped);
// };

// const Recon = () => {
//     const [masters, setMasters] = useState([]);
//     const [searchMasters, setSearchMasters] = useState("");
//     const [searchMinions, setSearchMinions] = useState("");
//     const [selectedMasters, setSelectedMasters] = useState([]);
//     const [selectedMinions, setSelectedMinions] = useState([]);

//     const [filteredMinions, setFilteredMinions] = useState([]);
//     const [masterDetails, setMasterDetails] = useState([]);
//     const [minionDetails, setMinionDetails] = useState([]);
//     const [showResults, setShowResults] = useState(false);

//     useEffect(() => {
//         const fetchMasters = async () => {
//             try {
//                 const res = await getMasters();
//                 setMasters(res.data);
//             } catch (error) {
//                 console.error("Error fetching masters:", error);
//             }
//         };
//         fetchMasters();
//     }, []);

//     useEffect(() => {
//         const fetchMappedMinions = async (masterIds) => {
//             try {
//                 const res = await getMinionsByMasterIds(masterIds);
//                 setFilteredMinions(res.data);
//             } catch (error) {
//                 console.error("Error fetching mapped minions:", error);
//             }
//         };

//         if (selectedMasters.length > 0) {
//             const masterIds = selectedMasters.map(m => m.masterTraderId);
//             fetchMappedMinions(masterIds);
//         } else {
//             setFilteredMinions([]);
//         }
//     }, [selectedMasters]);

//     const handleMasterSelect = (master) => {
//         const exists = selectedMasters.some(m => m.masterTraderId === master.masterTraderId);
//         setSelectedMasters(prev => exists
//             ? prev.filter(m => m.masterTraderId !== master.masterTraderId)
//             : [...prev, master]
//         );
//     };

//     const handleMinionSelect = (minion) => {
//         const exists = selectedMinions.some(m => m.minionClientCode === minion.minionClientCode);
//         setSelectedMinions(prev => exists
//             ? prev.filter(m => m.minionClientCode !== minion.minionClientCode)
//             : [...prev, minion]
//         );
//     };

//     const fetchResults = async () => {
//         if (selectedMasters.length === 0 || selectedMinions.length === 0) {
//             toast.warning("Please select at least one master and one minion.");
//             return;
//         }

//         const payload = {
//             masterIds: selectedMasters.map(m => m.masterTraderId),
//             minionIds: selectedMinions.map(m => m.minionClientCode)
//         };

//         try {
//             const res = await axios.post("http://localhost:8000/api/auth/master", payload);
//             console.log("API Response:", res.data);

//             const masterData = await res?.data || [];
//             const minionData = await res?.data || [];

//             setMasterDetails(groupData(masterData));
//             setMinionDetails(groupData(minionData, true));
//             setShowResults(true);
//         } catch (error) {
//             console.error("Error fetching reconciliation data:", error);
//             toast.error("Failed to fetch reconciliation data.");
//         }
//     };

//     return (
//         <div className='flex h-full'>
//             <Dashboard />
//             <div className='w-full max-h-[950px] overflow-y-auto '>
//                 <h1 className='text-xl mt-3 ml-3 font-bold text-gray-500'>Recon</h1>
//                 <hr className='h-0.5 bg-gray-300 w-[99%] m-auto' />

//                 <div className='flex mt-3 w-full p-3'>
//                     {/* Masters */}
//                     <div className='border-2 w-1/2 rounded-md mr-4'>
//                         <div className='flex justify-between items-center p-2'>
//                             <h2 className='font-semibold'>Masters</h2>
//                             <div className='relative'>
//                                 <MdSearch className="absolute left-2 top-2 text-gray-500" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search for a master"
//                                     value={searchMasters}
//                                     onChange={(e) => setSearchMasters(e.target.value)}
//                                     className="border rounded-md pl-8 py-1 text-sm"
//                                 />
//                             </div>
//                         </div>
//                         <hr />
//                         <div className="max-h-[250px] overflow-y-auto">
//                             <table className="w-full text-sm text-gray-600">
//                                 <thead className='bg-gray-100 sticky top-0 z-10'>
//                                     <tr className='flex p-2 justify-around'>
//                                         <th className="w-1/3 text-left">Checkbox</th>
//                                         <th className="w-1/3 text-left">System ID</th>
//                                         <th className="w-1/3 text-left">Name</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {masters
//                                         .filter(master =>
//                                             master.masterName.toLowerCase().includes(searchMasters.toLowerCase()))
//                                         .map((master, index) => (
//                                             <tr key={index} className='flex justify-around p-2'>
//                                                 <td className="w-1/3">
//                                                     <input
//                                                         type="checkbox"
//                                                         checked={selectedMasters.some(m => m.masterTraderId === master.masterTraderId)}
//                                                         onChange={() => handleMasterSelect(master)}
//                                                     />
//                                                 </td>
//                                                 <td className="w-1/3">{master.masterTraderId}</td>
//                                                 <td className="w-1/3">{master.masterName}</td>
//                                             </tr>
//                                         ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>

//                     {/* Minions */}
//                     <div className='border-2 w-1/2 rounded-md'>
//                         <div className='flex justify-between items-center p-2'>
//                             <h2 className='font-semibold'>Minions</h2>
//                             <div className='relative'>
//                                 <MdSearch className="absolute left-2 top-2 text-gray-500" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search for a minion"
//                                     value={searchMinions}
//                                     onChange={(e) => setSearchMinions(e.target.value)}
//                                     className="border rounded-md pl-8 py-1 text-sm"
//                                 />
//                             </div>
//                         </div>
//                         <hr />
//                         <div className="max-h-[250px] overflow-y-auto">
//                             <table className="w-full text-sm text-gray-600">
//                                 <thead className='bg-gray-100 sticky top-0 z-10'>
//                                     <tr className='flex p-2 justify-around'>
//                                         <th className="w-1/3 text-left">Checkbox</th>
//                                         <th className="w-1/3 text-left">Client ID</th>
//                                         <th className="w-1/3 text-left">Name</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filteredMinions
//                                         .filter(minion =>
//                                             (minion.minionName || "").toLowerCase().includes(searchMinions.toLowerCase()))
//                                         .map((minion, index) => (
//                                             <tr key={index} className='flex justify-around p-2'>
//                                                 <td className="w-1/3">
//                                                     <input
//                                                         type="checkbox"
//                                                         checked={selectedMinions.some(m => m.minionClientCode === minion.minionClientCode)}
//                                                         onChange={() => handleMinionSelect(minion)}
//                                                     />
//                                                 </td>
//                                                 <td className="w-1/3">{minion.minionClientCode}</td>
//                                                 <td className="w-1/3">{minion.minionName}</td>
//                                             </tr>
//                                         ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Show Results Button */}
//                 <div className='text-center mt-2'>
//                     <button
//                         className='bg-black text-white rounded-lg text-lg w-5/6 p'
//                         onClick={fetchResults}
//                     >
//                         Show Result
//                     </button>
//                 </div>

//                 {/* Results Section */}
//                 {showResults && (
//                     <div className='flex flex-wrap gap-4 p-4'>
//                         {/* Master Details */}
//                         <div className='border rounded-md w-1/4'>
//                             {/* <h2 className='font-bold text-gray-700 mb-2 p-2'>Selected Master Codes</h2> */}
//                             <div className='flex p-3 mb-2 font-bold gap-5'>
//                                 <p>40596</p>
//                                 <p>41306</p>
//                                 <p>41222</p>
//                             </div>
//                             <div className='grid grid-cols-3 bg-gray-100 p-2 text-sm font-semibold'>
//                                 <p className='ml-4'>Security Name</p>
//                                 <p className='ml-4'>Quantity</p>
//                                 <p className='ml-4'>Type</p>
//                             </div>
//                             <div className="max-h-[185px] overflow-y-auto">
//                                 {masterDetails.map((m, idx) => (
//                                     <div key={idx} className='grid grid-cols-3 gap-12 text-sm text-gray-800 p-2 border-t'>
//                                         <div className='break-words whitespace-normal ml-4' title={m.contract}>{m.contract_Name}</div>
//                                         <div className='break-words whitespace-normal ml-4'>{m.price}</div>
//                                         <div className='break-words whitespace-normal'>{m.call}</div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Minion Details */}
//                         <div className='border rounded-md w-1/4'>
//                             {/* <h2 className='font-bold text-gray-700 mb-2 p-3'>Mapped Minion Codes</h2> */}
//                             <div className='flex p-3 mb-2 font-bold gap-5'>
//                                 <p>01280</p>
//                                 <p>41191</p>
//                                 <p>4444</p>
//                             </div>
//                             <div className='grid grid-cols-3 bg-gray-100 p-2 text-sm font-semibold'>
//                                 <p className='ml-4'>Security Name</p>
//                                 <p className='ml-4'>Quantity</p>
//                                 <p className='ml-6'>Type</p>
//                             </div>
//                             <div className="max-h-[185px] overflow-y-auto">
//                                 {minionDetails.map((m, idx) => (
//                                     <div key={idx} className='grid grid-cols-3 gap-14 text-sm text-gray-800 p-2 border-t'>
//                                         <div className="break-words whitespace-normal ml-4">{m.contract_Name}</div>
//                                         <div className="break-words whitespace-normal ml-4">{m.price}</div>
//                                         <div className="break-words whitespace-normal">{m.call}</div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>


//                         {/* Minion Summary */}
//                         <div className='border rounded-md w-[48%]'>
//                             {/* <h2 className='font-bold text-gray-700 mb-2 p-2'>Minion Summary</h2> */}
//                             <div className='flex p-3 mb-2 font-bold gap-5'>
//                                 <p>01280</p>
//                                 <p>41191</p>
//                                 <p>4444</p>
//                             </div>
//                             <div className='grid grid-cols-5 gap-5 bg-gray-100 p-2 text-sm font-semibold'>
//                                 <div className='ml-4'>Security Name</div>
//                                 <div className=' ml-4'>Type</div>
//                                 <div className=''>Total quantity of Masters</div>
//                                 <div className=''>Total quantity of Minion</div>
//                                 <div className=''>Difference in quantities</div>
//                             </div>
//                             <div className="max-h-[170px] overflow-y-auto">
//                                 {minionDetails.map((m, idx) => (
//                                     <div key={idx} className='grid grid-cols-5 text-sm text-gray-800 p-2 border-t'>
//                                         <div className='break-words whitespace-normal ml-1'>{m.contract_Name}</div>
//                                         <div className='ml-7'>{m.call}</div>
//                                         <div className='ml-10'>{m.price}</div>
//                                         <div className='ml-10'>{m.price * 2}</div>
//                                         <div className='ml-10'>{m.price * 2 - m.price}</div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Trade Difference */}
//                         <div className='w-full'>
//                             <h1 className='text-xl font-bold mb-2'>Trade Difference</h1>
//                             <div className='border rounded-md'>
//                                 <div className='grid grid-cols-7 gap-8 bg-gray-100 p-2 text-sm font-semibold'>
//                                     <div className='ml-10'>Security</div>
//                                     <div>Type</div>
//                                     <div>Total quantity of Masters</div>
//                                     <div>Total quantity of Minion</div>
//                                     <div>Quantities In Progress</div>
//                                     <div>Difference in quantities</div>
//                                     <div>Action</div>
//                                 </div>
//                                 <div className="max-h-[220px] overflow-y-auto">
//                                     {minionDetails.map((m, idx) => (
//                                         <div key={idx} className='grid grid-cols-7 gap-12 text-sm text-gray-800 p-2 border-t'>
//                                             <div className='break-words whitespace-normal ml-2'>{m.contract_Name}</div>
//                                             <div>{m.call}</div>
//                                             <div className='ml-10'>{m.price}</div>
//                                             <div className='ml-10'>{m.price * 2}</div>
//                                             <div className='ml-10'>{m.inProgress}</div>
//                                             <div className='ml-10'>{m.price * 2 - m.price}</div>
//                                             {/* <div>{m.call || "-"}</div> */}
//                                             <div><button className='text-white bg-green-500 w-12 rounded-md'>Buy</button></div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Recon;





