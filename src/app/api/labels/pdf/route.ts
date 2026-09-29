import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQRCodeDataURL } from '@/lib/qr';
import { jsPDF } from 'jspdf';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemCodes, format = 'a4_3x8' } = body; // format: 'a4_3x8', 'a4_4x10', 'thermal_50x30'

    if (!itemCodes || !Array.isArray(itemCodes) || itemCodes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pilih minimal satu barang untuk dicetak' },
        { status: 400 }
      );
    }

    const items = await prisma.item.findMany({
      where: { code: { in: itemCodes }, isDeleted: false },
      include: { category: true, location: true },
    });

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Barang tidak ditemukan' },
        { status: 404 }
      );
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // Create jsPDF Document
    let doc: jsPDF;

    if (format === 'thermal_50x30') {
      // Single Label 50mm x 30mm page orientation portrait
      doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [50, 30],
      });

      for (let i = 0; i < items.length; i++) {
        if (i > 0) doc.addPage([50, 30], 'landscape');
        const item = items[i];
        const qrUrl = `${baseUrl}/b/${item.code}`;
        const qrDataUrl = await generateQRCodeDataURL(qrUrl);

        // Header / Logo text
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 81, 50); // Forest Green
        doc.text('PT YAPI TALENT ACADEMY', 25, 4, { align: 'center' });

        // Line separator
        doc.setLineWidth(0.3);
        doc.setDrawColor(15, 81, 50);
        doc.line(3, 5.5, 47, 5.5);

        // Draw QR Code
        doc.addImage(qrDataUrl, 'PNG', 3, 7, 18, 18);

        // Right side info
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);

        // Item Code
        doc.setFontSize(8);
        doc.text(item.code, 23, 10);

        // Item Name (truncated if long)
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        const splitName = doc.splitTextToSize(item.name, 25);
        doc.text(splitName.slice(0, 2), 23, 14);

        // Category & Location
        doc.setFontSize(5.5);
        doc.setTextColor(100, 100, 100);
        doc.text(`Kat: ${item.category.name}`, 23, 22);
        doc.text(`Lokasi: ${item.location.name}`, 23, 25);
      }
    } else {
      // A4 Layout Grid
      doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const cols = format === 'a4_4x10' ? 4 : 3;
      const rows = format === 'a4_4x10' ? 10 : 8;

      const labelWidth = format === 'a4_4x10' ? 47 : 62;
      const labelHeight = format === 'a4_4x10' ? 26 : 33;
      const marginX = format === 'a4_4x10' ? 10 : 12;
      const marginY = format === 'a4_4x10' ? 10 : 12;
      const gapX = format === 'a4_4x10' ? 2.5 : 3;
      const gapY = format === 'a4_4x10' ? 2.5 : 3;

      let itemsOnPage = 0;

      for (let i = 0; i < items.length; i++) {
        if (itemsOnPage >= cols * rows) {
          doc.addPage('a4', 'portrait');
          itemsOnPage = 0;
        }

        const colIndex = itemsOnPage % cols;
        const rowIndex = Math.floor(itemsOnPage / cols);

        const x = marginX + colIndex * (labelWidth + gapX);
        const y = marginY + rowIndex * (labelHeight + gapY);

        const item = items[i];
        const qrUrl = `${baseUrl}/b/${item.code}`;
        const qrDataUrl = await generateQRCodeDataURL(qrUrl);

        // Border rectangle
        doc.setLineWidth(0.2);
        doc.setDrawColor(200, 200, 200);
        doc.roundedRect(x, y, labelWidth, labelHeight, 1.5, 1.5);

        // Header Title
        doc.setFontSize(format === 'a4_4x10' ? 5.5 : 6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 81, 50);
        doc.text('PT YAPI TALENT ACADEMY', x + labelWidth / 2, y + 4, { align: 'center' });

        // Line
        doc.setLineWidth(0.2);
        doc.setDrawColor(15, 81, 50);
        doc.line(x + 2, y + 5.5, x + labelWidth - 2, y + 5.5);

        // QR Code image
        const qrSize = format === 'a4_4x10' ? 16 : 20;
        doc.addImage(qrDataUrl, 'PNG', x + 2, y + 7, qrSize, qrSize);

        // Content Details
        const textX = x + qrSize + 3;
        const textWidthMax = labelWidth - qrSize - 4;

        doc.setFontSize(format === 'a4_4x10' ? 7.5 : 8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(item.code, textX, y + 10);

        doc.setFontSize(format === 'a4_4x10' ? 5.5 : 6.5);
        doc.setFont('helvetica', 'normal');
        const splitName = doc.splitTextToSize(item.name, textWidthMax);
        doc.text(splitName.slice(0, 2), textX, y + 14);

        doc.setFontSize(format === 'a4_4x10' ? 5 : 5.5);
        doc.setTextColor(100, 100, 100);
        doc.text(`Kategori: ${item.category.name}`, textX, y + 21);
        doc.text(`Lokasi: ${item.location.name}`, textX, y + 24);

        itemsOnPage++;
      }
    }

    const pdfArrayBuffer = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfArrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="label-inventaris-yta.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF label:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal membuat PDF label' },
      { status: 500 }
    );
  }
}
