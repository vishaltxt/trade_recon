import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiLogoutCircleRLine } from "react-icons/ri";

const Dashboard = () => {
    const Navigate = useNavigate();
    const handleLogout = () => {
        Navigate('/');
    }
    return (
        <div className='bg-black flex flex-col h-screen border w-48 rounded-l-lg'>
            <div className='h-[96vh]'>
                <h2 className='text-xl text-white p-3'>Trade Replicator</h2>
                <hr />
                <ul className=' p-4 text-white font-normal text-sm'>
                    <Link to='/users'><li className='p-3  rounded-lg hover:text-white hover:bg-gray-900'>Users</li></Link>
                    <Link to='/masters'><li className='p-3 rounded-lg hover:bg-gray-900'>Masters</li></Link>
                    <Link to='/minions'><li className='p-3 rounded-lg hover:bg-gray-900'>Minions</li></Link>
                    <Link to='/mappings'><li className='p-3 rounded-lg hover:bg-gray-900'>Mappings</li></Link>
                    <Link to='/transactions'><li className='p-2 rounded-lg hover:bg-gray-900'>Transaction History</li></Link>
                    <Link to='/recon'><li className='p-3 rounded-lg hover:bg-gray-900'>Recon</li></Link>
                </ul>
            </div>
            <div className='text-gray-400 font-normal text-lg text-center'>
            <RiLogoutCircleRLine className='absolute cursor-pointer left-9 bottom-[13.5px]'/>
            <p className='cursor-pointer' onClick={handleLogout}>Logout</p>
            </div>
        </div>
    )
}

export default Dashboard
// bg-[#0a0a14]
// bg-[#001529]