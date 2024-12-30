import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, PageSizes } from 'pdf-lib';

async function createBlankPage() {
  // Create a new PDF document with a single blank page
  const blankPdf = await PDFDocument.create();
  blankPdf.addPage(PageSizes.A4);
  return blankPdf;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = [];
    
    // Collect all PDF files from formData
    for (let i = 0; ; i++) {
      const file = formData.get(`pdf-${i}`);
      if (!file) break;
      files.push(file);
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No PDF files provided' }, { status: 400 });
    }

    // Create the merged PDF
    const mergedPdf = await PDFDocument.create();
    
    // Process each PDF file
    for (const file of files) {
      const fileBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      const pageIndices = pdf.getPageIndices();
      
      // Copy all pages from the current PDF
      const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
      copiedPages.forEach(page => mergedPdf.addPage(page));
      
      // Check if this PDF has odd number of pages
      if (pageIndices.length % 2 !== 0) {
        // Create and add a blank page
        const blankPdf = await createBlankPage();
        const [blankPage] = await mergedPdf.copyPages(blankPdf, [0]);
        mergedPdf.addPage(blankPage);
      }
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    
    return new NextResponse(mergedPdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=combined.pdf',
      },
    });
  } catch (error) {
    console.error('PDF combination error:', error);
    return NextResponse.json(
      { error: 'PDF combination failed' }, 
      { status: 500 }
    );
  }
}