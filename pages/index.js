import { useEffect, useState } from 'react';

const buildShortUrl = (origin, slug) => `${origin || ''}/${slug}`;

async function apiFetch(path, { method = 'GET', body, apiKey }) {
  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey || '',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [deleteSlug, setDeleteSlug] = useState('');
  const [links, setLinks] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('shorter_api_key');
    if (savedKey) setApiKey(savedKey);
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('shorter_api_key', apiKey);
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const refresh = async () => {
    if (!apiKey) return;
    setLoading(true);
    setErr('');
    try {
      const data = await apiFetch('/api/links', { apiKey });
      setLinks((data.links || []).sort((a, b) => a.slug.localeCompare(b.slug)));
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await apiFetch('/api/links', { method: 'POST', body: { url, slug: slug || undefined }, apiKey });
      setMsg('创建成功');
      setUrl('');
      setSlug('');
      refresh();
    } catch (error) {
      setErr(error.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await apiFetch('/api/links', { method: 'PUT', body: { slug: editSlug, url: editUrl }, apiKey });
      setMsg('更新成功');
      refresh();
    } catch (error) {
      setErr(error.message);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await apiFetch('/api/links', { method: 'DELETE', body: { slug: deleteSlug }, apiKey });
      setMsg('删除成功');
      setDeleteSlug('');
      refresh();
    } catch (error) {
      setErr(error.message);
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setMsg('已复制');
    } catch {
      setErr('复制失败，请手动复制');
    }
  };

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      <h1 style={{ marginBottom: 8 }}>Shorter · Next.js 版</h1>
      <p style={{ color: '#6b7280', marginTop: 0 }}>单一密钥认证 + JSON 存储 + CRUD 界面</p>

      <section style={{ background: '#fff', padding: 20, borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 12px 30px rgba(31,41,55,0.08)', marginBottom: 16 }}>
        <h3>API Key</h3>
        <p style={{ color: '#6b7280' }}>在 .env.local 设置 AUTH_KEY，界面中填入同样的值。</p>
        <input
          placeholder="输入 API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }}
        />
      </section>

      <section style={{ background: '#fff', padding: 20, borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 12px 30px rgba(31,41,55,0.08)', marginBottom: 16 }}>
        <h3>创建</h3>
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
          <input
            required
            placeholder="原始链接"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }}
          />
          <input
            placeholder="自定义短链（可选）"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={{ padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }}
          />
          <button type="submit" disabled={!apiKey} style={{ padding: 12, borderRadius: 10, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {apiKey ? '创建短链' : '请先填写 API Key'}
          </button>
        </form>
      </section>

      <section style={{ background: '#fff', padding: 20, borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 12px 30px rgba(31,41,55,0.08)', marginBottom: 16, display: 'grid', gap: 12 }}>
        <h3>更新</h3>
        <form onSubmit={handleUpdate} style={{ display: 'grid', gap: 12 }}>
          <input
            required
            placeholder="短链后缀"
            value={editSlug}
            onChange={(e) => setEditSlug(e.target.value)}
            style={{ padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }}
          />
          <input
            required
            placeholder="新的原始链接"
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            style={{ padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }}
          />
          <button type="submit" disabled={!apiKey} style={{ padding: 12, borderRadius: 10, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>
            更新短链
          </button>
        </form>
      </section>

      <section style={{ background: '#fff', padding: 20, borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 12px 30px rgba(31,41,55,0.08)', marginBottom: 16, display: 'grid', gap: 12 }}>
        <h3>删除</h3>
        <form onSubmit={handleDelete} style={{ display: 'grid', gap: 12 }}>
          <input
            required
            placeholder="短链后缀"
            value={deleteSlug}
            onChange={(e) => setDeleteSlug(e.target.value)}
            style={{ padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }}
          />
          <button type="submit" disabled={!apiKey} style={{ padding: 12, borderRadius: 10, background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}>
            删除短链
          </button>
        </form>
      </section>

      <section style={{ background: '#fff', padding: 20, borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 12px 30px rgba(31,41,55,0.08)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h3 style={{ margin: 0 }}>列表</h3>
          <button onClick={refresh} disabled={!apiKey || loading} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
            刷新
          </button>
        </div>
        {loading ? <p>加载中…</p> : null}
        {links.length === 0 ? <p style={{ color: '#6b7280' }}>暂无数据</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>短链</th>
                <th style={{ textAlign: 'left', padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>原始链接</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {links.map((item) => (
                <tr key={item.slug}>
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>
                    <a href={buildShortUrl(origin, item.slug)} target="_blank" rel="noreferrer">{buildShortUrl(origin, item.slug)}</a>
                  </td>
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>
                    <a href={item.url} target="_blank" rel="noreferrer">{item.url}</a>
                  </td>
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #e5e7eb' }}>
                    <button onClick={() => copy(buildShortUrl(origin, item.slug))} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>复制</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {(msg || err) && (
        <div style={{ padding: 12, borderRadius: 10, border: '1px solid', borderColor: err ? '#fecaca' : '#bbf7d0', background: err ? '#fef2f2' : '#ecfdf3', color: err ? '#b91c1c' : '#14532d' }}>
          {err || msg}
        </div>
      )}
    </main>
  );
}
