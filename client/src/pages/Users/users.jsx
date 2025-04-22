import React, { useState } from 'react';
import UserForm from '../../components/Userlanding/userform';
import TabsContainer from '../../components/Userlanding/tabsContainer';
import UserLanding from '../../components/Userlanding/userlanding';
import Dashboard from '../../components/Dashboard/dashboard';

const Users = () => {
  const [users, setUsers] = useState([
  {id: '1', firstName: "Vishal", lastName: "Sharma", email: "vis@gmail.com", role: "Admin" },
  {id: '2', firstName: "Suraj", lastName: "Kumar", email: "suraj@gmail.com", role: "Manager" },
  {id: '3', firstName: "Rahul", lastName: "Verma", email: "rahul@gmail.com", role: "Reader" },
  ]);

  const [tabs, setTabs] = useState([]);
  const [activeKey, setActiveKey] = useState('landing');

  const addTab = (key, title, content) => {
    if (!tabs.find(tab => tab.key === key)) {
      setTabs(prev => [...prev, { key, title, content }]);
    }
    setActiveKey(key);   
  };

  const handleAddUser = () => {
    const key = 'create';
    addTab(
      key,
      'Create User',
      <UserForm
      onSave={(newUser) => {
        // Add the new user to state
        const newUserWithId = { ...newUser, id: Date.now().toString() };
        setUsers(prev => [...prev, newUserWithId]);

        // Close the create tab
        setTabs(tabs => tabs.filter(t => t.key !== key));
        setActiveKey('landing');
      }}
      onClose={() => {
        setTabs(tabs => tabs.filter(t => t.key !== key));
        setActiveKey('landing');
      }}
    />
      // <UserForm
      //   onSave={() => {
      //     setTabs(tabs => tabs.filter(t => t.key !== key));
      //     setActiveKey('landing');
      //   }}
      //   onClose={() => {
      //     setTabs(tabs => tabs.filter(t => t.key !== key));
      //     setActiveKey('landing');
      //   }}
      // />
    );
  };
  const handleEditUser = (user) => {
    const key = user.id;
    addTab(
      key,
      `Edit: ${user.firstName}`,
      <UserForm
        user={user}
        onSave={(updatedUser) => {
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...updatedUser } : u));
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

  const handleDeleteUser = (userId) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };
  return (
    <div className='flex'>
      <div>
        <Dashboard />
      </div>
      <div className='w-full'>
        <TabsContainer 
          tabs={[
            {
              key: 'landing',
              title: 'User',
              content: <UserLanding data={users} onAddNew={handleAddUser} onEdit={handleEditUser} onDelete={handleDeleteUser}/>
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
    </div>
  );
};

export default Users;
