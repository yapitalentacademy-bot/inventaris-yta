import { NextResponse } from 'next/server';
import { getNextItemCodePreview } from '@/lib/code-generator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const code = await getNextItemCodePreview();
    return NextResponse.json({
      success: true,
      data: { code },
    });
  } catch (error: any) {
    console.error('Error generating code preview:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat pratinjau kode barang' },
      { status: 500 }
    );
  }
}
