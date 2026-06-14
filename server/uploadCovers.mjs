import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const UPLOAD_DIR =
  process.env.COVER_UPLOAD_DIR ?? path.join(ROOT, 'data', 'uploads', 'covers');

const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export function isUploadedCoverUrl(url) {
  return typeof url === 'string' && url.startsWith('/api/uploads/covers/');
}

export function coverPublicUrl(filename) {
  return `/api/uploads/covers/${encodeURIComponent(filename)}`;
}

function extensionForFile(file) {
  return (
    MIME_TO_EXT[file.mimetype] ??
    path.extname(file.originalname).replace(/^\./, '').toLowerCase() ??
    'jpg'
  );
}

export function uploadedCoverPathFromUrl(url) {
  if (!isUploadedCoverUrl(url)) return null;
  const filename = decodeURIComponent(url.replace('/api/uploads/covers/', ''));
  return path.join(UPLOAD_DIR, filename);
}

export function uploadedCoverExists(url) {
  const filePath = uploadedCoverPathFromUrl(url);
  return Boolean(filePath && fs.existsSync(filePath));
}

export function saveUploadedCover(volumeId, file) {
  const ext = extensionForFile(file);
  const safeId = volumeId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${safeId}.${ext}`;

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer);

  return coverPublicUrl(filename);
}

export function deleteUploadedCover(url) {
  const filePath = uploadedCoverPathFromUrl(url);
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
