import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import {
  assignToCollections,
  clearFoodTypeCollections,
  clearCuisineCollections,
  clearMethodCollections,
  deleteCookbook,
  findExistingCookbook,
  getCookbookById,
  getCookbookCollections,
  getCookbooksByCollectionKey,
  getCookbooksByAuthorLetter,
  getDb,
  listAllCookbooks,
  listAuthors,
  rowToCookbook,
  searchCookbooksInCollection,
  upsertCookbook,
} from './db.mjs';
import {
  GoogleBooksError,
  fetchVolumeById,
  isApiKeyConfigured,
  lookupCookbook,
} from './googleBooks.mjs';
import { bookHasCover } from './covers.mjs';
import { dedupeBooks, pickPreferredBook } from './dedupe.mjs';
import { inferCollections } from './autoCollections.mjs';
import {
  resolveCollectionRequest,
} from './collections.mjs';
import {
  saveUploadedCover,
  UPLOAD_DIR,
} from './uploadCovers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT, '.env.local') });
dotenv.config({ path: path.join(ROOT, '.env') });

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Cover must be an image file'));
  },
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/api/uploads/covers', express.static(UPLOAD_DIR));

function sendError(res, error, fallbackStatus = 500) {
  if (error instanceof GoogleBooksError) {
    return res.status(error.status).json({
      error: error.message,
      usesSharedQuota: error.usesSharedQuota,
      apiKeyConfigured: isApiKeyConfigured(),
    });
  }

  const status = error.status ?? fallbackStatus;
  return res.status(status).json({ error: error.message ?? 'Internal server error' });
}

async function saveCookbookFromGoogle(cookbook, { coverFile } = {}) {
  let book = { ...cookbook };
  const existing = findExistingCookbook(book);

  if (coverFile) {
    const coverId = existing?.id ?? book.id;
    book.image = saveUploadedCover(coverId, coverFile);
    book.hasCustomCover = true;
    book.hasCover = true;
  }

  if (!book.hasCustomCover) {
    const hasCover = await bookHasCover(book);
    if (!hasCover) {
      const error = new Error('No cover image found for this cookbook');
      error.status = 422;
      throw error;
    }
    book.hasCover = true;
  }

  if (existing) {
    const canonicalId = existing.id;
    const preferred = pickPreferredBook(
      { ...existing, hasCover: true },
      { ...book, hasCover: true }
    );
    const merged = upsertCookbook({
      ...preferred,
      id: canonicalId,
      hasCover: true,
      hasCustomCover: preferred.hasCustomCover || book.hasCustomCover,
      image: book.hasCustomCover ? book.image : preferred.image,
    });
    clearFoodTypeCollections(canonicalId);
    clearCuisineCollections(canonicalId);
    clearMethodCollections(canonicalId);
    assignToCollections(canonicalId, inferCollections(merged));

    if (book.id !== canonicalId && getCookbookById(book.id)) {
      deleteCookbook(book.id);
    }

    return merged;
  }

  const saved = upsertCookbook({ ...book, hasCover: true });
  clearFoodTypeCollections(saved.id);
  clearCuisineCollections(saved.id);
  clearMethodCollections(saved.id);
  assignToCollections(saved.id, inferCollections(saved));
  return saved;
}

async function resolveCookbookLookup(cookbook, { coverFile } = {}) {
  const existing = findExistingCookbook(cookbook);
  const saved = await saveCookbookFromGoogle(cookbook, { coverFile });
  return {
    book: saved,
    created: !existing,
    alreadyExists: Boolean(existing),
  };
}

function prepareBooksForDisplay(books) {
  return dedupeBooks(books.filter((book) => book.hasCover !== false));
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    apiKeyConfigured: isApiKeyConfigured(),
  });
});

app.get('/api/collections', (req, res) => {
  try {
    const tab = req.query.tab ?? 'all';
    const subcategory = req.query.subcategory ?? null;
    const subFilter = req.query.subFilter ?? null;
    const authorLetter = req.query.authorLetter ?? null;

    let books;

    if (tab === 'authors' && authorLetter && !subcategory) {
      books = getCookbooksByAuthorLetter(authorLetter);
    } else {
      const { collectionKey, parentKey, subFilterQuery } =
        resolveCollectionRequest(tab, subcategory, subFilter);

      books = getCookbooksByCollectionKey(collectionKey);

      if (books.length === 0 && subFilterQuery && parentKey) {
        books = searchCookbooksInCollection(parentKey, subFilterQuery);
      }
    }

    res.json(prepareBooksForDisplay(books));
  } catch (error) {
    sendError(res, error);
  }
});

app.get('/api/authors', (_req, res) => {
  try {
    res.json(listAuthors());
  } catch (error) {
    sendError(res, error);
  }
});

app.get('/api/cookbooks', (_req, res) => {
  try {
    res.json(prepareBooksForDisplay(listAllCookbooks({ displayableOnly: true })));
  } catch (error) {
    sendError(res, error);
  }
});

app.get('/api/cookbooks/:id', async (req, res) => {
  try {
    const existing = getCookbookById(req.params.id);
    if (existing && existing.hasCover !== false) {
      return res.json(existing);
    }

    const fetched = await fetchVolumeById(req.params.id);
    if (!fetched) {
      return res.status(404).json({ error: 'Cookbook not found' });
    }

    const saved = await saveCookbookFromGoogle(fetched);
    res.json(saved);
  } catch (error) {
    sendError(res, error);
  }
});

app.get('/api/cookbooks/:id/collections', (req, res) => {
  try {
    res.json(getCookbookCollections(req.params.id));
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/cookbooks/lookup', upload.single('cover'), async (req, res) => {
  try {
    const title = req.body.title?.trim() || undefined;
    const author = req.body.author?.trim() || undefined;
    const isbn13 = req.body.isbn13?.trim() || undefined;
    const isbn10 = req.body.isbn10?.trim() || undefined;
    const save = req.body.save !== 'false';
    const coverFile = req.file;

    const existingEarly = findExistingCookbook({
      isbn13,
      isbn10,
      title,
      author,
    });

    if (existingEarly && save) {
      if (existingEarly.hasCover === false && !coverFile) {
        return res.status(422).json({ error: 'Cookbook exists but has no cover image' });
      }

      const fromGoogle = await lookupCookbook({ title, author, isbn13, isbn10 });
      const incoming = fromGoogle ?? existingEarly;
      const saved = await saveCookbookFromGoogle(incoming, { coverFile });

      return res.json({
        book: saved,
        source: 'cache',
        created: false,
        alreadyExists: true,
      });
    }

    const cookbook = await lookupCookbook({ title, author, isbn13, isbn10 });
    if (!cookbook) {
      return res.status(404).json({ error: 'No matching cookbook found on Google Books' });
    }

    if (!save) {
      const existing = findExistingCookbook(cookbook);
      const book = existing ?? cookbook;
      return res.json({
        book,
        source: existing ? 'cache' : 'google',
        created: false,
        alreadyExists: Boolean(existing),
      });
    }

    const result = await resolveCookbookLookup(cookbook, { coverFile });

    res.status(result.created ? 201 : 200).json({
      book: result.book,
      source: result.alreadyExists ? 'cache' : 'google',
      created: result.created,
      alreadyExists: result.alreadyExists,
    });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/cookbooks/bulk', async (req, res) => {
  try {
    const { entries = [], delayMs = 300 } = req.body ?? {};

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'entries array is required' });
    }

    const results = [];

    for (const entry of entries) {
      const { title, author, isbn13, isbn10 } = entry;
      try {
        const cookbook = await lookupCookbook({ title, author, isbn13, isbn10 });
        if (!cookbook) {
          results.push({
            title: title ?? isbn13 ?? isbn10 ?? 'Unknown',
            status: 'not_found',
          });
          continue;
        }

        const result = await resolveCookbookLookup(cookbook);
        results.push({
          title: result.book.title,
          status: result.alreadyExists ? 'existing' : 'created',
          book: result.book,
        });

        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        results.push({
          title: entry.title ?? entry.isbn13 ?? 'Unknown',
          status: 'error',
          error: error.message,
        });
      }
    }

    res.json({ results });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/cookbooks/:id/refresh', async (req, res) => {
  try {
    const existing = getCookbookById(req.params.id);
    const fetched = await fetchVolumeById(req.params.id);
    if (!fetched) {
      return res.status(404).json({ error: 'Cookbook not found on Google Books' });
    }

    if (existing?.hasCustomCover) {
      fetched.image = existing.image;
      fetched.hasCustomCover = true;
      fetched.hasCover = true;
    }

    const saved = await saveCookbookFromGoogle(fetched);
    res.json(saved);
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/cookbooks/:id/collections', (req, res) => {
  try {
    const { collections = [] } = req.body ?? {};
    const book = getCookbookById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Cookbook not found' });
    }

    assignToCollections(req.params.id, collections);
    res.json(getCookbookCollections(req.params.id));
  } catch (error) {
    sendError(res, error);
  }
});

app.listen(PORT, () => {
  console.log(`[community-cookbook] API server listening on http://localhost:${PORT}`);
  if (!isApiKeyConfigured()) {
    console.warn(
      '[community-cookbook] GOOGLE_BOOKS_API_KEY is not set — lookups will use shared quota.'
    );
  }
});
