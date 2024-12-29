import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = [];

    // Get all files from formData
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('pdf-')) {
        files.push(value);
      }
    }

    // Process each file
    
    const results = await Promise.all(files.map(async (file) => {
      // Handle each file upload here
      // Example: upload to cloud storage
      return file.name;
    }));

    return NextResponse.json({ 
      success: true, 
      message: 'Files uploaded successfully',
      uploadedFiles: results
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Upload failed' },
      { status: 500 }
    );
  }
}