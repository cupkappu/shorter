import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'links.json');

const ensureDataFile = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({}, null, 2), 'utf-8');
  }
};

export const loadLinks = async () => {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.error('Failed to parse links file, resetting', err);
    await fs.writeFile(DATA_FILE, JSON.stringify({}, null, 2), 'utf-8');
    return {};
  }
};

export const saveLinks = async (links) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2), 'utf-8');
  return links;
};

export const normalizeUrl = (rawUrl) => {
  if (!rawUrl) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const url = new URL(withProtocol);
    return url.toString();
  } catch {
    return null;
  }
};

export const isValidSlug = (slug) => /^[a-zA-Z0-9_-]{3,32}$/.test(slug);

export const generateSlug = (existing) => {
  let slug;
  do {
    slug = nanoid(6);
  } while (existing[slug]);
  return slug;
};
