import { ImageResponse } from 'next/og';

export const alt = 'Rakmana — Devis & Factures conformes DGI Algérie';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0F1A',
          color: '#E8DCC8',
          fontFamily: 'system-ui, sans-serif',
          padding: 60,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#1E40AF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
              color: '#E8DCC8',
            }}
          >
            CD
          </div>
          <span style={{ fontSize: 40, fontWeight: 800, color: '#E8DCC8' }}>
            Rakmana
          </span>
        </div>
        <h1
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: '#E8DCC8',
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Devis & Factures conformes
        </h1>
        <p
          style={{
            fontSize: 24,
            color: '#9CA3AF',
            textAlign: 'center',
            margin: '16px 0 0',
          }}
        >
          Conformité DGI Algérie — NIF, RC, TVA, Timbre Fiscal
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
