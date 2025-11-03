// components/SidePanel.tsx
import React from 'react';

interface SidePanelProps {
  isOpen: boolean;
  togglePanel: () => void;
  children: React.ReactNode;
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, togglePanel, children }) => {
  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Menu</h2>
        <button 
          className="lg:hidden text-gray-400 hover:text-white"
          onClick={togglePanel}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default SidePanel;