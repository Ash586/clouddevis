import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  const minVersion = process.env.MOBILE_MIN_VERSION ?? '1.0.0';
  const apkUrl = process.env.MOBILE_APK_URL ?? '';
  const releaseNotes = process.env.MOBILE_RELEASE_NOTES ?? 'Améliorations et corrections.';

  return NextResponse.json({
    minVersion,
    apkUrl,
    releaseNotes,
  });
}
