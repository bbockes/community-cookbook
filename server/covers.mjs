export function googleCoverUrl(volumeId) {
  const url = new URL('https://books.google.com/books/content');
  url.searchParams.set('id', volumeId);
  url.searchParams.set('printsec', 'frontcover');
  url.searchParams.set('img', '1');
  url.searchParams.set('zoom', '0');
  url.searchParams.set('edge', 'none');
  url.searchParams.set('source', 'gbs_api');
  return url.toString();
}

function openLibraryCover(isbn) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
}

function abeBooksCover(isbn) {
  return `https://pictures.abebooks.com/isbn/${isbn}-us-300.jpg`;
}

export function buildCoverCheckUrls(book) {
  const urls = [];
  if (book.image) urls.push(book.image);
  urls.push(googleCoverUrl(book.id));
  for (const isbn of [book.isbn13, book.isbn10].filter(Boolean)) {
    urls.push(openLibraryCover(isbn));
    urls.push(abeBooksCover(isbn));
  }
  return [...new Set(urls)];
}

export async function urlHasImage(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (!response.ok) return false;
    const type = response.headers.get('content-type') ?? '';
    return type.startsWith('image/');
  } catch {
    return false;
  }
}

import {
  isUploadedCoverUrl,
  uploadedCoverExists,
} from './uploadCovers.mjs';

export async function bookHasCover(book) {
  if (book.hasCustomCover && book.image && isUploadedCoverUrl(book.image)) {
    return uploadedCoverExists(book.image);
  }

  for (const url of buildCoverCheckUrls(book)) {
    if (isUploadedCoverUrl(url)) {
      if (uploadedCoverExists(url)) return true;
      continue;
    }
    if (await urlHasImage(url)) return true;
  }
  return false;
}
