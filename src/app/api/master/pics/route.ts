import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Akses khusus Admin' }, { status: 403 });
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
