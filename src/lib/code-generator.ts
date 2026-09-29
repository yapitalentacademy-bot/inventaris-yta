import { prisma } from './prisma';

/**
 * Generate Next Item Code using database atomic increment.
 * Format: 001-BRG-YTA, 002-BRG-YTA, ... 999-BRG-YTA, 1000-BRG-YTA
 */
export async function generateNextItemCode(): Promise<{ code: string; seq: number }> {
  // Upsert item sequence record
  const seqRecord = await prisma.itemSequence.upsert({
    where: { id: 1 },
    update: { lastNum: { increment: 1 } },
    create: { id: 1, lastNum: 1 },
  });

  const num = seqRecord.lastNum;
  const numStr = num < 1000 ? String(num).padStart(3, '0') : String(num);
  const code = `${numStr}-BRG-YTA`;

  return { code, seq: num };
}

/**
 * Get current sequence prediction without incrementing (for preview in form)
 */
export async function getNextItemCodePreview(): Promise<string> {
  const current = await prisma.itemSequence.findUnique({
    where: { id: 1 },
  });

  const nextNum = (current?.lastNum ?? 0) + 1;
  const numStr = nextNum < 1000 ? String(nextNum).padStart(3, '0') : String(nextNum);
  return `${numStr}-BRG-YTA`;
}

/**
 * Update Sequence start position (used during Excel Import or Admin config)
 */
export async function updateItemSequenceStart(maxNum: number): Promise<void> {
  const current = await prisma.itemSequence.findUnique({ where: { id: 1 } });
  if (!current || maxNum > current.lastNum) {
    await prisma.itemSequence.upsert({
      where: { id: 1 },
      update: { lastNum: maxNum },
      create: { id: 1, lastNum: maxNum },
    });
  }
}
