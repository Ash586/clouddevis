<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CloudDevis — Project Summary

## Overview
Full-stack invoicing SaaS (Next.js 16, PostgreSQL/Prisma, Tailwind). French primary locale, AR/EN translations in `messages/*.json`. Custom UI components (no external library). Light theme for dashboard/editor, dark Midnight Slate for admin.

## Android App (WebView + JS Bridge)
Replaced Capacitor with a lightweight WebView app. The Android project lives in `android/` and loads `https://clouddevis.vercel.app/app` in a WebView.

### JS Bridge (`window.AndroidBridge`)
Available methods:
- `downloadFile(base64, fileName)` — Save file via DownloadManager
- `shareFile(base64, fileName, title)` — Share via Intent.ACTION_SEND
- `downloadFileDirect(base64, fileName, mimeType)` — Open file with default viewer
- `vibrate(ms)` — Haptic feedback
- `setStatusBarColor(hex)` — Change status bar color
- `setNavigationBarColor(hex)` — Change navigation bar color
- `exitApp()` — Close the app
- `goBack()` — Navigate back
- `isOnline()` — Check network status
- `getAppVersion()` — Get app version string
- `getPlatform()` — Returns "android"
- `copyToClipboard(text)` — Copy text to clipboard
- `openUrl(url)` — Open URL in external browser
- `setKeepScreenOn(bool)` — Keep screen on/off
- `getDeviceInfo()` — Get device model/brand/SDK info
- `onBackPressed` — Callback invoked when back button is pressed (via web inject)
- `onAppStateChange(isActive)` — Callback for foreground/background state changes

### What was removed (Capacitor)
- 19 npm dependencies (@capacitor/*, @aparajita/*, @capacitor-community/*)
- 6 npm scripts (mobile:sync, mobile:android, mobile:ios, mobile:dev, mobile:dev-device, mobile:prod)
- `capacitor.config.ts`, `scripts/cap-dev.mjs`
- `android/capacitor-cordova-android-plugins/`, `android/capacitor.settings.gradle`, `android/app/capacitor.build.gradle`
- All Capacitor assets from `android/app/src/main/assets/`

### What was lost (no WebView equivalent)
- Push Notifications (FCM) — needs Firebase SDK + JS Interface
- Biometric Auth — needs BiometricPrompt JS Interface
- Offline SQLite — needs IndexedDB (web alternative)
- Native Preferences — falls back to localStorage
- Native Filesystem — falls back to Cache API + DownloadManager

## Progress

### ✅ Done
- **WebView Android app**: `android/app/src/main/java/com/clouddevis/app/MainActivity.java` — WebView + JS Bridge with 16 methods
- **Removed Capacitor**: Cleaned 19 dependencies, 6 scripts, Capacitor config files
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
2. Add Push Notifications via Firebase + JS Interface (if needed)
3. Add Biometric Auth via BiometricPrompt JS Interface (if needed)

### 🔧 Recent Fixes
- Fixed 6 ESLint errors: moved `TaxRow` component outside render in `PreviewDevis.tsx`, escaped apostrophes in `PreviewAttachement.tsx`
- Added `companyInfo` field to Document model for logo/signature persistence
- Updated document API to save/load `companyInfo` (including logo) with Base64 data
- **Removed duplicate "Nouveau Devis" button** from dashboard header (redundant with Quick Create section)
- **Replaced Capacitor with WebView + JS Bridge** (this session)

## Key Decisions
- **Section ID `prestations` forced first** in editor regardless of `sectionOrder`
- **Logo stored as base64 data-URL** in `companyInfo.logo` — persists in localStorage draft
- **`logoPosition` separate field** on `DocumentState`
- **Profile page uses `profile` namespace** — separate from `sidebar`/`common`
- **Editor page**: 671 lines, single `EditorContent` component, `renderSection(id)` switch with 11 cases
- **`useEditor()` hooks**: `useEditorState` + `useEditorActions`
- **Android app**: WebView + JS Bridge instead of Capacitor (simpler, lighter, faster builds)

## Relevant Files
- `android/app/src/main/java/com/clouddevis/app/MainActivity.java` — WebView + JS Bridge (main Android file)
- `android/app/src/main/res/layout/activity_main.xml` — WebView + ProgressBar layout
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
