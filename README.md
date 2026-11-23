# Visitor Photo Slideshow

An interactive web application and live smart display experience where visitors upload photos upon entry, and their photos play seamlessly in a real-time slideshow on smart TVs or venue displays. Returning visitors are recognized automatically, and their previous visits are celebrated alongside new memories.

Designed and crafted using a bespoke record-label visual identity featuring dark aesthetics, refined typography, smooth scroll physics, and rock-solid validation.

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Frontend**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/) (Scroll physics, split-panel portal, dynamic SVG line)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Validation**: [Zod](https://zod.dev/) & Buffer Magic Byte inspection
- **Icons**: [Lucide React](https://lucide.dev/)
- **Test Runner**: [TSX](https://github.com/privatenumber/tsx) & Node.js Native Assertion Suite

---

## Architecture & Panels

The application is structured into specialized panels across a modular architecture:
1. **Visitor Experience (`/`)**: Welcome hero, portal opening scroll experience, SVG interactive journey timeline, returning visitor identity lookup, multi-photo drag-and-drop uploader with live preview, explicit public-broadcast consent, and instant submission confirmation.
2. **Smart TV Slideshow (`/display`)**: Autonomous full-screen kiosk display for smart TVs and large monitors that loops visitor photos with smooth transitions and live polling updates without page refreshes.
3. **Media Streaming (`/api/media/[filename]`)**: Controlled, cached binary media route serving uploaded photos with directory-traversal prevention.

---

## Setup and Run Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v20+ (tested on v22)
- [MongoDB](https://www.mongodb.com/) running locally (`mongodb://localhost:27017/visitor_slideshow`) or a MongoDB Atlas connection string.

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd diwali-assignment-2
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `MONGODB_URI` points to your active MongoDB instance.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Visitor Experience**: [http://localhost:3000](http://localhost:3000)
- **Slideshow Display**: [http://localhost:3000/display](http://localhost:3000/display)

### 4. Run Automated Tests
```bash
npm test
```

### 5. Production Build
```bash
npm run build
npm start
```

---

## Quality & Standards
- **Strict TypeScript**: 0 `any` escapes in core models and routes.
- **Security**: Binary magic-byte analysis rejects spoofed files (e.g., executables or PHP scripts renamed to `.jpg`).
- **Privacy & GDPR Compliance**: Photos require affirmative consent stored with an immutable server timestamp.
- **Accessibility**: Native support for `prefers-reduced-motion` and keyboard navigation.

---

## Project Documentation
- [ASSUMPTIONS.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-2/ASSUMPTIONS.md): Assumptions made and trade-offs analyzed.
- [ARCHITECTURE.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-2/ARCHITECTURE.md): System architecture, data models, and sequence diagram.
- [AI_LOG.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-2/AI_LOG.md): Log of AI prompts, mistake detection, and corrections.
- [AGENT_1_REPORT.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-2/AGENT_1_REPORT.md): Foundation and Visitor Panel completion report.
