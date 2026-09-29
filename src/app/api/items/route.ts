import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateNextItemCode } from '@/lib/code-generator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';
    const categoryId = searchParams.get('category') || '';
    const locationId = searchParams.get('location') || '';
    const condition = searchParams.get('condition') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const includeDeleted = searchParams.get('deleted') === 'true';

    const where: any = {};

    if (!includeDeleted) {
      where.isDeleted = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { brandModel: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (locationId) where.locationId = locationId;
    if (condition) where.condition = condition;
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          category: true,
          location: true,
          unit: true,
          pic: true,
          photos: true,
        },
        orderBy: { codeSeq: 'desc' },
        skip,
        take: limit,
      }),
      prisma.item.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengambil data barang' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN' && userRole !== 'PETUGAS') {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki hak akses untuk menambah barang' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      categoryId,
      brandModel,
      serialNumber,
      specification,
      quantity,
      unitId,
      locationId,
      picId,
      condition,
      status,
      acquisitionDate,
      acquisitionSource,
      acquisitionPrice,
      warrantyExpiry,
      notes,
      photos,
    } = body;

    if (!name || !categoryId || !locationId || !unitId) {
      return NextResponse.json(
        { success: false, error: 'Nama, Kategori, Lokasi, dan Satuan wajib diisi' },
        { status: 400 }
      );
    }

    // Atomic generate Next Code sequence
    const { code, seq } = await generateNextItemCode();

    const userId = (session.user as any).id;

    const newItem = await prisma.item.create({
      data: {
        code,
        codeSeq: seq,
        name,
        categoryId,
        brandModel: brandModel || null,
        serialNumber: serialNumber || null,
        specification: specification || null,
        quantity: parseInt(quantity || '1', 10),
        unitId,
        locationId,
        picId: picId || null,
        condition: condition || 'BAIK',
        status: status || 'TERSEDIA',
        acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : null,
        acquisitionSource: acquisitionSource || 'PEMBELIAN',
        acquisitionPrice: acquisitionPrice ? parseFloat(acquisitionPrice) : null,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        notes: notes || null,
        createdById: userId,
        updatedById: userId,
      },
      include: {
        category: true,
        location: true,
        unit: true,
        pic: true,
      },
    });

    if (photos && Array.isArray(photos) && photos.length > 0) {
      await prisma.itemPhoto.createMany({
        data: photos.map((url: string, index: number) => ({
          itemId: newItem.id,
          url,
          isPrimary: index === 0,
        })),
      });
    }

    // Create Audit History Log
    await prisma.itemHistory.create({
      data: {
        itemId: newItem.id,
        userId,
        action: 'TAMBAH',
        details: `Menambahkan barang baru dengan kode ${code} oleh ${session.user.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: newItem,
      message: `Barang ${code} berhasil disimpan`,
    });
  } catch (error: any) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menyimpan barang' },
      { status: 500 }
    );
  }
}
