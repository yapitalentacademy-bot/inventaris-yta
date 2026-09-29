import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;

    const item = await prisma.item.findUnique({
      where: { code },
      include: {
        category: true,
        location: true,
        unit: true,
        pic: true,
        photos: true,
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
        history: {
          include: {
            user: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Barang tidak ditemukan' },
        { status: 404 }
      );
    }

    // Confidentiality Check for price
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    const responseData = { ...item };
    if (userRole !== 'ADMIN') {
      delete (responseData as any).acquisitionPrice;
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    console.error('Error fetching item details:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengambil detail barang' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
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
        { success: false, error: 'Anda tidak memiliki akses untuk mengedit barang' },
        { status: 403 }
      );
    }

    const code = params.code;
    const existingItem = await prisma.item.findUnique({
      where: { code },
      include: { photos: true },
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'Barang tidak ditemukan' },
        { status: 404 }
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

    const userId = (session.user as any).id;

    // Detect field changes for History Log
    const changes: string[] = [];
    if (name !== existingItem.name) changes.push(`Nama: ${existingItem.name} ➔ ${name}`);
    if (condition !== existingItem.condition) changes.push(`Kondisi: ${existingItem.condition} ➔ ${condition}`);
    if (status !== existingItem.status) changes.push(`Status: ${existingItem.status} ➔ ${status}`);
    if (locationId !== existingItem.locationId) changes.push(`Lokasi diperbarui`);

    const updateData: any = {
      name,
      categoryId,
      brandModel: brandModel || null,
      serialNumber: serialNumber || null,
      specification: specification || null,
      quantity: parseInt(quantity || '1', 10),
      unitId,
      locationId,
      picId: picId || null,
      condition: condition || existingItem.condition,
      status: status || existingItem.status,
      acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : null,
      acquisitionSource: acquisitionSource || existingItem.acquisitionSource,
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      notes: notes || null,
      updatedById: userId,
    };

    if (userRole === 'ADMIN' && acquisitionPrice !== undefined) {
      updateData.acquisitionPrice = acquisitionPrice ? parseFloat(acquisitionPrice) : null;
    }

    const updatedItem = await prisma.item.update({
      where: { code },
      data: updateData,
      include: {
        category: true,
        location: true,
        unit: true,
        pic: true,
      },
    });

    if (photos && Array.isArray(photos)) {
      await prisma.itemPhoto.deleteMany({ where: { itemId: existingItem.id } });
      await prisma.itemPhoto.createMany({
        data: photos.map((url: string, index: number) => ({
          itemId: existingItem.id,
          url,
          isPrimary: index === 0,
        })),
      });
    }

    // Create Audit Log
    const changeDetail = changes.length > 0 ? changes.join(', ') : 'Pembaruan informasi data barang';
    await prisma.itemHistory.create({
      data: {
        itemId: existingItem.id,
        userId,
        action: 'EDIT',
        details: `${changeDetail} oleh ${session.user.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: `Barang ${code} berhasil diperbarui`,
    });
  } catch (error: any) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal merubah barang' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Hanya Admin yang dapat menghapus data barang' },
        { status: 403 }
      );
    }

    const code = params.code;
    const existingItem = await prisma.item.findUnique({ where: { code } });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'Barang tidak ditemukan' },
        { status: 404 }
      );
    }

    // Soft Delete: Mark as DIHAPUSKAN & isDeleted = true
    const deletedItem = await prisma.item.update({
      where: { code },
      data: {
        isDeleted: true,
        status: 'DIHAPUSKAN',
        deletedAt: new Date(),
        updatedById: (session.user as any).id,
      },
    });

    await prisma.itemHistory.create({
      data: {
        itemId: existingItem.id,
        userId: (session.user as any).id,
        action: 'DIHAPUSKAN',
        details: `Barang di-soft delete (ditandai Dihapuskan) oleh Admin ${session.user.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Barang ${code} berhasil ditandai sebagai Dihapuskan`,
    });
  } catch (error: any) {
    console.error('Error soft deleting item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menghapus barang' },
      { status: 500 }
    );
  }
}
