import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  className = '' 
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
        <div className="flex-1">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};