# ARCHITECTURE & SYSTEM DESIGN

## 1. Technology Stack Choice & Rationale

| Layer | Technology | Rationale |
|---|---|---|
| **Full-Stack Framework** | **Next.js 14 (App Router)** | Unified full-stack architecture with React Server Components, high-performance API Route Handlers, automatic code splitting, and zero-configuration SSR. |
| **Language** | **TypeScript** | End-to-end type safety across shared database models, API payloads, form schemas, and UI components. Eliminates runtime contract mismatches between Agent 1, Agent 2, and Agent 3. |
| **Database** | **MongoDB & Mongoose** | Flexible document model ideally suited for visitor profiles, polymorphic photo metadata, and relationship linking with fast query indexing. |
| **Styling & Design Tokens** | **Tailwind CSS** | Utility-first styling with custom record-label theme tokens (`#0A0C0E` background, `#EDE7DC` primary text, `#E8913C` amber, `#2E6B72` teal, and hairline borders). |
| **Animations** | **Framer Motion** | Physics-based animations, scroll progress hooks (`useScroll`), reversible viewport portal opening, and dynamic SVG `pathLength` drawing. |
| **File Validation** | **Zod & Binary Magic Bytes** | Multi-tier defense validating input structure via Zod and inspecting binary file headers to block disguised executables and malicious files. |
| **Storage Abstraction** | **LocalStorageProvider (`IStorageProvider`)** | Modular storage interface serving files via controlled media routes with long-term HTTP cache headers. |

---

## 2. System Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer["Client Layer (Displays & Devices)"]
        VisitorDevice["📱 Visitor Smartphone / Browser\nRoute: /"]
        SmartTV["📺 Smart TV / Large Screen\nRoute: /display"]
    end

    subgraph AppLayer["Next.js Application Layer"]
        subgraph VisitorPanel["Visitor Experience (Agent 1)"]
            Hero["Welcome Hero"]
            Portal["Portal Opening Scroll Animation"]
            Journey["SVG Journey Timeline"]
            Form["Upload & Consent Form"]
            LookupAPI["/api/visitor/lookup"]
            UploadAPI["/api/visitor/upload"]
        end

        subgraph SlideshowPanel["Live Slideshow (Agent 2)"]
            DisplayView["Cinematic Fullscreen Player"]
            SlideshowAPI["/api/slideshow"]
        end

        subgraph SharedServices["Shared Infrastructure (Agent 1)"]
            MediaRoute["/api/media/[filename]"]
            Storage["IStorageProvider (Local Disk / S3)"]
            Validation["Zod Schema & Magic Byte Checker"]
            DBConn["Mongoose Cached Connection"]
        end
    end

    subgraph DataLayer["Storage Layer"]
        MongoDB[(MongoDB Database\nVisitors & Photos)]
        UploadStorage[("Binary Disk Storage\n/uploads")]
    end

    %% Visitor Flow
    VisitorDevice -->|"1. Types Email"| LookupAPI
    LookupAPI -->|"2. Check normalized email"| MongoDB
    VisitorDevice -->|"3. Submits Photos & Consent"| UploadAPI
    UploadAPI -->|"4. Validates bytes & schema"| Validation
    UploadAPI -->|"5. Saves binary file"| Storage
    Storage --> UploadStorage
    UploadAPI -->|"6. Upserts Visitor & Photos"| MongoDB

    %% Slideshow Flow
    SmartTV -->|"A. Polls live photos"| SlideshowAPI
    SlideshowAPI -->|"B. Query active photos"| MongoDB
    SmartTV -->|"C. Streams image buffer"| MediaRoute
    MediaRoute --> Storage
```

---

## 3. Data Model

### A. Visitor Entity (`visitors` collection)
```typescript
{
  _id: ObjectId,
  name: string,             // Full name
  email: string,            // Raw email address
  normalizedEmail: string,  // Lowercase trimmed email [UNIQUE INDEX]
  createdAt: Date,          // Initial visit date
  lastVisitAt: Date         // Most recent visit date
}
```

### B. Photo Entity (`photos` collection)
```typescript
{
  _id: ObjectId,
  visitorId: ObjectId,      // Reference to Visitor [INDEXED]
  imageUrl: string,         // Stream URL: "/api/media/<filename>"
  originalName: string,     // Original filename
  mimeType: string,         // Detected MIME type ("image/jpeg", "image/png", "image/webp")
  size: number,             // File size in bytes
  consentGiven: boolean,    // Explicit consent agreement
  consentTimestamp: Date,   // Immutable timestamp of consent
  uploadedAt: Date,         // Upload timestamp [INDEXED]
  displayStatus: string     // "active" | "archived" | "flagged" [INDEXED]
}
```

---

## 4. Sequence Diagram: Visitor Upload & Smart Display Sync

```mermaid
sequenceDiagram
    autonumber
    actor Visitor as Visitor
    participant Browser as Visitor Device (/)
    participant API as Upload Route (/api/visitor/upload)
    participant Storage as Storage Provider
    participant DB as MongoDB
    actor Display as Smart TV (/display)

    Visitor->>Browser: Enters Name & Email
    Browser->>API: GET /api/visitor/lookup?email=...
    API->>DB: Find by normalizedEmail
    DB-->>API: Return existing records (if any)
    API-->>Browser: Visitor recognized status + photo history

    Visitor->>Browser: Selects photos & checks consent
    Visitor->>Browser: Clicks "Upload & Play on Screen"
    Browser->>API: POST multipart FormData (Name, Email, Consent, Files)

    API->>API: Verify Zod schema & consent boolean
    API->>API: Check binary magic bytes (JPEG/PNG/WebP)
    API->>Storage: save(Buffer, filename, mimeType)
    Storage-->>API: Saved as /api/media/{timestamp}-{uuid}.jpg
    
    API->>DB: Upsert Visitor & Create Photo documents (displayStatus: 'active')
    DB-->>API: Confirmed
    API-->>Browser: 201 Created (Success & Preview data)
    Browser-->>Visitor: Displays confirmation & TV queue notification

    loop Every 5 Seconds
        Display->>DB: GET /api/slideshow (query active photos)
        DB-->>Display: Return active photos (including new upload)
        Display->>Display: Transitions to newly uploaded visitor photo
    end
```
