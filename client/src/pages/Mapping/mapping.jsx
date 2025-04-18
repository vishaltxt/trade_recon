import React from 'react'
import Dashboard from '../../components/Dashboard/dashboard';

const Mapping = () => {
    const data = [
        { master_id: '111', minion_id: "544", percentage_replication:"100%" , replication:"Yes" , created_at: "12-01-20250"  },
        { master_id: '222', minion_id: "223", percentage_replication:"100%", replication:"Yes" , created_at: "01-01-2025"  },
        { master_id: '333', minion_id: "123", percentage_replication:"100%", replication:"Yes" , created_at: "10-04-2025" },
        { master_id: '333', minion_id: "123", percentage_replication:"100%", replication:"Yes" , created_at: "10-04-2025" },
        { master_id: '333', minion_id: "123", percentage_replication:"100%", replication:"Yes" , created_at: "10-04-2025" },
    ]
    return (
        <div className='flex h-full'>
            <Dashboard />
            <div className='w-full'>
                <h2 className='text-lg m-3 font-bold'>Mapping</h2>
                <hr />
                <div className='mb-4'>
                    <div>
                        <h1 className='text-xl  font-bold m-4'>All Mappings</h1>
                    </div>
                    <div></div>
                    <div>
                        <button className='text-white bg-[#586f80] p-0.5 w-32 rounded-md'>+Add Mappings</button>
                    </div>
                </div>
                  <div>
                  <div className='flex w-11/12 m-auto bg-gray-100 font-bold text-[#637f92]'>
                            <div className='border p-3 w-full md:w-1/3 '>Master ID</div>
                            <div className='border p-3 w-full md:w-1/3 '>Minion Id</div>
                            <div className='border p-3 w-full md:w-1/3'>Percentage for Replication</div>
                            <div className='border p-3 w-full md:w-1/3'>Replication</div>
                            <div className='border p-3 w-full md:w-1/3'>Created At</div>
                        </div>
                  </div>
                {
                   data.map((items,index) => (
                        <div key={index} className='flex w-11/12 m-auto'>
                            <div className='border p-3 w-full md:w-1/3 '>{items.master_id}</div>
                            <div className='border p-3 w-full md:w-1/3 '>{items.minion_id}</div>
                            <div className='border p-3 w-full md:w-1/3'>{items.percentage_replication}</div>
                            <div className='border p-3 w-full md:w-1/3'>{items.replication}</div>
                            <div className='border p-3 w-full md:w-1/3'>{items.created_at}</div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Mapping;
