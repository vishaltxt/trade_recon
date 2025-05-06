import React, { useEffect, useState } from 'react'
import Dashboard from '../../components/Dashboard/dashboard'
import { MdSearch } from "react-icons/md";
import { getMasters } from '../apis/masterApi';
import { getMinions } from '../apis/minionApi';

const Recon = () => {
    const [masters, setMasters] = useState([]);
    const fetchMasters = async () => {
        try {
            const res = await getMasters();
            setMasters(res.data);
        } catch (error) {
            console.error("Error fetching masters:", error);
        }
    };

    const [minions, setMinions] = useState([]);
    const fetchMinions = async () => {
        try {
            const res = await getMinions();
            setMinions(res.data);
        } catch (error) {
            console.error("Error fetching minions:", error);
        }
    };

    useEffect(() => {
        fetchMasters();
        fetchMinions();
    }, []);
    const [searchMasters, setSearchMasters] = useState("");
    const [searchMinions, setSearchMinions] = useState("");

    return (
        <div className='flex h-full'>
            <Dashboard />
            <div className='w-full'>
                <h1 className='text-xl mt-3 ml-3 font-bold text-gray-500'>Recon</h1>
                <hr className='h-0.5 bg-gray-300 w-[99%] m-auto' />
                {/* <div className='h-1 border border-cyan-500'></div> */}
                <div className='flex mt-3 w-full p-3'>
                    <div className='border-2 w-1/2 rounded-md mr-4'>
                        <div className='flex justify-between p-2'>
                            <div >
                                <h2 className=''>Masters</h2>
                            </div>
                            <div>
                                <MdSearch className="absolute top-[8.6%] left-[44.3%] " />
                                <input
                                    type="text"
                                    placeholder="Search for a master"
                                    value={searchMasters}
                                    onChange={(e) => setSearchMasters(e.target.value)}
                                    className="border rounded-md p- text-center"
                                />
                            </div>
                        </div>
                        <hr />
                        <table className="p-3 w-full text-gray-600">
                            <thead className='bg-gray-100'>
                                <tr >
                                    <th className="text-left pl-12">Checkbox</th>
                                    <th className="text-center pl-32">System ID</th>
                                    <th className="text-right pl-48">Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {masters.map((master, index) => (
                                    <tr key={master.id || index}>
                                        <td className="text-left pl-12">
                                            <input type="checkbox" />
                                        </td>
                                        <td className="text-center pl-32">{master.masterTraderId}</td>
                                        <td className="text-right pl-48">{master.masterName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className='border-2 w-1/2 rounded-md'>
                        <div className='flex justify-between p-2'>
                            <div>
                                <h2 className=''>Minions</h2>
                            </div>
                            <div>
                                <MdSearch className="absolute top-[8.5%] right-[9.6%]" />
                                <input
                                    type="text"
                                    placeholder="Search for a minion"
                                    value={searchMinions}
                                    onChange={(e) => setSearchMinions(e.target.value)}
                                    className="border rounded-md p- text-center"
                                />
                            </div>
                        </div>
                        <hr />
                    
                        <table className="p-3 w-full text-gray-600 ">
                            <thead>
                                <tr className='bg-gray-100'>
                                    <th className="text-left pl-12">Checkbox</th>
                                    <th className="text-center pl-32">System ID</th>
                                    <th className="text-right pl-48">Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {minions.map((minion, index) => (
                                    <tr key={minion.id || index}>
                                        <td className="text-left pl-12">
                                            <input type="checkbox" />
                                        </td>
                                        <td className="text-center pl-32">{minion.minionClientCode}</td>
                                        <td className="text-right pl-48">{minion.minionName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>
                </div>
                <div className='text-center mt-2'>
                    <button className='bg-black text-white rounded-lg text-lg w-5/6 p-1'>Show Results</button>
                </div>
            </div>
        </div>
    );
};

export default Recon;






// import React, { useEffect, useState } from 'react'
// import Dashboard from '../../components/Dashboard/dashboard'
// import { MdSearch } from "react-icons/md";
// import { getMasters, getMasterDetails } from '../apis/masterApi';
// import { getMinions, getMinionDetails } from '../apis/minionApi';

// const Recon = () => {
//     const [masters, setMasters] = useState([]);
//     const [minions, setMinions] = useState([]);
//     const [selectedMasters, setSelectedMasters] = useState([]);
//     const [selectedMinions, setSelectedMinions] = useState([]);
//     const [masterData, setMasterData] = useState([]);
//     const [minionData, setMinionData] = useState([]);

//     const [searchMasters, setSearchMasters] = useState("");
//     const [searchMinions, setSearchMinions] = useState("");

//     useEffect(() => {
//         const fetchMasters = async () => {
//             try {
//                 const res = await getMasters();
//                 setMasters(res.data);
//             } catch (error) {
//                 console.error("Error fetching masters:", error);
//             }
//         };

//         const fetchMinions = async () => {
//             try {
//                 const res = await getMinions();
//                 setMinions(res.data);
//             } catch (error) {
//                 console.error("Error fetching minions:", error);
//             }
//         };

//         fetchMasters();
//         fetchMinions();
//     }, []);

//     const toggleMaster = (id) => {
//         setSelectedMasters((prev) =>
//             prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
//         );
//     };

//     const toggleMinion = (id) => {
//         setSelectedMinions((prev) =>
//             prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
//         );
//     };

//     const handleShowResults = async () => {
//         try {
//             const [masterRes, minionRes] = await Promise.all([
//                 getMasterDetails({ ids: selectedMasters }),
//                 getMinionDetails({ ids: selectedMinions }),
//             ]);
//             setMasterData(masterRes.data);
//             setMinionData(minionRes.data);
//         } catch (error) {
//             console.error("Error fetching details:", error);
//         }
//     };

//     return (
//         <div className='flex h-full'>
//             <Dashboard />
//             <div className='w-full'>
//                 <h1 className='text-xl mt-3 ml-3 font-bold text-gray-500'>Recon</h1>
//                 <hr className='h-0.5 bg-gray-300 w-[99%] m-auto' />
//                 <div className='flex mt-3 w-full p-3'>
//                     <div className='border-2 w-1/2 rounded-md mr-4'>
//                         <div className='flex justify-between p-2'>
//                             <h2>Masters</h2>
//                             <div>
//                                 <MdSearch className="absolute top-[8.6%] left-[44.3%]" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search for a master"
//                                     value={searchMasters}
//                                     onChange={(e) => setSearchMasters(e.target.value)}
//                                     className="border rounded-md p- text-center"
//                                 />
//                             </div>
//                         </div>
//                         <hr />
//                         <table className="p-3 w-full text-gray-600">
//                             <thead className='bg-gray-100'>
//                                 <tr>
//                                     <th className="text-left pl-12">Checkbox</th>
//                                     <th className="text-center pl-32">System ID</th>
//                                     <th className="text-right pl-48">Name</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {masters.filter(master => master.masterName.toLowerCase().includes(searchMasters.toLowerCase())).map((master, index) => (
//                                     <tr key={master.id || index}>
//                                         <td className="text-left pl-12">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={selectedMasters.includes(master.id)}
//                                                 onChange={() => toggleMaster(master.id)}
//                                             />
//                                         </td>
//                                         <td className="text-center pl-32">{master.masterTraderId}</td>
//                                         <td className="text-right pl-48">{master.masterName}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>

//                     <div className='border-2 w-1/2 rounded-md'>
//                         <div className='flex justify-between p-2'>
//                             <h2>Minions</h2>
//                             <div>
//                                 <MdSearch className="absolute top-[8.5%] right-[9.6%]" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search for a minion"
//                                     value={searchMinions}
//                                     onChange={(e) => setSearchMinions(e.target.value)}
//                                     className="border rounded-md p- text-center"
//                                 />
//                             </div>
//                         </div>
//                         <hr />
//                         <table className="p-3 w-full text-gray-600">
//                             <thead>
//                                 <tr className='bg-gray-100'>
//                                     <th className="text-left pl-12">Checkbox</th>
//                                     <th className="text-center pl-32">System ID</th>
//                                     <th className="text-right pl-48">Name</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {minions.filter(minion => minion.minionName.toLowerCase().includes(searchMinions.toLowerCase())).map((minion, index) => (
//                                     <tr key={minion.id || index}>
//                                         <td className="text-left pl-12">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={selectedMinions.includes(minion.id)}
//                                                 onChange={() => toggleMinion(minion.id)}
//                                             />
//                                         </td>
//                                         <td className="text-center pl-32">{minion.minionClientCode}</td>
//                                         <td className="text-right pl-48">{minion.minionName}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>

//                 <div className='text-center mt-2'>
//                     <button
//                         className='bg-black text-white rounded-lg text-lg w-5/6 p-1'
//                         onClick={handleShowResults}
//                     >
//                         Show Results
//                     </button>
//                 </div>

//                 {/* Results */}
//                 <div className='flex gap-4 p-4'>
//                     <div className='w-1/2 border rounded-md p-2'>
//                         <h3 className='font-semibold text-lg mb-2'>Master Data</h3>
//                         <pre className='text-sm text-gray-600 whitespace-pre-wrap'>{JSON.stringify(masterData, null, 2)}</pre>
//                     </div>
//                     <div className='w-1/2 border rounded-md p-2'>
//                         <h3 className='font-semibold text-lg mb-2'>Minion Data</h3>
//                         <pre className='text-sm text-gray-600 whitespace-pre-wrap'>{JSON.stringify(minionData, null, 2)}</pre>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Recon;
