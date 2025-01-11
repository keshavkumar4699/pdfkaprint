import React, { useState } from "react";

const FileUpload = () => {

  const [selectedFiles, setSelectedFiles] = useState([]);

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

  return (
    <input
      type="file"
      id="pdf-upload"
      accept=".pdf"
      multiple
      onChange={handleFileUpload}
      className="hidden"
    />
  );
};

export default FileUpload;
