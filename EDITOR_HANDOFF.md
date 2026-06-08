# Handoff — Editor Page (CloudDevis)

## Architecture

```
/app/dashboard/editor/page.tsx   ← main editor UI (629 lines, `'use client'`)
├── hooks/useEditor.ts            ← combines state + actions
│   ├── hooks/useEditorState.ts   ← state management, localStorage auto-save, draft restoration
│   └── hooks/useEditorActions.ts ← all mutations (add item, save, update fields, etc.)
├── types/index.ts                ← DocumentState, LineItem, UserMode, CompanyInfo, etc.
├── lib/calculations.ts          ← TVA, timbre fiscal, discount, totals
├── lib/validation.ts             ← NIF/RC/NIS/AI validation, line item validation
├── lib/generateDocumentHTML.ts   ← HTML → PDF generation
└── components/editor/
    ├── DocumentPreview.tsx       ← main preview (A4 layout)
    ├── preview/PreviewHeader.tsx ← company info, logo, doc type/number
    ├── preview/PreviewMetaSections.tsx
    ├── preview/PreviewFooter.tsx
    ├── CollapsibleSection.tsx    ← collapsible sections with drag
    ├── FieldSelector.tsx         ← field visibility customizer
    └── SectionCreatorForm.tsx    ← custom section creator
```

## Key Types (`types/index.ts`)

```typescript
interface DocumentState {
  mode: 'artisan' | 'entreprise';
  clientInfo: ClientInfo;
  companyInfo?: CompanyInfo;       // has logo?: string (base64)
  artisanInfo?: ArtisanInfo;
  items: LineItem[];               // the line items
  tvaRate: number;                 // 0 | 9 | 19
  paymentMode: 'cheque' | 'virement' | 'especes' | 'cb';
  documentType: 'devis' | 'proforma' | 'bc' | 'br' | 'facture';
  documentNumber: string;
  date: string;                    // ISO date
  validUntil?: string;
  discount: DiscountInfo;          // { type, value, reason }
  stampDuty: StampDutyConfig;      // { rate, minAmount, maxAmount }
  paymentDetails: PaymentDetails;  // { terms, iban }
  hiddenBlocks: BlockId[];         // toggle visibility of blocks
  // ...chantier fields, materiaux fields, garantie fields
  sectionOrder: string[];          // order of sections
  customFields: Record<string, Record<string, any>>;
  logoPosition?: 'left' | 'right';
}
```

## Sections Layout

The editor renders sections from `doc.sectionOrder` (left panel) + preview (right panel).

Each section is returned by `renderSection(id)` in a switch statement:

| Case ID | Purpose | Fields |
|---------|---------|--------|
| `design` | Logo upload + position | `logo`, `logoPosition` |
| `general` | Doc number, dates, TVA, stamp | `docNumber`, `issueDate`, `validUntil`, `vatRate`, `stampRate` |
| `mode` | Business/Artisan toggle | `businessMode` |
| `client` | Client info + company/artisan info | `clientName`, `clientAddress`, `clientNif`, NIF/RC/NIS/AI inputs |
| `chantier` | Construction site details | `chantierAddress`, `chantierType`, `chantierCondition`, etc. |
| `materiaux` | Materials info | `materiauxBrand`, `materiauxType`, etc. |
| `prestations` | Line items table | Add/edit/remove items with inline validation |
| `remise` | Discount | `remiseType`, `remiseValue`, `remiseReason` |
| `garanties` | Warranty info | `garantieLabor`, `garantieMaterials`, `garantieNotes` |
| `paiement` | Payment details + totals | `paymentMethod`, `paymentDeposit`, totals display |
| `notes` | Notes textarea | `notes` |

## Dependencies (from package.json)

- **next-intl** — translations via `useTranslations('editor')`
- **Tailwind CSS v4** — all styling (but the admin uses inline styles, editor uses Tailwind classes)
- **Next.js 16.2.6** — App Router

No external UI library, no Zod (custom validation in `validation.ts`).

## PDF Generation Flow

```
saveDoc() → POST /api/documents (saves to DB)
handleDownload() → generateDocumentHTML() → blob → window.open(URL)
```

`generateDocumentHTML` produces a full HTML page with embedded CSS, opens in new tab, auto-prints.

## Auto-Save

- **localStorage** (500ms debounce): `useEditorState.ts` → `localStorage.setItem('clouddevis-draft', JSON.stringify(doc))`
- **Server** (30s interval): `page.tsx` → `saveDoc()` → `PUT /api/documents/[id]`
- **Restore**: `loadDraft()` in `useEditorState.ts` reads localStorage on mount, shows "Draft restored" toast

## Validation

`validation.ts` exports:
- `validateNIF(nif)` — must be 11 digits
- `validateRC(rc)` — 9-14 alphanumeric
- `validateNIS(nis)` — 10 digits
- `validateAI(ai)` — 10 digits
- `validateLineItem(item)` — designation required, qty > 0, price > 0 and < 1,000,000 DA
- `validateDocumentBody(body)` — document-level validation
- `validateAuthInput(body, type)` — auth validation with password strength

## Known Limitations / TODOs

1. **Image files are stored as base64 in localStorage** — large logos (>500KB) are rejected in UI but no server-side limit
2. **No image optimization** — base64 data URLs could be large in the PDF HTML
3. **No multi-page PDF support** — if items exceed one A4 page, content overflows
4. **No undo/redo** — every change is immediately applied
5. **generateDocumentHTML uses inline CSS** — hard to maintain, consider a template system
6. **NIF/RC/NIS/AI validation is client-side only** — no server-side validation on save
7. **Custom sections are persisted to API** — but use `POST /api/user/custom-sections` which may fail silently
8. **The editor has no mobile-responsive preview** — the right panel (A4 preview) is hidden on mobile (`hidden lg:flex`)
9. **Items have no total column in add form** — user must do mental math
10. **No price suggestion / catalog** — categories exist but no saved price list

## How to Run Locally

```bash
npm install   # or pnpm install
npx next dev  # starts on localhost:3000
```

Environment variables needed in `.env`:
```
JWT_SECRET=<any-random-string>
DATABASE_URL=<postgres-connection-string>
```

## Build

```bash
npx next build   # TypeScript + Turbopack production build
```

All editor-related files compile under 73 routes. Zero errors expected.
