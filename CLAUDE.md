# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture Overview

This is a Next.js 14 app using App Router for displaying personal links fetched from Google Sheets. Key architectural decisions:

### Data Flow
1. **Google Sheets as CMS**: Links data is stored in a Google Sheet (ID: `1fUTNdJZBr1HiPYguoT1SPnbG_2xz1QSJ-78NQvvqgzQ`)
2. **Server-side caching**: Data is cached for 24 hours using `node-cache` to minimize API calls
3. **Manual cache refresh**: Available via `/api/refreshSheetData` endpoint

### API Endpoints
- `/api/subscribe`: Handles newsletter signups with Listmonk integration
- `/api/refreshSheetData`: Clears the Google Sheets cache
- `/api/og`: Generates dynamic Open Graph images

### Styling Approach
- Tailwind CSS with extensive color safelist in `tailwind.config.ts`
- Theme support via `next-themes` with system preference detection
- Custom animations defined in Tailwind config

### Component Patterns
- Server components by default in `/app` directory
- Client components marked with `'use client'` for interactivity
- Shadcn/ui components in `/components/ui` for consistent design

### Newsletter Integration
The app recently migrated from Bento to Listmonk for newsletter management. The integration uses token authentication with the format `username:token`.

### Environment Variables
Critical environment variables that must be set:
- `LISTMONK_API_URL`: Your Listmonk instance URL
- `LISTMONK_API_USERNAME`: API user from Listmonk
- `LISTMONK_API_TOKEN`: API token from Listmonk  
- `LISTMONK_LIST_IDS`: Comma-separated numeric list IDs (e.g., "1,2,3")
- `NEXT_PUBLIC_MINIMAL_MODE`: Toggle for simplified UI
- `NEXT_PUBLIC_BENTO_SITE_ID`: Legacy Bento analytics (to be removed)

### Special Features
- **Terminal-style signup**: Uses `typed.js` for typewriter effect
- **Audio feedback**: Success/fail sounds in `/public/audio/`
- **Custom icons**: Supports mask-based custom icons for links
- **Acquired labels**: Special styling for acquired projects

## Important Context

- The app uses both App Router (`/app`) and Pages Router (`/pages/api`) patterns
- Google Sheets data structure includes links with title, url, description, icon, and optional acquired status
- Icons can be from Lucide React, Radix UI, or custom mask URLs
- Dark mode colors are inverted (green on black in dark mode)