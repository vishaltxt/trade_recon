import React from 'react'
import Dashboard from '../../components/Dashboard/dashboard';

const Transactions = () => {
   
    return (
        <div className='flex h-full'>
            <Dashboard />
            <div className='w-full'>
                <h2 className='text-lg m-3 font-bold'>Transaction</h2>
                <hr />
                <div className='mb-4 flex justify-between'>
                    <div>
                        <h1 className='text-xl  font-bold m-4'>Transactions <span className="text-sm">11 items</span></h1>
                    </div>
                    <div></div>
                    <div>
                        <button className='text-white bg-[#586f80] p-0.5 w-36 m-4 rounded-md'>+Add Transaction</button>
                    </div>
                </div>
                  <div>
                  <div className='flex w-[98%] m-auto bg-gray-100 font-bold text-[#637f92]'>
                            <div className='border p-3 w-full md:w-1/3 '>Security Name</div>
                            <div className='border p-3 w-full md:w-1/3 '>Minion Trade Quantity</div>
                            <div className='border p-3 w-full md:w-1/3'>Order Side</div>
                            <div className='border p-3 w-full md:w-1/3'>Transaction Status</div>
                            <div className='border p-3 w-full md:w-1/3'>Failure Reason</div>
                            <div className='border p-3 w-full md:w-1/3'>Minion Mismatch Quantity</div>
                            <div className='border p-3 w-full md:w-1/3'>Transaction Date</div>
                        </div>
                  </div>
                {/* {
                   data.map((items,index) => (
                        <div key={index} className='flex w-11/12 m-auto'>
                            <div className='border p-3 w-full md:w-1/3 '>{items.master_id}</div>
                            <div className='border p-3 w-full md:w-1/3 '>{items.minion_id}</div>
                            <div className='border p-3 w-full md:w-1/3'>{items.percentage_replication}</div>
                            <div className='border p-3 w-full md:w-1/3'>{items.replication}</div>
                            <div className='border p-3 w-full md:w-1/3'>{items.created_at}</div>
                        </div>
                    ))
                } */}
            </div>
        </div>
    )
}

export default Transactions;
