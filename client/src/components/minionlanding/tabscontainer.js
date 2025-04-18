import React from 'react';

const TabsContainer = ({ tabs, activeKey, onTabClick, onCloseTab }) => {
  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {tabs.map((tab) => (
          <div className='mt-5 ml-5 text-gray-400 text-lg' key={tab.key} style={{ borderBottom: activeKey === tab.key ? '2px solid grey' : 'none' }}>
            <button  onClick={() => onTabClick(tab.key)}>{tab.title}</button>
            <button className='ml-1' onClick={() => onCloseTab(tab.key)}>x</button>
          </div>
        ))}
      </div>
      <div className='mt-7'>
        {tabs.find(tab => tab.key === activeKey)?.content}
      </div>
    </div>
  );
};

export default TabsContainer;