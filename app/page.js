"use client";
import { Suspense, useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

const PDFGrid = dynamic(() => import("@/components/PDFGrid"), {
  ssr: false,
  loading: () => <div>Loading PDF preview...</div>,
});

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [oddPagesUrl, setOddPagesUrl] = useState(null);
  const [evenPagesUrl, setEvenPagesUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (oddPagesUrl) URL.revokeObjectURL(oddPagesUrl);
      if (evenPagesUrl) URL.revokeObjectURL(evenPagesUrl);
    };
  }, [oddPagesUrl, evenPagesUrl]);

  const handleFileUpload = async (event) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    // Append new files to existing ones
    setSelectedFiles((prevFiles) => [...prevFiles, ...pdfFiles]);

    const formData = new FormData();
    pdfFiles.forEach((file, index) => {
      formData.append(`pdf-${index}`, file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("Upload successful:", data);
    } catch (error) {
      console.error("Upload failed:", error);
    }

    // Reset the input value to allow selecting the same file again
    event.target.value = "";
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleCombinePDFs = async () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      formData.append(`pdf-${index}`, file);
    });

    try {
      const response = await fetch("/api/combine-pdfs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Convert base64 to Blob and create URLs
      const oddPagesBlob = new Blob(
        [Uint8Array.from(atob(data.oddPages), (c) => c.charCodeAt(0))],
        { type: "application/pdf" }
      );
      const evenPagesBlob = new Blob(
        [Uint8Array.from(atob(data.evenPages), (c) => c.charCodeAt(0))],
        { type: "application/pdf" }
      );

      const oddPagesUrl = URL.createObjectURL(oddPagesBlob);
      const evenPagesUrl = URL.createObjectURL(evenPagesBlob);

      setOddPagesUrl(oddPagesUrl);
      setEvenPagesUrl(evenPagesUrl);
    } catch (error) {
      console.error("PDF combination failed:", error);
    }
  };

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen p-12 pb-24 text-center" data-theme="light">
        <section className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col items-center gap-4">
            {selectedFiles.length === 0 ? (
              <label htmlFor="pdf-upload" className="btn btn-primary btn-wide">
                Select PDF Files
              </label>
            ) : (
              <div className="w-full space-y-6">
                <PDFGrid files={selectedFiles} onRemove={handleRemoveFile} />
                <div className="flex justify-center gap-4">
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
                  <button
                    onClick={handleCombinePDFs}
                    className="btn btn-primary inline-flex items-center gap-2"
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Combine PDFs
                  </button>
                </div>
                {oddPagesUrl && evenPagesUrl && (
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-center gap-4">
                      <a
                        href={oddPagesUrl}
                        download="odd_pages.pdf"
                        className="btn btn-success"
                      >
                        Download Odd Pages PDF
                      </a>
                      <a
                        href={evenPagesUrl}
                        download="even_pages.pdf"
                        className="btn btn-success"
                      >
                        Download Even Pages PDF
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded p-4">
                        <h3 className="font-bold mb-2">Odd Pages Preview</h3>
                        <object
                          data={oddPagesUrl}
                          type="application/pdf"
                          className="w-full h-[600px]"
                        >
                          <p>Your browser does not support PDF preview.</p>
                        </object>
                      </div>
                      <div className="border rounded p-4">
                        <h3 className="font-bold mb-2">Even Pages Preview</h3>
                        <object
                          data={evenPagesUrl}
                          type="application/pdf"
                          className="w-full h-[600px]"
                        >
                          <p>Your browser does not support PDF preview.</p>
                        </object>
                      </div>
                    </div>
                  </div>
                )}
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
