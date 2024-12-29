"use client";
import { Suspense, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import dynamic from 'next/dynamic';

const PDFGrid = dynamic(() => import('@/components/PDFGrid'), {
  ssr: false,
  loading: () => <div>Loading PDF preview...</div>
});

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileUpload = async (event) => {
    if (!event.target.files) return;
    
    const files = Array.from(event.target.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    // Append new files to existing ones
    setSelectedFiles(prevFiles => [...prevFiles, ...pdfFiles]);
   
    const formData = new FormData();
    pdfFiles.forEach((file, index) => {
      formData.append(`pdf-${index}`, file);
    });
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Upload successful:', data);
    } catch (error) {
      console.error('Upload failed:', error);
    }
    
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen p-12 pb-24 text-center" data-theme="light">
        <section className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Upload Multiple PDFs 📚
          </h1>
          <div className="flex flex-col items-center gap-4">
            {selectedFiles.length === 0 ? (
              // Show initial upload button when no files are selected
              <label htmlFor="pdf-upload" className="btn btn-primary btn-wide">
                Select PDF Files
              </label>
            ) : (
              // Show the grid and add more button when files exist
              <div className="w-full space-y-6">
                <PDFGrid 
                  files={selectedFiles}
                  onRemove={handleRemoveFile}
                />
                <label 
                  htmlFor="pdf-upload" 
                  className="btn btn-outline btn-primary inline-flex items-center gap-2"
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add More PDFs
                </label>
              </div>
            )}
            <input
              type="file"
              id="pdf-upload"
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}