import React from 'react'
import Dashboard from '../../components/Dashboard/dashboard'

const Recon = () => {
    return (
        <div className='flex h-full'>
            <Dashboard />
            <div className='w-full'>
                <h1 className='text-xl m-3 font-bold text-gray-500'>Recon</h1>
                <hr />
                {/* <div className='h-1 border border-cyan-500'></div> */}
                <div className='flex mt-3 w-full p-2'>
                    <div className='border-2 w-1/2 rounded-md mr-4'>
                        <div className='p-2'>
                            <h2>Masters</h2>
                        </div>
                        <hr />
                        <div>
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
                        <div className='p-2'>
                            <h2>Minions</h2>
                        </div>
                        <hr />
                        <div>
                            <tbody className='text-gray-600'>
                                <tr>
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
