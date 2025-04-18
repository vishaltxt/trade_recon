import React, { useState } from 'react'
import Dashboard from '../../components/Dashboard/dashboard'
import { MdSearch } from "react-icons/md";

const Recon = () => {

    const [searchMasters, setSearchMasters] = useState("");
    const [searchMinions, setSearchMinions] = useState("");
  
    return (
        <div className='flex h-full'>
            <Dashboard />
            <div className='w-full'>
                <h1 className='text-xl mt-3 ml-3 font-bold text-gray-500'>Recon</h1>
                <hr className='h-0.5 bg-gray-300 w-[99%] m-auto'/>
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
                        <div className='p-3'>
                            <tbody className='text-gray-600 '>
                                <tr>
                                    <th className='text-left pl-12'>Checkbox</th>
                                    <th className='text-center pl-32'>System ID</th>
                                    <th className='text-right pl-48'>Name</th>
                                </tr>
                            </tbody>
                        </div>
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
                        <div className='p-3'>
                            <tbody className='text-gray-600'>
                                <tr className=''>
                                    <th className='text-left pl-12'>Checkbox</th>
                                    <th className='text-center pl-32'>Client ID</th>
                                    <th className='text-right pl-48'>Name</th>
                                </tr>
                            </tbody>
                        </div>
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
