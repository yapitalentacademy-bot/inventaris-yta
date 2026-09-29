import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateItemSequenceStart } from '@/lib/code-generator';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Silakan login terlebih dahulu' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Hanya Admin yang dapat mengimpor data' }, { status: 403 });
    }

    const body = await request.json();
    const { rows, action } = body; // action: 'preview' or 'save'

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Format data impor kosong atau tidak valid' }, { status: 400 });
    }

    // Default Master collections to resolve names to IDs
    const [categories, locations, units] = await Promise.all([
      prisma.category.findMany(),
      prisma.location.findMany(),
      prisma.unit.findMany(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.name.toLowerCase().trim(), c.id]));
    const locationMap = new Map(locations.map((l) => [l.name.toLowerCase().trim(), l.id]));
    const unitMap = new Map(units.map((u) => [u.name.toLowerCase().trim(), u.id]));

    // Default fallback IDs if missing
    let defaultCatId = categories[0]?.id;
    let defaultLocId = locations[0]?.id;
    let defaultUnitId = units[0]?.id;

    const validatedRows: any[] = [];
    const errors: string[] = [];
    let maxSequenceFound = 0;

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 1;

      const codeRaw = (row['ID Barang'] || row['Kode Barang'] || row['Kode'] || '').toString().trim();
      const name = (row['Nama Barang'] || row['Nama'] || '').toString().trim();
      const catName = (row['Kategori'] || '').toString().trim().toLowerCase();
      const locName = (row['Lokasi'] || '').toString().trim().toLowerCase();
      const unitName = (row['Satuan'] || '').toString().trim().toLowerCase();
      const quantity = parseInt(row['Stok Awal'] || row['Jumlah'] || '1', 10);
      const conditionRaw = (row['Kondisi'] || 'Baik').toString().trim().toUpperCase();
      const notes = (row['Keterangan'] || row['Spesifikasi'] || '').toString().trim();

      if (!name) {
        errors.push(`Baris ${rowNum}: Nama Barang tidak boleh kosong.`);
        continue;
      }

      // Extract sequence number from code format like 001-BRG-YTA or 1000-BRG-YTA
      let seqNum = 0;
      let finalCode = codeRaw;

      if (codeRaw) {
        const match = codeRaw.match(/^(\d+)-BRG-YTA$/i);
        if (match) {
          seqNum = parseInt(match[1], 10);
        } else {
          // If custom numeric
          const numMatch = codeRaw.match(/\d+/);
          if (numMatch) seqNum = parseInt(numMatch[0], 10);
        }
      }

      if (seqNum > maxSequenceFound) {
        maxSequenceFound = seqNum;
      }

      // Resolve category, location, unit or auto-create if missing
      let categoryId = categoryMap.get(catName);
      if (!categoryId && catName) {
        const createdCat = await prisma.category.create({ data: { name: row['Kategori'].trim() } });
        categoryId = createdCat.id;
        categoryMap.set(catName, categoryId);
      }

      let locationId = locationMap.get(locName);
      if (!locationId && locName) {
        const createdLoc = await prisma.location.create({ data: { name: row['Lokasi'].trim() } });
        locationId = createdLoc.id;
        locationMap.set(locName, locationId);
      }

      let unitId = unitMap.get(unitName);
      if (!unitId && unitName) {
        const createdUnit = await prisma.unit.create({ data: { name: row['Satuan'].trim() } });
        unitId = createdUnit.id;
        unitMap.set(unitName, unitId);
      }

      // Map Condition
      let condition: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT' = 'BAIK';
      if (conditionRaw.includes('RINGAN')) condition = 'RUSAK_RINGAN';
      else if (conditionRaw.includes('BERAT')) condition = 'RUSAK_BERAT';

      validatedRows.push({
        rowNum,
        code: finalCode,
        seq: seqNum,
        name,
        categoryId: categoryId || defaultCatId,
        locationId: locationId || defaultLocId,
        unitId: unitId || defaultUnitId,
        quantity: isNaN(quantity) ? 1 : quantity,
        condition,
        notes,
      });
    }

    if (action === 'preview') {
      return NextResponse.json({
        success: true,
        summary: {
          totalRows: rows.length,
          validRowsCount: validatedRows.length,
          errorCount: errors.length,
          maxSequenceFound,
        },
        errors,
        previewData: validatedRows.slice(0, 10),
      });
    }

    // Process actual Save
    const userId = (session.user as any).id;
    let createdCount = 0;

    for (const item of validatedRows) {
      let finalCode = item.code;
      let codeSeq = item.seq;

      // If item code was not provided in Excel, generate from current sequence
      if (!finalCode) {
        maxSequenceFound++;
        codeSeq = maxSequenceFound;
        const numStr = codeSeq < 1000 ? String(codeSeq).padStart(3, '0') : String(codeSeq);
        finalCode = `${numStr}-BRG-YTA`;
      }

      await prisma.item.upsert({
        where: { code: finalCode },
        update: {
          name: item.name,
          categoryId: item.categoryId,
          locationId: item.locationId,
          unitId: item.unitId,
          quantity: item.quantity,
          condition: item.condition,
          notes: item.notes,
          updatedById: userId,
        },
        create: {
          code: finalCode,
          codeSeq,
          name: item.name,
          categoryId: item.categoryId,
          locationId: item.locationId,
          unitId: item.unitId,
          quantity: item.quantity,
          condition: item.condition,
          status: 'TERSEDIA',
          notes: item.notes,
          createdById: userId,
          updatedById: userId,
        },
      });

      createdCount++;
    }

    // Synchronize Database Sequence Number so next auto-generated code doesn't conflict
    if (maxSequenceFound > 0) {
      await updateItemSequenceStart(maxSequenceFound);
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${createdCount} data barang. Sequence berlanjut dari nomor ${maxSequenceFound + 1}.`,
      importedCount: createdCount,
      nextSequence: maxSequenceFound + 1,
    });
  } catch (error: any) {
    console.error('Error importing items:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengimpor data' }, { status: 500 });
  }
}
