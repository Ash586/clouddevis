// ============================================================
// Rakmana Mobile — Client-side image compression
// Company logos / signatures are stored as Base64 data URLs in
// the profile JSON — uncompressed photos bloat the DB and slow
// every sync. Downscale + re-encode until the payload fits.
// ============================================================

const MAX_DIMENSION = 1024;   // px — plenty for a letterhead logo
const TARGET_KB = 500;        // hard cap for the stored data URL

function dataUrlKB(dataUrl: string): number {
  // Base64 ≈ 4/3 of the raw bytes; good enough for a size gate.
  return Math.round((dataUrl.length * 3) / 4 / 1024);
}

/**
 * Compress an image File to a data URL ≤ maxKB.
 * PNGs with transparency stay PNG on the first pass; if still too
 * heavy we fall back to JPEG with stepped quality, then shrink.
 * Throws if the file can't be decoded as an image.
 */
export async function compressImageFile(
  file: File,
  maxKB: number = TARGET_KB,
): Promise<string> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error('decode-failed');

  let width = bitmap.width;
  let height = bitmap.height;
  const scale0 = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  width = Math.round(width * scale0);
  height = Math.round(height * scale0);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-unavailable');

  const render = (w: number, h: number): void => {
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
  };

  // Pass 1 — keep the original format (preserves PNG transparency).
  render(width, height);
  const keepPng = file.type === 'image/png';
  let out = canvas.toDataURL(keepPng ? 'image/png' : 'image/jpeg', 0.85);
  if (dataUrlKB(out) <= maxKB) { bitmap.close(); return out; }

  // Pass 2 — JPEG quality steps.
  for (const q of [0.8, 0.7, 0.6, 0.5]) {
    out = canvas.toDataURL('image/jpeg', q);
    if (dataUrlKB(out) <= maxKB) { bitmap.close(); return out; }
  }

  // Pass 3 — shrink dimensions until it fits (or give up at tiny sizes).
  let w = width;
  let h = height;
  while (Math.max(w, h) > 160) {
    w = Math.round(w * 0.75);
    h = Math.round(h * 0.75);
    render(w, h);
    out = canvas.toDataURL('image/jpeg', 0.6);
    if (dataUrlKB(out) <= maxKB) { bitmap.close(); return out; }
  }

  bitmap.close();
  return out; // best effort — caller may still gate on size
}
