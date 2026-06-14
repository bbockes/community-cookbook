# Community Cookbook

A browseable cookbook catalog powered by the Google Books API, with a local SQLite cache so books load instantly after the first lookup.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your [Google Books API key](https://console.cloud.google.com/apis/library/books.googleapis.com):
   ```
   GOOGLE_BOOKS_API_KEY=your_key_here
   ```

3. Start the dev servers (API + frontend):
   ```bash
   npm run dev
   ```

4. Seed the database with the curated cookbook lists (one-time, requires API key):
   ```bash
   npm run seed
   npm run prune   # remove books without covers and merge duplicates
   ```

The app runs at `http://localhost:5173`. The API server runs at `http://localhost:3001`.

## Adding Cookbooks

Use **Add Cookbook** in the header to look up a book by title, author, and/or ISBN. The server fetches full metadata from Google Books and saves it to `data/cookbooks.db` — subsequent loads come from the database, not the API.

**Bulk import** accepts one book per line:
- `Title by Author`
- `Title | Author | ISBN`
- `9780394721781` (ISBN only)

Books are automatically sorted into browse categories based on Google Books metadata (title, description, category, and author).

## Architecture

- **Frontend** (Vite + React) — browse UI, product pages, add-cookbook modal
- **Backend** (`server/`) — Express API + SQLite persistence
- **Google Books** — used only on first lookup; cached locally afterward

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/collections?tab=&subcategory=&subFilter=` | Books for a browse view |
| GET | `/api/cookbooks/:id` | Single cookbook (from cache or Google) |
| POST | `/api/cookbooks/lookup` | Look up and save a book |
| POST | `/api/cookbooks/bulk` | Bulk import |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + frontend |
| `npm run seed` | Import curated lists into the database |
| `npm run prune` | Remove books without covers and merge duplicates |
| `npm run build` | Production frontend build |
