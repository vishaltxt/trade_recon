import React, { useEffect, useState } from 'react'
import Dashboard from '../../components/Dashboard/dashboard';
import TabsContainer from '../../components/masterlanding/tabsContainer';
import MasterLanding from '../../components/masterlanding/masterlanding';
import Masterform from '../../components/masterlanding/masterform';
import { createMasters, deleteMasters, getMasters, updateMasters } from '../apis/masterApi';

const Master = () => {
    // const data = [
    //     { master_name: 'vishal', master_id: "544", created_at: "12-01-20250" },
    //     { master_name: 'suraj', master_id: "223", created_at: "01-01-2025" },
    //     { master_name: 'rahul', master_id: "123", created_at: "10-04-2025" },
    // ]
    const [master, setMasters] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [activeKey, setActiveKey] = useState('landing');

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

    const addTab = (key, title, content) => {
        if (!tabs.find(tab => tab.key === key)) {
            setTabs(prev => [...prev, { key, title, content }]);
        }
        setActiveKey(key);
    }

    const handleAddMaster = () => {
        const key = 'create';
        addTab(
            key,
            'Create Master User',
            <Masterform
                onSave={async (newMaster) => {
                    try {
                        await createMasters(newMaster);
                        await fetchMasters();
                    } catch (err) {
                        console.error("Error creating master:", err);
                    }
                    setTabs(tabs => tabs.filter(t => t.key !== key));
                    setActiveKey('landing');
                }}
                onClose={() => {
                    setTabs(tabs => tabs.filter(t => t.key !== key));
                    setActiveKey('landing');
                }}
            />
        )
    }
    const handleEditMaster = (master) => {
        const key = `edit-${master._id}`;
        addTab(
            key,
            `Edit Master ${master.masterName}`,
            <Masterform
                user={master}
                onSave={async (updatedMaster) => {
                    try {
                        await updateMasters(master._id, updatedMaster);
                        await fetchMasters();
                    } catch (err) {
                        console.error("Error updating master:", err);
                    }
                    setTabs(tabs => tabs.filter(t => t.key !== key));
                    setActiveKey('landing');
                }}
                onClose={() => {
                    setTabs(tabs => tabs.filter(t => t.key !== key));
                    setActiveKey('landing');
                }}
            />
        );
    };

    const handleDeleteMaster = async (masterId) => {
        try {
            await deleteMasters(masterId);
            await fetchMasters();
        } catch (err) {
            console.error("Error deleting master:", err);
        }
    }
    return (
        <div className='flex h-full'>
            <Dashboard />
            <div className='w-full'>
                <TabsContainer
                    tabs={[
                        {
                            key: "landing",
                            title: "Master",
                            content: <MasterLanding data={master} onAddNew={handleAddMaster} onEdit={handleEditMaster}  onDelete={handleDeleteMaster}/>
                        },
                            ...tabs
                    ]}
                    activeKey={activeKey}
                    onTabClick={setActiveKey}
                    onCloseTab={(key) => {
                        setTabs(tabs => tabs.filter(t => t.key !== key));
                        setActiveKey('landing');
                    }}
                />
                {/* <h2 className='text-lg m-3 font-bold'>Master</h2>
                <hr />
                <div className='mb-4'>
                    <div>
                        <h1 className='text-xl font-bold m-4'>Masters</h1>
                    </div>
                    <div></div>
                    <div>
                        <button className='text-white bg-[#586f80] p-0.5 w-28 rounded-md'>+Add Master</button>
                    </div>
                </div>
                  <div>
                  <div className='flex w-11/12 m-auto bg-gray-100 font-bold text-[#637f92]'>
                            <div className='border p-3 w-full md:w-1/3 '>Master Name</div>
                            <div className='border p-3 w-full md:w-1/3 '>Master Id</div>
                            <div className='border p-3 w-full md:w-1/3'>Created At</div>
                        </div>
                  </div>
                {
                   data.map((items,index) => (
                        <div key={index} className='flex w-11/12 m-auto'>
                            <div className='border p-3 w-full md:w-1/3 '>{items.master_name}</div>
                            <div className='border p-3 w-full md:w-1/3 '>{items.master_id}</div>
                            <div className='border p-3 w-full md:w-1/3'>{items.created_at}</div>
                        </div>
                    ))
                } */}
            </div>
        </div>
    )
}

export default Master;
