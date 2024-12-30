import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, PageSizes } from 'pdf-lib';

async function createBlankPage() {
  const blankPdf = await PDFDocument.create();
  blankPdf.addPage(PageSizes.A4);
  return blankPdf;
}

async function splitIntoEvenOddPdfs(pdfDoc) {
  // Create two new PDFs for even and odd pages
  const evenPagesPdf = await PDFDocument.create();
  const oddPagesPdf = await PDFDocument.create();
  
  const totalPages = pdfDoc.getPageCount();
  
  // Copy pages to respective PDFs (page numbers start at 0)
  for (let i = 0; i < totalPages; i++) {
    const targetPdf = i % 2 === 0 ? oddPagesPdf : evenPagesPdf; // i=0 is first page (odd)
    const [copiedPage] = await targetPdf.copyPages(pdfDoc, [i]);
    targetPdf.addPage(copiedPage);
  }
  
  return {
    evenPages: await evenPagesPdf.save(),
    oddPages: await oddPagesPdf.save()
  };
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

    // Split the merged PDF into even and odd pages
    const { evenPages, oddPages } = await splitIntoEvenOddPdfs(mergedPdf);

    // Return JSON with base64 encoded PDFs
    return NextResponse.json({
      oddPages: Buffer.from(oddPages).toString('base64'),
      evenPages: Buffer.from(evenPages).toString('base64')
    });
  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: 'PDF processing failed' }, 
      { status: 500 }
    );
  }
}