import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import react-pdf to avoid SSR issues
const PDFPreview = dynamic(() => import('./PDFPreview'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-200 w-full h-full rounded"></div>
  ),
});

const PDFGrid = ({ files = [], onRemove }) => {
  // Guard clause to handle empty or undefined files
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
          >
            <div className="relative w-full h-64">
              <PDFPreview file={file} />
              <button
                onClick={() => onRemove?.(index)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 z-10"
                aria-label="Remove file"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFGrid;