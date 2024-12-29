import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Initialize PDF.js worker using CDN
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

const PDFPreview = ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);
  const [fileURL, setFileURL] = useState(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileURL(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  function onDocumentLoadSuccess({ numPages }) {
    console.log('PDF loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(err) {
    console.error('PDF loading error:', err);
    setError(err);
  }

  if (!fileURL) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <span className="text-sm text-gray-500">Preparing PDF preview...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Document
        file={fileURL}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        }
        error={
          <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
            <span className="text-sm text-red-500 text-center">
              {error ? `Error: ${error.message}` : 'Failed to load PDF'}
            </span>
          </div>
        }
      >
        {!error && (
          <Page
            pageNumber={1}
            width={192}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            error={
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-sm text-red-500">Error rendering page</span>
              </div>
            }
          />
        )}
      </Document>
    </div>
  );
};

export default PDFPreview;