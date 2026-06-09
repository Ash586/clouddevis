<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CloudDevis — Project Summary

## Overview
Full-stack invoicing SaaS (Next.js 16, PostgreSQL/Prisma, Tailwind). French primary locale, AR/EN translations in `messages/*.json`. Custom UI components (no external library). Light theme for dashboard/editor, dark Midnight Slate for admin.

## Progress

### ✅ Done
- **NIF/RC/NIS/AI validation**: `src/lib/validation.ts` — `validateNIF` (11 digits), `validateRC` (9-14 alphanum), `validateNIS` (10 digits), `validateAI` (10 digits), `validateDocumentBody`, `validateAuthInput` (password strength), `validateLineItem`
- **Timbre Fiscal**: `src/lib/calculations.ts` — applies to ALL invoices ≥ 10 000 DA, excludes devis
- **Inline validation in editor**: Real-time red border + error on NIF/RC/NIS/AI and client NIF; `validateLineItem` on item add
- **Legal pages**: CGU, Privacy, Mentions Légales at `/legal/*` with shared layout
- **Landing page**: Pricing section with CTA → `/pricing`, 3-column footer (Service, Légal)
- **Draft restoration toast**: "Brouillon restauré ✓" on return from unsaved draft
- **Logo upload**: Base64 (max 500KB), left/right position toggle, shows in preview header + PDF
- **User profile page**: 4 tabs (Info, Preferences, Security, Subscription), GET/PUT API at `/api/user/profile`
- **Editor redesign (v1)**: Section toolbar (Items/Client/Général/Design/Paiement), items-first layout, running total in add form, mobile preview toggle, validation status bar, lighter color scheme
- **Drag & Drop item reordering**: Replaced ▲▼ buttons with HTML5 drag handles (⠿), visual feedback (opacity + highlight), drag-to-reorder
- **Undo/Redo system**: Debounced history (400ms) — tracks state snapshots, Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y, ↩/↪ buttons in top bar
- **Item catalog**: 📦 button opens modal loading items from past 30 documents, click to pre-fill add form
- **Keyboard shortcuts**: Ctrl+S (save), Ctrl+P (PDF), Ctrl+Z (undo), Ctrl+Shift+Z / Ctrl+Y (redo)
- **Saving indicator**: Animated spinner on save button while `saving` is true
- **Customize modal simplified**: 3 groups (Essentiel, Chantier, Avancé) with toggle checkboxes instead of per-section FieldSelector

### 🔄 In Progress
- None

### 📌 Next Steps
1. Push to origin/main when authorized

## Key Decisions
- **Section ID `prestations` forced first** in editor regardless of `sectionOrder`
- **Logo stored as base64 data-URL** in `companyInfo.logo` — persists in localStorage draft
- **`logoPosition` separate field** on `DocumentState`
- **Profile page uses `profile` namespace** — separate from `sidebar`/`common`
- **Editor page**: 671 lines, single `EditorContent` component, `renderSection(id)` switch with 11 cases
- **`useEditor()` hooks**: `useEditorState` + `useEditorActions`

## Relevant Files
- `src/app/dashboard/editor/page.tsx` — 671-line editor
- `src/hooks/useEditorState.ts` — state + localStorage auto-save
- `src/hooks/useEditorActions.ts` — mutations
- `src/lib/calculations.ts` — TVA, timbre fiscal, discount, totals
- `src/lib/validation.ts` — NIF/RC/NIS/AI + item + auth validation
- `src/lib/generateDocumentHTML.ts` — PDF HTML template
- `src/types/index.ts` — interfaces + `SECTION_FIELDS` + `DEFAULT_SECTION_ORDER`
- `src/components/editor/preview/PreviewHeader.tsx` — Logo + company info display
- `src/app/dashboard/profile/page.tsx` — 4-tab profile
- `src/app/api/user/profile/route.ts` — GET/PUT profile API
- `messages/fr.json`, `en.json`, `ar.json` — translations
