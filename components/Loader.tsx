
import React from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex flex-col justify-center items-center z-50 backdrop-blur-sm">
      <div className="flex flex-col items-center text-center text-sky-300">
        <SparklesIcon className="w-16 h-16 animate-pulse" />
        <p className="mt-4 text-xl font-medium text-gray-200">{message}</p>
        <div className="mt-2 w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-sky-400 rounded-full animate-loader-progress"></div>
        </div>
      </div>
      <style>{`
        @keyframes loader-progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .animate-loader-progress {
            animation: loader-progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
