import { generateSlug, isValidSlug, loadLinks, normalizeUrl, saveLinks } from '../../lib/storage';

const unauthorized = (res) => res.status(401).json({ error: '缺少或错误的 API Key' });

const withAuth = (handler) => async (req, res) => {
  const headerKey = req.headers['x-api-key'];
  const authKey = process.env.AUTH_KEY;
  if (!authKey) {
    return res.status(500).json({ error: '服务未配置 AUTH_KEY' });
  }
  if (headerKey !== authKey) return unauthorized(res);
  return handler(req, res);
};

const getList = async (_req, res) => {
  const links = await loadLinks();
  const list = Object.entries(links).map(([slug, url]) => ({ slug, url }));
  res.status(200).json({ links: list });
};

const createLink = async (req, res) => {
  const { url: rawUrl, slug: rawSlug } = req.body || {};
  const url = normalizeUrl(typeof rawUrl === 'string' ? rawUrl.trim() : '');
  if (!url) return res.status(400).json({ error: '请输入有效的链接' });

  let links = await loadLinks();
  let slug = rawSlug ? String(rawSlug).trim() : '';
  if (slug) {
    if (!isValidSlug(slug)) return res.status(400).json({ error: '自定义短链只允许3-32位的字母、数字、-或_' });
    if (links[slug]) return res.status(409).json({ error: '该短链已存在' });
  } else {
    slug = generateSlug(links);
  }

  links = { ...links, [slug]: url };
  await saveLinks(links);
  res.status(201).json({ slug, url });
};

const updateLink = async (req, res) => {
  const { slug: rawSlug, url: rawUrl } = req.body || {};
  const slug = typeof rawSlug === 'string' ? rawSlug.trim() : '';
  const url = normalizeUrl(typeof rawUrl === 'string' ? rawUrl.trim() : '');
  if (!slug) return res.status(400).json({ error: '缺少 slug' });
  if (!url) return res.status(400).json({ error: '请输入有效的链接' });

  const links = await loadLinks();
  if (!links[slug]) return res.status(404).json({ error: '未找到该短链' });

  const next = { ...links, [slug]: url };
  await saveLinks(next);
  res.status(200).json({ slug, url });
};

const deleteLink = async (req, res) => {
  const { slug: rawSlug } = req.body || {};
  const slug = typeof rawSlug === 'string' ? rawSlug.trim() : '';
  if (!slug) return res.status(400).json({ error: '缺少 slug' });

  const links = await loadLinks();
  if (!links[slug]) return res.status(404).json({ error: '未找到该短链' });

  const next = { ...links };
  delete next[slug];
  await saveLinks(next);
  res.status(200).json({ ok: true });
};

const handler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return getList(req, res);
    case 'POST':
      return createLink(req, res);
    case 'PUT':
      return updateLink(req, res);
    case 'DELETE':
      return deleteLink(req, res);
    default:
      return res.status(405).json({ error: '方法不被允许' });
  }
};

export default withAuth(handler);
