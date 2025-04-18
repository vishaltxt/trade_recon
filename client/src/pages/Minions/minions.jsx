import React from 'react'
import Dashboard from '../../components/Dashboard/dashboard';

const Minion = () => {
    const data = [
        { minion_name: '09', minion_id: "544", client_code:12345, created_at: "12-01-20250" , server:"---" },
        { minion_name: '08', minion_id: "223", client_code:2245, created_at: "01-01-2025"  , server:"---"},
        { minion_name: '07', minion_id: "123", client_code:33345, created_at: "10-04-2025"  , server:"---"},
    ]
    return (
        <div className='flex h-full'>
            <Dashboard />
            <div className='w-full'>
                <h2 className='text-lg m-3 font-bold'>Minion</h2>
                <hr />
                <div className='mb-4'>
                    <div>
                        <h1 className='text-xl  font-bold m-4'>Minions</h1>
                    </div>
                    <div></div>
                    <div>
                        <button className='text-white bg-[#586f80] p-0.5 w-28 rounded-md'>+Add Minion</button>
                    </div>
                </div>
                  <div>
                  <div className='flex w-11/12 m-auto bg-gray-100 font-bold text-[#637f92]'>
                            <div className='border p-3 w-full md:w-1/3 '>Minion Name</div>
                            <div className='border p-3 w-full md:w-1/3 '>Minion Id</div>
                            <div className='border p-3 w-full md:w-1/3'>Client Code</div>
                            <div className='border p-3 w-full md:w-1/3'>Created At</div>
                            <div className='border p-3 w-full md:w-1/3'>Server</div>
                        </div>
                  </div>
                {
                   data.map((items,index) => (
                        <div key={index} className='flex w-11/12 m-auto'>
                            <div className='border p-3 w-full md:w-1/3 '>{items.minion_name}</div>
                            <div className='border p-3 w-full md:w-1/3 '>{items.minion_id}</div>
                            <div className='border p-3 w-full md:w-1/3'>{items.client_code}</div>
                            <div className='border p-3 w-full md:w-1/3'>{items.created_at}</div>
                            <div className='border p-3 w-full md:w-1/3'>{items.server}</div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Minion;
