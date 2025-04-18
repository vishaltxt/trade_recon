import React from 'react';

const TabsContainer = ({ tabs, activeKey, onTabClick, onCloseTab }) => {
  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {tabs.map((tab) => (
          <div key={tab.key} style={{ borderBottom: activeKey === tab.key ? '2px solid grey' : 'none' }}>
            <button onClick={() => onTabClick(tab.key)}>{tab.title}</button>
            <button onClick={() => onCloseTab(tab.key)}>x</button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '1rem' }}>
        {tabs.find(tab => tab.key === activeKey)?.content}
      </div>
    </div>
  );
};

export default TabsContainer;