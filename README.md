# Goodplays

Goodplays is a video game tracking/review app inspired by Goodreads and Letterboxd. 
Users can discover games, save games to their personal library, update play status, and manage their backlog.

This is a full-stack application using Next.js, PostgreSQL, Prisma, Auth.js/NextAuth, and the IGDB API.

---

## Project Overview

Goodplays helps users keep track of what they are playing as well as tracking what they may play next

The core loop is...

1. Discover games through search or through the front page
2. View game details
3. Add games to a personal library
4. Track each game by status:
   - Backlog - Plan to play
   - Playing - Currently playing
   - Completed - Finished playing
   - Dropped - Stopped playing (Didn't finish)

---

## Current Features

### Authentication
- GitHub OAuth login
- Persistent user sessions
- Personal library page

### Game Discovery
- Search games using the IGDB API: https://api-docs.igdb.com
- View trending/recent games on initial homepage load - Popular games from the last 3 months
- Click games to open a modal with more details:
  - Cover image
  - Title
  - Add to Backlog button
  - Summary
  - Release date
  - Total rating
  - Available Platforms

### Library Management
- Add games to backlog
- View saved games in the "My Library" page
- Update game status
- Remove games from library
- Similar to Game Discovery, you may click games to open a modal with more details

---

## Tech Stack

### Frontend
- Next.js App Router
- React
- TypeScript
- Tailwind CSS

### Backend
- Next.js Server Actions
- Next.js Route Handlers
- Auth.js / NextAuth
- Prisma ORM

### Database
- PostgreSQL
- Neon

### External API
- IGDB API
- Twitch OAuth Client Credentials Flow

---
