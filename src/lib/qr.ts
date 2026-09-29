import QRCode from 'qrcode';

export async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 300,
      margin: 1,
      color: {
        dark: '#0F5132',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

export function getItemPublicUrl(code: string, origin?: string): string {
  const baseUrl = origin || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/b/${encodeURIComponent(code)}`;
}
