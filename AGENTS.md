<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CloudDevis — Project Summary

## Overview
Full-stack invoicing SaaS (Next.js 16, PostgreSQL/Prisma, Tailwind). French primary locale, AR/EN translations in `messages/*.json`. Custom UI components (no external library). Light theme for dashboard/editor, dark Midnight Slate for admin.

## Project Skills (Slash Commands)

Custom Claude Code skills live in `.claude/commands/`. Invoke them by typing `/skill-name` in a **new terminal Claude Code session** (they are loaded at session start).

| Command | File | Purpose |
|---|---|---|
| `/ui` | `.claude/commands/ui.md` | Front-End / UX Architect — UX critique before code, RTL/Arabic UI rules, mobile UX (44px targets, bottom sheets, safe area). Use for dashboard redesigns, editor improvements, new components. |
| `/dgi` | `.claude/commands/dgi.md` | DGI/Tax Compliance Expert — Timbre Fiscal, TVA 19%, NIF/NIS/RC/AI rules, G50 compliance. Use to verify invoice logic, audit field requirements, answer "is this legal?" questions. |
| `/backend` | `.claude/commands/backend.md` | Prisma/PostgreSQL Architect — safe migrations, ACID transactions, N+1 detection, ownership checks. Use for schema changes, query optimization, new API routes. |
| `/mobile` | `.claude/commands/mobile.md` | Capacitor/Android Specialist — WebView constraints, touch UX, safe area insets, Capacitor plugin bridging. Use for mobile-specific bugs and hybrid app flows. |
| `/editor-dev` | `.claude/commands/editor-dev.md` | Document Editor Specialist — `useEditorState`, `useEditorActions`, undo/redo, drag-and-drop, preview sync, PDF generation. Use for all editor feature work. |
| `/devops` | `.claude/commands/devops.md` | DevOps/Infrastructure — Vercel deploy, Neon pooling, CSP headers, Sentry, environment variables. Includes critical: Vercel build does NOT run migrations. |
| `/support` | `.claude/commands/support.md` | Bilingual FR/AR Customer Support — professional email responses, help center articles, DGI questions in plain language, pricing objection handling. |
| `/marketer` | `.claude/commands/marketer.md` | B2B Digital Marketer — Algerian SMB SEO (FR+AR keywords), Facebook/Instagram ads, landing page copy, blog articles on digital invoicing. |
| `/b2b-data` | `.claude/commands/b2b-data.md` | Data Analyst & B2B Sales — SaaS KPIs (MRR/churn/LTV), usage metric analysis, enterprise partnership proposals, pricing strategy for Algerian market. |
| `/security` | `.claude/commands/security.md` | Security Auditor — OWASP Top 10, auth/ownership review, AES-GCM encryption, CSP hardening, rate limiting. Response format: severity + attack scenario + fix. |
| `/i18n` | `.claude/commands/i18n.md` | Translation Specialist — FR/AR/EN, Algerian business terminology, ICU pluralization, RTL layout rules, missing-key detection. Always outputs all 3 languages at once. |
| `/qa` | `.claude/commands/qa.md` | QA/Testing Engineer — boundary-value tests for financial calculations, Timbre Fiscal thresholds, NIF validation, Jest test patterns. Prioritizes compliance-critical functions. |

## Progress

### ✅ Done
- **NIF/RC/NIS/AI validation**: `src/lib/validation.ts` — `validateNIF` (11 digits), `validateRC` (9-14 alphanum), `validateNIS` (10 digits), `validateAI` (10 digits), `validateDocumentBody`, `validateAuthInput` (password strength), `validateLineItem`
- **Timbre Fiscal**: `src/lib/calculations.ts` — applies to ALL invoices ≥ 10 000 DA, excludes devis
- **Inline validation in editor**: Real-time red border + error on NIF/RC/NIS/AI and client NIF; `validateLineItem` on item add
- **Legal pages**: CGU, Privacy, Mentions Légales at `/legal/*` with shared layout
- **Landing page**: Pricing section with CTA → `/pricing`, 3-column footer (Service, Légal)
- **Draft restoration toast**: "Brouillon restauré ✓" on return from unsaved draft
- **Logo upload**: Base64 (max 500KB), left/right position toggle, persists to document via `companyInfo` field
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

### 🔧 Recent Fixes
- Fixed 6 ESLint errors: moved `TaxRow` component outside render in `PreviewDevis.tsx`, escaped apostrophes in `PreviewAttachement.tsx`
- Added `companyInfo` field to Document model for logo/signature persistence
- Updated document API to save/load `companyInfo` (including logo) with Base64 data

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
