
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
      <span className="text-slate-300 text-sm">Processing...</span>
    </div>
  );
};

export default LoadingSpinner;
