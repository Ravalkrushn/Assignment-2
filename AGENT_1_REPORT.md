# AGENT 1 REPORT: VISITOR EXPERIENCE & PROJECT FOUNDATION

**Date:** November 2026  
**Agent:** Agent 1 (Visitor Experience & Shared Foundation)  
**Status:** COMPLETE & VERIFIED

---

## 1. Executive Summary

Agent 1 has successfully scaffolded the foundation of the Visitor Photo Slideshow application, established the design system, data models, file validation, secure image storage abstraction, and developed the complete Visitor Experience (`/`).

All automated tests, TypeScript type checks, and Next.js production builds compile cleanly with zero errors.

---

## 2. Completed Features

### Shared Foundation
- **Database Connection Layer (`src/lib/db.ts`)**: Cached Mongoose connection for Next.js App Router serverless and Node runtimes with auto-reconnect and pool optimization.
- **Data Models**:
  - `Visitor` (`src/models/Visitor.ts`): Stores visitor identity, full name, original email, normalized email with unique indexing, first created timestamp, and last visit timestamp.
  - `Photo` (`src/models/Photo.ts`): Stores visitor reference (`visitorId`), image URL, original filename, detected MIME type, file size in bytes, consent flag, immutable consent timestamp, uploaded timestamp, and display status (`active` | `archived` | `flagged`).
- **Image Storage Abstraction (`src/lib/storage.ts`)**: Pluggable storage provider (`LocalStorageProvider`) storing binary image files outside static source folders in `/uploads` with collision-resistant UUID naming and path traversal protection.
- **Deep File Validation (`src/lib/validations/upload.ts`)**:
  - File extension verification (`.jpg`, `.jpeg`, `.png`, `.webp`).
  - Size limitation (10MB max per file, configurable via `MAX_FILE_SIZE_BYTES`).
  - File count limitation (5 files max per submission, configurable via `MAX_FILES_COUNT`).
  - Binary magic byte validation: inspects file header bytes (`FF D8 FF` for JPEG, `89 50 4E 47` for PNG, `RIFF...WEBP` for WebP) to prevent disguised scripts/binaries.
- **Controlled Media Streaming (`/api/media/[filename]`)**:
  - Securely streams stored images with proper `Content-Type` headers.
  - Aggressive caching (`Cache-Control: public, max-age=31536000, immutable`) for instantaneous Smart TV slideshow streaming.
  - Blocks directory traversal attacks.

### Visitor Panel (`/`)
- **Welcome Hero**:
  - Aesthetic record-label inspired dark theme.
  - Headline: *"Every Visit Leaves a Story."*
  - CTA button with smooth scroll navigation to the submission portal.
  - Live broadcast status indicators.
- **Portal Opening Scroll Animation (`PortalOpeningSection`)**:
  - Two split panels meet at the center on initial viewport view.
  - Scroll progress moves panels apart in opposite directions revealing background archival imagery.
  - Wordmark emblem scales up while letter spacing tightens.
  - Fully driven by scroll position (reverses cleanly when scrolling up).
- **SVG Journey Connector (`SvgJourneyConnector`)**:
  - Dynamic SVG timeline connecting the 4 visit stages:
    1. Your Information
    2. Upload Photos
    3. Give Consent
    4. Complete Visit
  - Real-time `pathLength` interpolation synchronized with viewport scroll percentage.
  - Mobile-responsive step timeline fallback.
- **Visitor Form & Multi-Photo Dropzone (`VisitorForm`)**:
  - Real-time returning visitor identification: queries `/api/visitor/lookup?email=...` on email blur/input.
  - Returning visitor welcome banner: greets returning visitors by name, displays their past photo count, and notifies them that new uploads will join their retrospective collection.
  - Multi-file drag and drop uploader with thumbnail previews, file size indicators, and one-click removal.
  - Strict consent enforcement: explicit checkbox with public display acknowledgment and automated consent timestamp recording.
  - Interactive upload progress bar with instant feedback.
- **Submission Confirmation View (`UploadSuccessView`)**:
  - Instant confirmation display with status badge ("Live in Queue").
  - Displays uploaded photo previews.
  - For returning visitors, showcases recent photos from previous visits alongside newly uploaded photos.
  - "Upload More Photos" button for quick follow-up uploads.

---

## 3. Installed Dependencies

### Production Dependencies
- `next`: `14.2.15` (App Router)
- `react`: `^18.3.1`
- `react-dom`: `^18.3.1`
- `mongoose`: `^8.7.1` (MongoDB ODM)
- `framer-motion`: `^11.11.9` (Scroll animations, portal split, SVG path length)
- `lucide-react`: `^0.453.0` (Iconography)
- `zod`: `^3.23.8` (Data validation)
- `clsx` & `tailwind-merge`: Class merging utilities
- `sharp`: Image processing
- `file-type`: MIME type verification

### Developer Dependencies
- `typescript`: `^5.6.3`
- `tailwindcss`: `^3.4.14`
- `postcss`: `^8.4.47`
- `autoprefixer`: `^10.4.20`
- `tsx`: `^4.19.2` (TypeScript test and script execution)
- `@types/node`, `@types/react`, `@types/react-dom`

---

## 4. Files Created & Modified

```
diwali-assignment-2/
├── .env.example                               # Environment variable blueprint
├── .gitignore                                 # Git ignore configuration
├── package.json                               # Dependencies and scripts
├── tsconfig.json                              # TypeScript configuration
├── next.config.mjs                            # Next.js configuration
├── tailwind.config.ts                         # Custom color palette and font tokens
├── postcss.config.mjs                         # PostCSS setup
├── uploads/                                   # Local image storage folder (.gitkeep)
├── scripts/
│   ├── test-validation.ts                     # Unit tests for validation, schema, magic bytes
│   └── test-storage.ts                        # Storage abstraction unit tests
└── src/
    ├── types/
    │   └── index.ts                           # Shared TypeScript interfaces (IVisitor, IPhoto, API responses)
    ├── lib/
    │   ├── db.ts                              # Mongoose connection with cache
    │   ├── storage.ts                         # LocalStorageProvider abstraction
    │   ├── utils.ts                           # cn, normalizeEmail, formatBytes
    │   └── validations/
    │       └── upload.ts                      # Zod schema, magic byte analyzer, size checks
    ├── models/
    │   ├── Visitor.ts                         # Visitor Mongoose schema
    │   └── Photo.ts                           # Photo Mongoose schema
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx                     # Reusable themed button component
    │   │   └── Input.tsx                      # Reusable input field with error states
    │   └── visitor/
    │       ├── WelcomeHero.tsx                # Hero section with Start button
    │       ├── PortalOpeningSection.tsx       # Scroll-driven split portal animation
    │       ├── SvgJourneyConnector.tsx        # Scroll-driven SVG progress line
    │       ├── VisitorForm.tsx                # Form, email lookup, dropzone, consent
    │       └── UploadSuccessView.tsx          # Post-upload confirmation and gallery
    └── app/
        ├── layout.tsx                         # Root layout with Syne and Sora typography
        ├── globals.css                        # Design system tokens and global styles
        ├── page.tsx                           # Visitor page (main route /)
        └── api/
            ├── visitor/
            │   ├── upload/route.ts            # POST /api/visitor/upload
            │   └── lookup/route.ts            # GET /api/visitor/lookup?email=...
            └── media/
                └── [filename]/route.ts        # GET /api/media/[filename]
```

---

## 5. Database Models Specification

### `Visitor`
Collection: `visitors`
```typescript
interface IVisitorDocument {
  name: string;             // Visitor's display name
  email: string;            // Original entered email address
  normalizedEmail: string;  // Trimmed, lowercase email (UNIQUE INDEX)
  createdAt: Date;          // First visit timestamp
  lastVisitAt: Date;        // Most recent visit timestamp
}
```

### `Photo`
Collection: `photos`
```typescript
interface IPhotoDocument {
  visitorId: ObjectId;      // Reference to Visitor document (INDEXED)
  imageUrl: string;         // Controlled route e.g. "/api/media/<filename>"
  originalName: string;     // Original filename uploaded by user
  mimeType: string;         // e.g. "image/jpeg", "image/png", "image/webp"
  size: number;             // File size in bytes
  consentGiven: boolean;    // Must be true for public display
  consentTimestamp: Date;   // Timestamp when consent was given
  uploadedAt: Date;         // Timestamp of upload (INDEXED)
  displayStatus: "active" | "archived" | "flagged"; // default: "active"
}
```

---

## 6. API Contracts for Agent 2 & Agent 3

### A. Media Stream Endpoint
- **Endpoint:** `GET /api/media/[filename]`
- **Purpose:** Securely stream image bytes with cache headers.
- **Consumption:** Use the `imageUrl` field stored on `Photo` directly in `<img>` or Next.js `<Image>`.

### B. Visitor Lookup Endpoint
- **Endpoint:** `GET /api/visitor/lookup?email=<email>`
- **Query Params:** `email` (string)
- **Response:**
  ```json
  {
    "exists": true,
    "visitor": {
      "id": "6741b...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "lastVisitAt": "2026-11-24T02:00:00.000Z",
      "photoCount": 4,
      "recentPhotos": [
        {
          "id": "6741c...",
          "imageUrl": "/api/media/1732400000-abc.jpg",
          "uploadedAt": "2026-11-24T02:00:00.000Z"
        }
      ]
    }
  }
  ```

### C. Visitor Upload Endpoint
- **Endpoint:** `POST /api/visitor/upload`
- **Payload:** `multipart/form-data`
  - `name`: string
  - `email`: string
  - `consentGiven`: "true"
  - `photos`: binary file attachments (up to 5)
- **Response:** Returns status 201 with created photo list and visitor status.

---

## 7. Instructions for Agent 2 (Live Slideshow Experience)
1. **Querying Photos for the Slideshow**:
   - Query `Photo.find({ displayStatus: "active", consentGiven: true })`.
   - Sort by `uploadedAt: -1` to prioritize latest visits or loop through chronological rotation.
   - Populate `visitorId` to obtain the visitor's name: `Photo.find(...).populate('visitorId', 'name')`.
2. **Returning Visitors in Slideshow**:
   - When a returning visitor uploads new photos, fetch their previous photos using `{ visitorId: visitor._id, displayStatus: 'active' }` so they can be grouped or highlighted during their visit sequence.
3. **Display Route**:
   - Implement your slideshow on `/display`.
   - Fetch photos via your `/api/slideshow` route using polling or SWR.

---

## 8. Instructions for Agent 3 (Admin Dashboard)
1. **Managing Visitors & Photos**:
   - Query `Visitor.find()` to display all visitors and visit frequency.
   - Moderate photos by updating `displayStatus` on the `Photo` model (`"active"` -> `"flagged"` or `"archived"`).
   - Any photo with `displayStatus !== "active"` is automatically filtered out by Agent 2's slideshow.
2. **Safe Deletion**:
   - Use `storageProvider.delete(filename)` to clean up binary storage when photos are permanently purged.

---

## 9. Build and Test Verification Results

### Unit & Validation Tests (`npm test`)
- `scripts/test-validation.ts`:
  - Email normalization: PASSED
  - Byte formatting: PASSED
  - Zod form validation (name, email, mandatory consent): PASSED
  - Magic byte binary checks (JPEG, PNG, WebP vs malicious scripts/binaries): PASSED
- `scripts/test-storage.ts`:
  - Binary saving to disk: PASSED
  - Secure filename generation: PASSED
  - Controlled path URL generation: PASSED
  - Traversal attack protection: PASSED
  - Retrieval and deletion: PASSED

### Production Build (`npm run build`)
```
Route (app)                              Size     First Load JS
┌ ○ /                                    23.7 kB         149 kB
├ ○ /_not-found                          873 B            88 kB
├ ƒ /api/media/[filename]                0 B                0 B
├ ƒ /api/slideshow                       0 B                0 B
├ ƒ /api/visitor/lookup                  0 B                0 B
├ ƒ /api/visitor/upload                  0 B                0 B
└ ○ /display                             8.83 kB         134 kB
+ First Load JS shared by all            87.1 kB

✓ Compiled successfully
✓ Generating static pages (5/5)
✓ Finalizing page optimization
```
TypeScript compilation (`npx tsc --noEmit`): **0 errors**.
Production build: **EXIT CODE 0**.
