import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dedupeKey as getDedupeKey } from './dedupe.mjs';
import { getAuthorSortLetter } from './authors.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DB_PATH = process.env.COOKBOOK_DB_PATH ?? path.join(ROOT, 'data', 'cookbooks.db');

let db;

export function getDb() {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS cookbooks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      authors TEXT NOT NULL,
      publisher TEXT,
      description TEXT,
      page_count INTEGER,
      image TEXT NOT NULL,
      isbn13 TEXT,
      isbn10 TEXT,
      category TEXT,
      rating REAL,
      ratings_count INTEGER DEFAULT 0,
      bestseller INTEGER DEFAULT 0,
      google_raw TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cookbook_collections (
      cookbook_id TEXT NOT NULL REFERENCES cookbooks(id) ON DELETE CASCADE,
      collection_key TEXT NOT NULL,
      PRIMARY KEY (cookbook_id, collection_key)
    );

    CREATE INDEX IF NOT EXISTS idx_cookbook_collections_key
      ON cookbook_collections(collection_key);

    CREATE INDEX IF NOT EXISTS idx_cookbooks_isbn13 ON cookbooks(isbn13);
    CREATE INDEX IF NOT EXISTS idx_cookbooks_isbn10 ON cookbooks(isbn10);

    CREATE VIRTUAL TABLE IF NOT EXISTS cookbooks_fts USING fts5(
      title,
      authors,
      description,
      category,
      content='cookbooks',
      content_rowid='rowid'
    );

    CREATE TRIGGER IF NOT EXISTS cookbooks_ai AFTER INSERT ON cookbooks BEGIN
      INSERT INTO cookbooks_fts(rowid, title, authors, description, category)
      VALUES (new.rowid, new.title, new.authors, new.description, COALESCE(new.category, ''));
    END;

    CREATE TRIGGER IF NOT EXISTS cookbooks_ad AFTER DELETE ON cookbooks BEGIN
      INSERT INTO cookbooks_fts(cookbooks_fts, rowid, title, authors, description, category)
      VALUES ('delete', old.rowid, old.title, old.authors, old.description, COALESCE(old.category, ''));
    END;

    CREATE TRIGGER IF NOT EXISTS cookbooks_au AFTER UPDATE ON cookbooks BEGIN
      INSERT INTO cookbooks_fts(cookbooks_fts, rowid, title, authors, description, category)
      VALUES ('delete', old.rowid, old.title, old.authors, old.description, COALESCE(old.category, ''));
      INSERT INTO cookbooks_fts(rowid, title, authors, description, category)
      VALUES (new.rowid, new.title, new.authors, new.description, COALESCE(new.category, ''));
    END;
  `);

  migrateSchema(database);
}

function migrateSchema(database) {
  const columns = database.prepare('PRAGMA table_info(cookbooks)').all();
  const names = new Set(columns.map((col) => col.name));

  if (!names.has('has_cover')) {
    database.exec('ALTER TABLE cookbooks ADD COLUMN has_cover INTEGER NOT NULL DEFAULT 1');
  }
  if (!names.has('has_custom_cover')) {
    database.exec('ALTER TABLE cookbooks ADD COLUMN has_custom_cover INTEGER NOT NULL DEFAULT 0');
  }
}

export function rowToCookbook(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    authors: JSON.parse(row.authors),
    publisher: row.publisher ?? undefined,
    description: row.description ?? undefined,
    pageCount: row.page_count ?? undefined,
    image: row.image,
    isbn13: row.isbn13 ?? undefined,
    isbn10: row.isbn10 ?? undefined,
    category: row.category ?? undefined,
    rating: row.rating ?? undefined,
    ratingsCount: row.ratings_count ?? undefined,
    bestseller: Boolean(row.bestseller),
    hasCover: row.has_cover == null ? true : Boolean(row.has_cover),
    hasCustomCover: Boolean(row.has_custom_cover),
  };
}

export function upsertCookbook(cookbook) {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT INTO cookbooks (
      id, title, authors, publisher, description, page_count, image,
      isbn13, isbn10, category, rating, ratings_count, bestseller, google_raw,
      has_cover, has_custom_cover, updated_at
    ) VALUES (
      @id, @title, @authors, @publisher, @description, @page_count, @image,
      @isbn13, @isbn10, @category, @rating, @ratings_count, @bestseller, @google_raw,
      @has_cover, @has_custom_cover, datetime('now')
    )
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      authors = excluded.authors,
      publisher = excluded.publisher,
      description = excluded.description,
      page_count = excluded.page_count,
      image = excluded.image,
      isbn13 = excluded.isbn13,
      isbn10 = excluded.isbn10,
      category = excluded.category,
      rating = excluded.rating,
      ratings_count = excluded.ratings_count,
      bestseller = excluded.bestseller,
      google_raw = excluded.google_raw,
      has_cover = excluded.has_cover,
      has_custom_cover = excluded.has_custom_cover,
      updated_at = datetime('now')
  `);

  stmt.run({
    id: cookbook.id,
    title: cookbook.title,
    authors: JSON.stringify(cookbook.authors),
    publisher: cookbook.publisher ?? null,
    description: cookbook.description ?? null,
    page_count: cookbook.pageCount ?? null,
    image: cookbook.image,
    isbn13: cookbook.isbn13 ?? null,
    isbn10: cookbook.isbn10 ?? null,
    category: cookbook.category ?? null,
    rating: cookbook.rating ?? null,
    ratings_count: cookbook.ratingsCount ?? 0,
    bestseller: cookbook.bestseller ? 1 : 0,
    google_raw: cookbook.googleRaw ?? null,
    has_cover: cookbook.hasCover === false ? 0 : 1,
    has_custom_cover: cookbook.hasCustomCover ? 1 : 0,
  });

  return getCookbookById(cookbook.id);
}

export function getCookbookById(id) {
  const row = getDb().prepare('SELECT * FROM cookbooks WHERE id = ?').get(id);
  return rowToCookbook(row);
}

export function clearFoodTypeCollections(cookbookId) {
  getDb()
    .prepare(
      `DELETE FROM cookbook_collections
       WHERE cookbook_id = ? AND collection_key LIKE 'foodTypes:%'`
    )
    .run(cookbookId);
}

export function clearCuisineCollections(cookbookId) {
  getDb()
    .prepare(
      `DELETE FROM cookbook_collections
       WHERE cookbook_id = ? AND collection_key LIKE 'cuisines:%'`
    )
    .run(cookbookId);
}

export function clearMethodCollections(cookbookId) {
  getDb()
    .prepare(
      `DELETE FROM cookbook_collections
       WHERE cookbook_id = ? AND collection_key LIKE 'methods:%'`
    )
    .run(cookbookId);
}

export function assignToCollections(cookbookId, collectionKeys) {
  const database = getDb();
  const insert = database.prepare(`
    INSERT OR IGNORE INTO cookbook_collections (cookbook_id, collection_key)
    VALUES (?, ?)
  `);
  const tx = database.transaction((keys) => {
    for (const key of keys) {
      if (key) insert.run(cookbookId, key);
    }
  });
  tx(collectionKeys);
}

export function getCookbooksByCollectionKey(collectionKey, { bestsellerOnly = false } = {}) {
  let sql = `
    SELECT c.* FROM cookbooks c
    INNER JOIN cookbook_collections cc ON cc.cookbook_id = c.id
    WHERE cc.collection_key = ?
      AND c.has_cover = 1
  `;
  if (bestsellerOnly) sql += ' AND c.bestseller = 1';
  sql += ' ORDER BY c.title COLLATE NOCASE';

  const rows = getDb().prepare(sql).all(collectionKey);
  return rows.map(rowToCookbook);
}

export function searchCookbooksInCollection(parentCollectionKey, searchTerms, { bestsellerOnly = false } = {}) {
  const terms = searchTerms
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2 && !['cookbook', 'or', 'and'].includes(t));

  if (terms.length === 0) {
    return getCookbooksByCollectionKey(parentCollectionKey, { bestsellerOnly });
  }

  const ftsQuery = terms.map((t) => `"${t.replace(/"/g, '""')}"`).join(' ');

  let sql = `
    SELECT c.* FROM cookbooks c
    INNER JOIN cookbook_collections cc ON cc.cookbook_id = c.id
    INNER JOIN cookbooks_fts fts ON fts.rowid = c.rowid
    WHERE cc.collection_key = ?
      AND c.has_cover = 1
      AND cookbooks_fts MATCH ?
  `;
  if (bestsellerOnly) sql += ' AND c.bestseller = 1';
  sql += ' ORDER BY bm25(cookbooks_fts), c.title COLLATE NOCASE';

  try {
    const rows = getDb().prepare(sql).all(parentCollectionKey, ftsQuery);
    return rows.map(rowToCookbook);
  } catch {
    return getCookbooksByCollectionKey(parentCollectionKey, { bestsellerOnly });
  }
}

export function listAllCookbooks({ displayableOnly = false } = {}) {
  let sql = 'SELECT * FROM cookbooks';
  if (displayableOnly) sql += ' WHERE has_cover = 1';
  sql += ' ORDER BY title COLLATE NOCASE';
  const rows = getDb().prepare(sql).all();
  return rows.map(rowToCookbook);
}

export function setCookbookHasCover(id, hasCover) {
  getDb()
    .prepare('UPDATE cookbooks SET has_cover = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(hasCover ? 1 : 0, id);
}

export function deleteCookbook(id) {
  getDb().prepare('DELETE FROM cookbooks WHERE id = ?').run(id);
}

export function mergeCollections(fromId, toId) {
  const database = getDb();
  const keys = database
    .prepare('SELECT collection_key FROM cookbook_collections WHERE cookbook_id = ?')
    .all(fromId)
    .map((row) => row.collection_key);
  assignToCollections(toId, keys);
}

export function findCookbookByIsbn(isbn13, isbn10) {
  const database = getDb();
  if (isbn13) {
    const row = database.prepare('SELECT * FROM cookbooks WHERE isbn13 = ? LIMIT 1').get(isbn13);
    if (row) return rowToCookbook(row);
  }
  if (isbn10) {
    const row = database.prepare('SELECT * FROM cookbooks WHERE isbn10 = ? LIMIT 1').get(isbn10);
    if (row) return rowToCookbook(row);
  }
  return null;
}

export function findCookbookByDedupeKey(key) {
  const books = listAllCookbooks();
  return books.find((book) => getDedupeKey(book) === key) ?? null;
}

/** Find an existing row by volume id, ISBN, or normalized title + author. */
export function findExistingCookbook({ id, isbn13, isbn10, title, authors, author }) {
  if (id) {
    const byId = getCookbookById(id);
    if (byId) return byId;
  }

  const byIsbn = findCookbookByIsbn(isbn13, isbn10);
  if (byIsbn) return byIsbn;

  const authorList =
    authors?.length ? authors : author ? [author] : [];

  if (title && authorList.length) {
    return findCookbookByDedupeKey(getDedupeKey({ title, authors: authorList }));
  }

  return null;
}

export function getCookbookCollections(cookbookId) {
  return getDb()
    .prepare('SELECT collection_key FROM cookbook_collections WHERE cookbook_id = ?')
    .all(cookbookId)
    .map((row) => row.collection_key);
}

export function getCookbooksByAuthorLetter(letter) {
  const books = listAllCookbooks({ displayableOnly: true });
  const upper = letter.toUpperCase();

  return books.filter((book) =>
    (book.authors ?? []).some((author) => {
      const trimmed = author.trim();
      if (!trimmed || trimmed === 'Unknown author') return false;
      return getAuthorSortLetter(trimmed) === upper;
    })
  );
}

/** Distinct authors from displayable cookbooks, sorted alphabetically. */
export function listAuthors() {
  const books = listAllCookbooks({ displayableOnly: true });
  const byName = new Map();

  for (const book of books) {
    for (const author of book.authors ?? []) {
      const name = author?.trim();
      if (!name || name === 'Unknown author') continue;

      const existing = byName.get(name);
      if (!existing) {
        byName.set(name, {
          name,
          bookCount: 1,
          image: book.image,
          letter: getAuthorSortLetter(name),
        });
      } else {
        existing.bookCount += 1;
      }
    }
  }

  return [...byName.values()].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
}
