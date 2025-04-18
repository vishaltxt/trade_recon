import React, { useState } from 'react';
import UserForm from '../../components/Userlanding/userform';
import TabsContainer from '../../components/Userlanding/tabsContainer';
import UserLanding from '../../components/Userlanding/userlanding';
import Dashboard from '../../components/Dashboard/dashboard';

const Users = () => {
  // const [users, setUsers] = useState([
  //   { id: '1', firstName: 'Alice', lastName: 'Brown', email: 'alice@example.com' },
  //   { id: '2', firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com' }
  // ]);

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
        onSave={() => {
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

  // const handleEditUser = (user) => {
  //   const key = user.id;
  //   addTab(
  //     key,
  //     `${user.firstName} ${user.lastName}`,
  //     <UserForm
  //       user={user}
  //       isCreateMode={false}
  //       onSave={() => {
  //         setTabs(tabs => tabs.filter(t => t.key !== key));
  //         setActiveKey('landing');
  //       }}
  //       onClose={() => {
  //         setTabs(tabs => tabs.filter(t => t.key !== key));
  //         setActiveKey('landing');
  //       }}
  //     />
  //   );
  // };
  // onEdit={handleEditUser}
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
              content: <UserLanding onAddNew={handleAddUser} />
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
