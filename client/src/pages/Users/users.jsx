import React, { useState, useEffect } from 'react';
import UserForm from '../../components/Userlanding/userform';
import TabsContainer from '../../components/Userlanding/tabsContainer';
import UserLanding from '../../components/Userlanding/userlanding';
import Dashboard from '../../components/Dashboard/dashboard';

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../apis/userApi'; // adjust the path if needed

const Users = () => {
  const [users, setUsers] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [activeKey, setActiveKey] = useState('landing');

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
        onSave={async (newUser) => {
          // console.log("NEWUSER",newUser)
          try {
            await createUser(newUser);
            await fetchUsers();
          } catch (err) {
            console.error("Error creating user:", err);
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

  const handleEditUser = (user) => {
    const key = user._id; // Assuming your API returns `_id`
    addTab(
      key,
      `Edit: ${user.firstname}`,
      <UserForm
        user={user}
        onSave={async (updatedUser) => {
          try {
            await updateUser(user._id, updatedUser);
            await fetchUsers();
          } catch (err) {
            console.error("Error updating user:", err);
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

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
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
              content: (
                <UserLanding
                  data={users}
                  onAddNew={handleAddUser}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              )
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
