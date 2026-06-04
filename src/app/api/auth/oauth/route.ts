import { NextResponse } from 'next/server';

export async function GET() {
  const providers = [
    { id: 'google', label: 'Google', configured: !!process.env.GOOGLE_CLIENT_ID },
    { id: 'github', label: 'GitHub', configured: !!process.env.GITHUB_CLIENT_ID },
  ];
  return NextResponse.json({ providers });
}
