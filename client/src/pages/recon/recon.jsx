import { useEffect, useState } from 'react';
import Dashboard from '../../components/Dashboard/dashboard';
import { MdSearch } from "react-icons/md";
import { getMasters } from '../apis/masterApi';
import { getMinionsByMasterIds } from '../apis/mappingApi';
import { toast } from 'react-toastify';

const Recon = () => {
    const [masters, setMasters] = useState([]);
    const [searchMasters, setSearchMasters] = useState("");
    const [searchMinions, setSearchMinions] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [selectedMasters, setSelectedMasters] = useState([]);
    const [selectedMinions, setSelectedMinions] = useState([]);

    const [filteredMinions, setFilteredMinions] = useState([]);
    const [masterDetails, setMasterDetails] = useState([]);
    const [minionDetails, setMinionDetails] = useState([]);

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

    const fetchResults = () => {
        if (selectedMasters.length > 0 && selectedMinions.length > 0) {
            setShowResults(true);
        } else {
            toast.warning("Please select at least one master and one minion.");
        }
    };

    useEffect(() => {
        if (showResults) {
            setMasterDetails(selectedMasters);
            setMinionDetails(selectedMinions);
        }
    }, [selectedMasters, selectedMinions, showResults]);

    const handleMinionSelect = (minion) => {
        const exists = selectedMinions.some(m => m.minionClientCode === minion.minionClientCode);
        if (exists) {
            setSelectedMinions(selectedMinions.filter(m => m.minionClientCode !== minion.minionClientCode));
        } else {
            setSelectedMinions([...selectedMinions, minion]);
        }
    };

    return (
        <div className='flex h-full'>
            <Dashboard />
            <div className='w-full'>
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
                                    <th className="w-1/3 text-left">Checkbox</th>
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
                                    <th className="w-1/3 text-left">Checkbox</th>
                                    <th className="w-1/2 text-left">Client ID</th>
                                    <th className="w-1/2 text-left">Name</th>
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
                {masterDetails.length > 0 && minionDetails.length > 0 && (
                    <div className='grid grid-cols-3 gap-4 p-4'>
                        <div className='border rounded-md'>
                            <h2 className='font-bold text-gray-700 mb-2'>Selected Master Codes</h2>
                            <div className='flex justify-around bg-gray-100 p-3'>
                                <p>Security Name</p>
                                <p>Quantity</p>
                                <p>Type</p>
                            </div>
                            {masterDetails.map((m, idx) => (
                                <div key={idx} className='text-sm text-gray-800 p-2'>
                                    {m.masterTraderId}
                                </div>
                            ))}
                        </div>
                        <div className='border rounded-md'>
                            <h2 className='font-bold text-gray-700 mb-2'>Mapped Minion Codes</h2>
                            <div className='flex justify-around bg-gray-100 p-3'>
                                <p>Security Name</p>
                                <p>Quantity</p>
                                <p>Type</p>
                            </div>
                            {minionDetails.map((m, idx) => (
                                <div key={idx} className='text-sm text-gray-800 p-2'>
                                    {m.minionClientCode}
                                </div>
                            ))}
                        </div>
                        <div className='border rounded-md'>
                            <h2 className='font-bold text-gray-700 mb-2'>Selected Minion Codes</h2>
                            <div className='flex justify-around bg-gray-100 p-3'>
                                <p>Security Name</p>
                                <p>Type</p>
                                <p>Total quantity of masters</p>
                                <p>Total quantity of minion</p>
                                <p>Quantities in progress</p>
                            </div>
                            {minionDetails.map((m, idx) => (
                                <div key={idx} className='text-sm text-gray-800 p-2'>
                                    {m.minionClientCode}
                                </div>
                            ))}
                        </div>
                        <h1>Trade Difference</h1>
                        <div className='border rounded-md'>
                            <h2 className='font-bold text-gray-700 mb-2'>Selected Minion Codes</h2>
                            <div className='flex justify-around bg-gray-100  p-3'>
                                <p>Security Name</p>
                                <p>Type</p>
                                <p>Total quantity of masters</p>
                                <p>Total quantity of minion</p>
                                <p>Quantities in progress</p>
                                <p>Difference of quantities</p>
                                <p></p>
                            </div>
                            {minionDetails.map((m, idx) => (
                                <div key={idx} className='text-sm text-gray-800 p-2'>
                                    {m.minionClientCode}
                                </div>
                            ))}
                        </div>
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
// import { getMinions } from '../apis/minionApi';
// import { toast } from 'react-toastify';

// const Recon = () => {
//     const [masters, setMasters] = useState([]);
//     const [minions, setMinions] = useState([]);
//     const [searchMasters, setSearchMasters] = useState("");
//     const [searchMinions, setSearchMinions] = useState("");

//     const [selectedMasters, setSelectedMasters] = useState([]);
//     const [selectedMinions, setSelectedMinions] = useState([]);
//     const [masterDetails, setMasterDetails] = useState([]);
//     const [minionDetails, setMinionDetails] = useState([]);

//     const fetchMasters = async () => {
//         try {
//             const res = await getMasters();
//             setMasters(res.data);
//         } catch (error) {
//             console.error("Error fetching masters:", error);
//         }
//     };

//     const fetchMinions = async () => {
//         try {
//             const res = await getMinions();
//             setMinions(res.data);
//         } catch (error) {
//             console.error("Error fetching minions:", error);
//         }
//     };

//     useEffect(() => {
//         fetchMasters();
//         fetchMinions();
//     }, []);

//     useEffect(() => {
//         if (selectedMasters.length === 0 || selectedMinions.length === 0) {
//             setMasterDetails([]);
//             setMinionDetails([]);
//         }
//     }, [selectedMasters, selectedMinions]);

//     const handleMasterSelect = (master) => {
//         const exists = selectedMasters.some(m => m.masterTraderId === master.masterTraderId);
//         if (exists) {
//             setSelectedMasters(selectedMasters.filter(m => m.masterTraderId !== master.masterTraderId));
//         } else {
//             setSelectedMasters([...selectedMasters, master]);
//         }
//     };

//     const handleMinionSelect = (minion) => {
//         const exists = selectedMinions.some(m => m.minionClientCode === minion.minionClientCode);
//         if (exists) {
//             setSelectedMinions(selectedMinions.filter(m => m.minionClientCode !== minion.minionClientCode));
//         } else {
//             setSelectedMinions([...selectedMinions, minion]);
//         }
//     };

//     const fetchMasterDetails = async () => {
//         // Replace with actual API if needed
//         setMasterDetails(selectedMasters);
//     };

//     const fetchMinionDetails = async () => {
//         // Replace with actual API if needed
//         setMinionDetails(selectedMinions);
//     };

//     return (
//         <div className='flex h-full '>
//             <Dashboard />
//             <div className='w-full'>
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
//                         <table className="w-full text-gray-600">
//                             <thead className='bg-gray-100'>
//                                 <tr className='flex p-2 justify-around'>
//                                     <th className="w-1/3 text-left">Checkbox</th>
//                                     <th className="w-1/3 text-left">System ID</th>
//                                     <th className="w-1/3 text-left">Name</th>
//                                 </tr>
//                             </thead>
//                         </table>
//                         <div className="max-h-[200px] overflow-y-auto">
//                             <table className="w-full text-gray-600">
//                                 <tbody>
//                                     {masters.map((master, index) => (
//                                         <tr key={index} className='flex justify-around p-2'>
//                                             <td className="w-1/3 pl-2">
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={selectedMasters.some(m => m.masterTraderId === master.masterTraderId)}
//                                                     onChange={() => handleMasterSelect(master)}
//                                                 />
//                                             </td>
//                                             <td className="w-1/3 pl-2">{master.masterTraderId}</td>
//                                             <td className="w-1/3 pl-2">{master.masterName}</td>
//                                         </tr>
//                                     ))}
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
//                         <table className="w-full text-gray-600">
//                             <thead className='bg-gray-100'>
//                                 <tr className='flex p-2 justify-around'>
//                                     <th className="w-1/3 text-left">Checkbox</th>
//                                     <th className="w-1/3 text-left">System ID</th>
//                                     <th className="w-1/3 text-left">Name</th>
//                                 </tr>
//                             </thead>
//                         </table>
//                         <div className="max-h-[200px] overflow-y-auto">
//                             <table className="w-full text-gray-600">
//                                 <tbody>
//                                     {minions.map((minion, index) => (
//                                         <tr key={index} className='flex justify-around p-2'>
//                                             <td className="w-1/3 pl-2">
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={selectedMinions.some(m => m.minionClientCode === minion.minionClientCode)}
//                                                     onChange={() => handleMinionSelect(minion)}
//                                                 />
//                                             </td>
//                                             <td className="w-1/3 pl-2">{minion.minionClientCode}</td>
//                                             <td className="w-1/3 pl-2">{minion.minionName}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Show Results */}
//                 <div className='text-center mt-2'>
//                     <button
//                         className='bg-black text-white rounded-lg text-lg w-5/6 p-2'
//                         onClick={() => {
//                             if (selectedMasters.length > 0 && selectedMinions.length > 0) {
//                                 fetchMasterDetails();
//                                 fetchMinionDetails();
//                             } else {
//                                 toast.warning("Please select at least one master and one minion.");
//                             }
//                         }}
//                     >
//                         Show Results
//                     </button>
//                 </div>

//                 {/* Display Results */}
//                 {masterDetails.length > 0 && minionDetails.length > 0 && (
//                     <div className='grid grid-cols-3 gap-4 p-4'>
//                         <div className='border rounded-md'>
//                             <h2 className='font-bold text-gray-700 mb-2'>Selected Master Codes</h2>
//                             <div className='flex justify-around bg-gray-100 p-3'>
//                                 <p>Security Name</p>
//                                 <p>Quantity</p>
//                                 <p>Type</p>
//                             </div>
//                             {masterDetails.map((m, idx) => (
//                                 <div key={idx} className='text-sm text-gray-800 p-2'>
//                                     {m.masterTraderId}
//                                 </div>
//                             ))}
//                         </div>
//                         <div className='border rounded-md'>
//                             <h2 className='font-bold text-gray-700 mb-2'>Selected Minion Codes</h2>
//                             <div className='flex justify-around bg-gray-100 p-3'>
//                                 <p>Security Name</p>
//                                 <p>Quantity</p>
//                                 <p>Type</p>
//                             </div>
//                             {minionDetails.map((m, idx) => (
//                                 <div key={idx} className='text-sm text-gray-800 p-2'>
//                                     {m.minionClientCode}
//                                 </div>
//                             ))}
//                         </div>
//                         <div className='border rounded-md'>
//                             <h2 className='font-bold text-gray-700 mb-2'>Selected Minion Codes</h2>
//                             <div className='flex justify-around bg-gray-100  p-3'>
//                                 <p>Security Name</p>
//                                 <p>Type</p>
//                                 <p>Total quantity of masters</p>
//                                 <p>Total quantity of minion</p>
//                                 <p>Quantities in progress</p>
//                             </div>
//                             {minionDetails.map((m, idx) => (
//                                 <div key={idx} className='text-sm text-gray-800 p-2'>
//                                     {m.minionClientCode}
//                                 </div>
//                             ))}
//                         </div>
//                         <h1>Trade Difference</h1>
//                         <div className='border rounded-md'>
//                             <h2 className='font-bold text-gray-700 mb-2'>Selected Minion Codes</h2>
//                             <div className='flex justify-around bg-gray-100  p-3'>
//                                 <p>Security Name</p>
//                                 <p>Type</p>
//                                 <p>Total quantity of masters</p>
//                                 <p>Total quantity of minion</p>
//                                 <p>Quantities in progress</p>
//                                 <p>Difference of quantities</p>
//                                 <p></p>
//                             </div>
//                             {minionDetails.map((m, idx) => (
//                                 <div key={idx} className='text-sm text-gray-800 p-2'>
//                                     {m.minionClientCode}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 )}

//             </div>
//         </div>
//     );
// };

// export default Recon;






// import React, { useEffect, useState } from 'react';
// import Dashboard from '../../components/Dashboard/dashboard';
// import { MdSearch } from "react-icons/md";
// import { getMasters } from '../apis/masterApi';
// import { getMinions } from '../apis/minionApi';

// const Recon = () => {
//     const [masters, setMasters] = useState([]);
//     const [minions, setMinions] = useState([]);
//     const [searchMasters, setSearchMasters] = useState("");
//     const [searchMinions, setSearchMinions] = useState("");

//     const fetchMasters = async () => {
//         try {
//             const res = await getMasters();
//             setMasters(res.data);
//         } catch (error) {
//             console.error("Error fetching masters:", error);
//         }
//     };

//     const fetchMinions = async () => {
//         try {
//             const res = await getMinions();
//             setMinions(res.data);
//         } catch (error) {
//             console.error("Error fetching minions:", error);
//         }
//     };

//     useEffect(() => {
//         fetchMasters();
//         fetchMinions();
//     }, []);

//     return (
//         <div className='flex h-full'>
//             <Dashboard />
//             <div className='w-full'>
//                 <h1 className='text-xl mt-3 ml-3 font-bold text-gray-500'>Recon</h1>
//                 <hr className='h-0.5 bg-gray-300 w-[99%] m-auto' />

//                 <div className='flex mt-3 w-full p-3'>
//                     {/* Masters Section */}
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

//                         <table className="w-full text-gray-600">
//                             <thead className='bg-gray-100'>
//                                 <tr className='flex p-2 justify-around'>
//                                     <th className="w-1/3 text-left">Checkbox</th>
//                                     <th className="w-1/3 text-left">System ID</th>
//                                     <th className="w-1/3 text-left">Name</th>
//                                 </tr>
//                             </thead>
//                         </table>
//                         <div className="max-h-[200px] overflow-y-auto">
//                             <table className="w-full text-gray-600">
//                                 <tbody>
//                                     {masters.map((master, index) => (
//                                         <tr key={master.id || index} className='flex justify-around p-2'>
//                                             <td className="w-1/3 pl-2">
//                                                 <input type="checkbox" />
//                                             </td>
//                                             <td className="w-1/3 pl-2">{master.masterTraderId}</td>
//                                             <td className="w-1/3 pl-2">{master.masterName}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>

//                     {/* Minions Section */}
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

//                         <table className="w-full text-gray-600">
//                             <thead className='bg-gray-100'>
//                                 <tr className='flex p-2 justify-around'>
//                                     <th className="w-1/3 text-left">Checkbox</th>
//                                     <th className="w-1/3 text-left">System ID</th>
//                                     <th className="w-1/3 text-left">Name</th>
//                                 </tr>
//                             </thead>
//                         </table>
//                         <div className="max-h-[200px] overflow-y-auto">
//                             <table className="w-full text-gray-600">
//                                 <tbody>
//                                     {minions.map((minion, index) => (
//                                         <tr key={minion.id || index} className='flex justify-around p-2'>
//                                             <td className="w-1/3 pl-2">
//                                                 <input type="checkbox" />
//                                             </td>
//                                             <td className="w-1/3 pl-2">{minion.minionClientCode}</td>
//                                             <td className="w-1/3 pl-2">{minion.minionName}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>

//                 <div className='text-center mt-2'>
//                     <button className='bg-black text-white rounded-lg text-lg w-5/6 p-1'>Show Results</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Recon;






