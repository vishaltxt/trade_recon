import React, { useState, useEffect } from 'react'
import Dashboard from '../../components/Dashboard/dashboard';
import MappingForm from '../../components/mappingLanding/mappingForm';
import TabsContainer from '../../components/mappingLanding/tabsContainer';
import Mappinglanding from '../../components/mappingLanding/mappinglanding';
import { createMappings, deleteMappings, getMappings, updateMappings } from '../apis/mappingApi';
import { toast } from 'react-toastify';

const Mapping = () => {
    const [mappings, setMappings] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [activeKey, setActiveKey] = useState('landing');

    const fetchMappings = async () => {
        try {
            const res = await getMappings();
            setMappings(res.data);
        } catch (error) {
            console.error("Error fetching mappings:", error);
        }
    };

    useEffect(() => {
        fetchMappings();
    }, []);

    const addTab = (key, title, content) => {
        if (!tabs.find(tab => tab.key === key)) {
            setTabs(prev => [...prev, { key, title, content }]);
        }
        setActiveKey(key);
    };

    const handleAddMappings = () => {
        const key = 'create';
        addTab(
            key,
            'Create Mapping',
            <MappingForm
                onSave={async (newMapping) => {
                    try {
                        await createMappings(newMapping);
                        await fetchMappings();
                        toast.success('Mapping Created Successfully!');
                    } catch (err) {
                        console.error("Error creating mappings:", err);
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
    const handleEditMappings = (mapping) => {
        const key = `edit-${mapping._id}`;
        addTab(
            key,
            `Edit Mapping ${mapping.mappingName}`,
            <MappingForm
                mapping={mapping}
                onSave={async (updatedMapping) => {
                    try {
                        await updateMappings(mapping._id, updatedMapping);
                        await fetchMappings();
                        toast.success('Mapping Updated Successfully!');
                    } catch (err) {
                        console.error("Error updating mapping:", err);
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

    const handleDeleteMappings = async (mappingId) => {
        try {
            await deleteMappings(mappingId);
            await fetchMappings();
            toast.success('Mapping deleted successfully!');
        } catch (err) {
            console.error("Error deleting mapping:", err);
        }
    }
    return (
        <div className='flex h-full'>
            <Dashboard />
            <div className='w-full'>
                <div className='w-full'>
                    <TabsContainer
                        tabs={[
                            {
                                key: 'landing',
                                title: 'Mapping',
                                style: {},
                                content: <Mappinglanding data={mappings} onAddNew={handleAddMappings} onEdit={handleEditMappings} onDelete={handleDeleteMappings} />
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
                </div>
                {/* <h2 className='text-lg m-3 font-bold'>Mapping</h2>
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
                } */}
            </div>
        </div>
    )
}

export default Mapping;
