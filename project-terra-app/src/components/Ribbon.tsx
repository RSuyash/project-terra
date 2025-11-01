import { useState } from 'react';

interface RibbonProps {
  children: React.ReactNode;
  title?: string;
}

const Ribbon: React.FC<RibbonProps> = ({ children, title = "Tools" }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
      <div 
        className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer md:hidden"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{title}</h3>
        <svg 
          className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </div>
      
      <div className={`p-4 ${isExpanded ? 'block' : 'hidden md:block'}`}>
        <div className="flex flex-wrap gap-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Ribbon;