# ASSUMPTIONS & DESIGN DECISIONS

This document details all assumptions made during the design and development of the Visitor Photo Slideshow application, along with the reasoning behind each choice.

---

## 1. Returning Visitor Identification
- **Assumption**: Returning visitors are identified uniquely through their **normalized email address** (`email.trim().toLowerCase()`).
- **Why this was chosen**:
  - Facial recognition introduces substantial privacy risks, GDPR/biometric compliance overhead, and variable hardware camera dependencies.
  - Names alone are not unique (e.g. multiple people named "Alex Smith").
  - Phone numbers can be prone to country code formatting discrepancies.
  - Email addresses are globally unique, low friction, easily verified, and standard across event check-ins.
  - To prevent duplicates caused by casing or accidental whitespace (e.g. `John@example.com` vs `john@example.com`), all emails are normalized before indexing and comparison.

---

## 2. Privacy & Public Display Consent
- **Assumption**: Photos are displayed publicly on smart screens throughout the venue; therefore, consent must be **explicit, informed, and mandatory** prior to upload.
- **Why this was chosen**:
  - Passive or implied consent violates privacy best practices.
  - The upload form requires an affirmative checkbox acknowledgment clearly explaining that photos and names will be displayed publicly.
  - The server records an immutable `consentTimestamp` and boolean `consentGiven: true` alongside every photo record in MongoDB.
  - Any request submitted without explicit consent is rejected with HTTP 400.

---

## 3. Immediate Display vs. Admin Approval
- **Assumption**: In accordance with the prompt ("As soon as an upload completes, the photo plays in a slideshow... No manual admin approval should be required"), newly uploaded valid photos receive `displayStatus: "active"` and enter the display queue immediately.
- **Why this was chosen**:
  - An event or exhibition visitor expects instant gratification upon upload.
  - However, to protect against malicious uploads, we pair immediate display with:
    1. Strict magic byte header validation (rejecting non-image payloads).
    2. File size caps (10MB) and file count caps (5 files per submission).
    3. An administrative display status field (`displayStatus: "active" | "archived" | "flagged"`) allowing staff to instantly take down any inappropriate photo via Agent 3's moderation panel.

---

## 4. Image Storage Architecture
- **Assumption**: For local development and demonstrations, images are stored in a dedicated `/uploads` directory on disk outside the Next.js static asset folder, served through a controlled API route (`/api/media/[filename]`).
- **Why this was chosen**:
  - Storing uploaded media directly inside the `/public` repository directory pollutes source control, exposes files to unauthenticated directory enumeration, and requires rebuilding static assets.
  - A controlled route allows setting security headers (`Cache-Control`, `Content-Disposition`, MIME type enforcement) and verifying file existence.
  - The storage is decoupled via the `IStorageProvider` interface (`src/lib/storage.ts`), making it effortless to swap with AWS S3, Cloudinary, or Google Cloud Storage in production without altering application logic.

---

## 5. Real-Time Slideshow Updates
- **Assumption**: The smart display fetches new photos using lightweight background polling (every 5 seconds) rather than high-overhead bidirectional WebSockets.
- **Why this was chosen**:
  - Smart TVs often run lightweight or outdated web browsers with flaky WebSocket support and connection drops.
  - Slideshow changes happen on the order of seconds (display duration is 5-6 seconds per photo).
  - Background REST polling of `/api/slideshow` with `If-Modified-Since` or lightweight timestamp queries is resilient, auto-reconnecting, memory-safe, and requires zero stateful socket infrastructure.

---

## 6. Returning Visitor Photo Playback
- **Assumption**: When a returning visitor submits new photos, the slideshow prioritizes their newly uploaded photo, then includes their previous approved photos in their playback rotation.
- **Why this was chosen**:
  - Directly fulfills the requirement: *"If the person is visiting again, the slideshow also plays their previous photos."*
  - Provides a celebratory, personalized experience that showcases the visitor's history at the venue.
