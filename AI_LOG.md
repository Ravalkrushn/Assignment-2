# AI LOG: PROMPTS, DECISIONS & MISTAKE RECTIFICATIONS

This log records key AI interactions, decisions, architectural choices, and two specific instances where the AI generated incorrect configurations, how the issues were diagnosed, and how they were resolved.

---

## Key AI Prompts & Directives

### Prompt 1: Project Foundation & Architecture Setup
- **Goal:** Initialize Git, configure Next.js 14 App Router with TypeScript, Tailwind CSS, Mongoose connection pooling, and storage abstractions.
- **Outcome:** Clean project structure established adhering strictly to the record-label design palette (`#0A0C0E`, `#101317`, `#EDE7DC`, `#E8913C`, `#2E6B72`).

### Prompt 2: Robust Binary File Validation & Storage
- **Goal:** Implement secure upload handling that does not blindly trust browser-reported MIME types.
- **Outcome:** Created `validateImageMagicBytes` in `src/lib/validations/upload.ts` inspecting the first 12 bytes of uploaded buffers to verify actual JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), and WebP (`RIFF...WEBP`) file headers.

### Prompt 3: Visitor Experience & Scroll-Driven Portal
- **Goal:** Implement the Visitor Panel with scroll-driven portal opening animations and SVG timeline connection.
- **Outcome:** Built `PortalOpeningSection` and `SvgJourneyConnector` using Framer Motion's `useScroll` and `useTransform` hooks, ensuring reversible scroll mechanics.

### Prompt 4: Live Smart TV Slideshow
- **Goal:** Develop the full-screen Smart TV Slideshow (`/display`) with ambient blurred backdrops, delta polling, and returning visitor badges.
- **Outcome:** Built `useSlideshow`, `SlideshowView`, and non-disruptive 4-second polling delta synchronization.

### Prompt 5: Admin Dashboard & Security Governance
- **Goal:** Build the complete Admin Dashboard (`/admin`), server-side authentication, photo moderation gallery, visitor directory, persistent settings synchronization, and consent logs.
- **Outcome:** Delivered secure dashboard with HMAC-SHA256 session tokens, timing-safe credential verification, full moderation capabilities, and persistent MongoDB settings.

---

## Documented AI Mistakes & Corrections

### Case 1: Next.js Google Font Loader Webpack Crash
- **The Mistake:**
  The AI configured `next/font/google` in `src/app/layout.tsx` specifying array weights for the `Syne` font:
  ```typescript
  const syne = Syne({
    subsets: ["latin"],
    weight: ["600", "700", "800"],
    variable: "--font-syne",
  });
  ```
  During `npm run build`, Next.js 14 failed with:
  ```
  TypeError: Cannot read properties of null (reading '1')
      at nextFontGoogleFontLoader (node_modules/next/dist/compiled/@next/font/dist/google/loader.js:112:78)
  ```
  Additionally, in the air-gapped sandboxed build environment without live outbound internet access, `next/font/google` failed repeatedly to fetch stylesheets from Google Fonts CDN during build-time.
- **How It Was Noticed:**
  The error was captured in task logs during `npm run build` where Webpack compilation failed on the font loader stage.
- **How It Was Fixed:**
  1. Removed the brittle `next/font/google` build-time dependency from `layout.tsx`.
  2. Declared font imports cleanly via CSS `@import url(...)` in `src/app/globals.css` with fallbacks and preconnect tags in `layout.tsx`.
  3. Bound `--font-syne` and `--font-sora` directly in `tailwind.config.ts`.
  4. Subsequent production builds (`npm run build`) succeeded with exit code 0.

---

### Case 2: Incompatible Buffer Type in Route Handler NextResponse
- **The Mistake:**
  In `src/app/api/media/[filename]/route.ts`, the AI attempted to return a Node `Buffer` directly inside the Web Fetch `NextResponse`:
  ```typescript
  const fileBuffer = await storageProvider.get(filename);
  return new NextResponse(fileBuffer, { status: 200, ... });
  ```
- **How It Was Noticed:**
  Running `npx tsc --noEmit` caught a TypeScript error:
  ```
  src/app/api/media/[filename]/route.ts(41,29): error TS2345: Argument of type 'Buffer<ArrayBufferLike>' is not assignable to parameter of type 'BodyInit | null | undefined'.
    Type 'Buffer<ArrayBufferLike>' is missing the following properties from type 'URLSearchParams': size, append, delete, get, and 2 more.
  ```
- **How It Was Fixed:**
  Node `Buffer` instances in App Router route handlers must be converted to standard web `Uint8Array` to satisfy the `BodyInit` type interface:
  ```typescript
  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": fileBuffer.length.toString(),
    },
  });
  ```
  Running `npx tsc --noEmit` confirmed 0 TypeScript errors.

---

### Case 3: Duplicate Mongoose Index Warning
- **The Mistake:**
  In `src/models/Visitor.ts`, `normalizedEmail` was defined with both inline `index: true` and an explicit compound unique index:
  ```typescript
  normalizedEmail: {
    type: String,
    index: true
  }
  VisitorSchema.index({ normalizedEmail: 1 }, { unique: true });
  ```
- **How It Was Noticed:**
  During Next.js static page generation, Mongoose logged:
  ```
  (node:10828) [MONGOOSE] Warning: Duplicate schema index on {"normalizedEmail":1} found.
  ```
- **How It Was Fixed:**
  Removed the redundant inline `index: true` from the field definition, preserving only the explicit unique index to ensure email uniqueness without duplicate overhead.
