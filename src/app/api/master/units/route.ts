import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const units = await prisma.unit.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ success: true, data: units });
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

    const { name } = await request.json();
    if (!name) return NextResponse.json({ success: false, error: 'Nama satuan wajib diisi' }, { status: 400 });

    const newUnit = await prisma.unit.create({
      data: { name: name.trim().toLowerCase() },
    });

    return NextResponse.json({ success: true, data: newUnit });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
