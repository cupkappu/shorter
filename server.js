const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'links.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let linkStore = {};

const ensureDataFile = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch (err) {
    await fs.writeFile(DATA_FILE, JSON.stringify({}, null, 2), 'utf-8');
  }
};

const loadLinks = async () => {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.error('Failed to parse links file, resetting', err);
    return {};
  }
};

const saveLinks = async (links) => {
  linkStore = links;
  await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2), 'utf-8');
};

const normalizeUrl = (rawUrl) => {
  if (!rawUrl) return null;
  try {
    const withProtocol = rawUrl.match(/^https?:\/\//i) ? rawUrl : `https://${rawUrl}`;
    const url = new URL(withProtocol);
    return url.toString();
  } catch (err) {
    return null;
  }
};

const isValidSlug = (slug) => /^[a-zA-Z0-9_-]{3,32}$/.test(slug);

app.get('/api/links', async (_req, res) => {
  res.json({
    links: Object.entries(linkStore).map(([slug, url]) => ({ slug, url })),
  });
});

app.post('/api/shorten', async (req, res) => {
  const { url: rawUrl, slug: rawSlug } = req.body || {};
  const url = normalizeUrl(typeof rawUrl === 'string' ? rawUrl.trim() : '');
  if (!url) {
    return res.status(400).json({ error: '请输入有效的链接（支持自动补全https://）' });
  }

  let slug = rawSlug ? String(rawSlug).trim() : '';
  if (slug) {
    if (!isValidSlug(slug)) {
      return res.status(400).json({ error: '自定义短链只允许3-32位的字母、数字、-或_' });
    }
    if (linkStore[slug]) {
      return res.status(409).json({ error: '该短链已存在，请换一个' });
    }
  } else {
    do {
      slug = nanoid(6);
    } while (linkStore[slug]);
  }

  const nextLinks = { ...linkStore, [slug]: url };
  await saveLinks(nextLinks);

  const shortUrl = `${req.protocol}://${req.get('host')}/${slug}`;
  res.status(201).json({ slug, url, shortUrl });
});

app.get('/:slug', (req, res) => {
  const { slug } = req.params;
  if (linkStore[slug]) {
    return res.redirect(301, linkStore[slug]);
  }
  return res.status(404).send('未找到该短链');
});

const start = async () => {
  linkStore = await loadLinks();
  app.listen(PORT, () => {
    console.log(`🚀 Shorter service listening on http://localhost:${PORT}`);
  });
};

start();
