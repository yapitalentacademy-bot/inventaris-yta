import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pics = await prisma.personInCharge.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ success: true, data: pics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== 'ADMIN' && userRole !== 'PETUGAS')) {
      return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 });
    }

    const { name, division } = await request.json();
    if (!name) return NextResponse.json({ success: false, error: 'Nama penanggung jawab wajib diisi' }, { status: 400 });

    const newPic = await prisma.personInCharge.create({
      data: { name: name.trim(), division: division?.trim() },
    });

    return NextResponse.json({ success: true, data: newPic });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
