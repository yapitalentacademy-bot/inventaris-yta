import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { items: true } } },
    });
    return NextResponse.json({ success: true, data: locations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Akses khusus Admin' }, { status: 403 });
    }

    const { name, type, description } = await request.json();
    if (!name) return NextResponse.json({ success: false, error: 'Nama lokasi wajib diisi' }, { status: 400 });

    const newLocation = await prisma.location.create({
      data: { name: name.trim(), type: type?.trim(), description: description?.trim() },
    });

    return NextResponse.json({ success: true, data: newLocation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
