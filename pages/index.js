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
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [links, setLinks] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('');

  // Edit state
  const [editingSlug, setEditingSlug] = useState(null);
  const [editUrl, setEditUrl] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('shorter_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsLoggedIn(true);
    }
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (apiKey) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (inputKey.trim()) {
      const key = inputKey.trim();
      setApiKey(key);
      localStorage.setItem('shorter_api_key', key);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setApiKey('');
    setInputKey('');
    setIsLoggedIn(false);
    setLinks([]);
    localStorage.removeItem('shorter_api_key');
  };

  const refresh = async () => {
    if (!apiKey) return;
    setLoading(true);
    setErr('');
    try {
      const data = await apiFetch('/api/links', { apiKey });
      setLinks((data.links || []).sort((a, b) => b.slug.localeCompare(a.slug)));
    } catch (error) {
      setErr(error.message);
      if (error.message.includes('401') || error.message.includes('Key')) {
        handleLogout();
        setErr('Session expired or invalid key.');
      }
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
      setMsg('Link created successfully.');
      setUrl('');
      setSlug('');
      refresh();
    } catch (error) {
      setErr(error.message);
    }
  };

  const startEdit = (item) => {
    setEditingSlug(item.slug);
    setEditUrl(item.url);
    setMsg('');
    setErr('');
  };

  const cancelEdit = () => {
    setEditingSlug(null);
    setEditUrl('');
  };

  const saveEdit = async () => {
    setMsg('');
    setErr('');
    try {
      await apiFetch('/api/links', { method: 'PUT', body: { slug: editingSlug, url: editUrl }, apiKey });
      setMsg('Link updated.');
      setEditingSlug(null);
      refresh();
    } catch (error) {
      setErr(error.message);
    }
  };

  const handleDelete = async (slugToDelete) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    setMsg('');
    setErr('');
    try {
      await apiFetch('/api/links', { method: 'DELETE', body: { slug: slugToDelete }, apiKey });
      setMsg('Link deleted.');
      refresh();
    } catch (error) {
      setErr(error.message);
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setMsg('Copied to clipboard.');
      setTimeout(() => setMsg(''), 2000);
    } catch {
      setErr('Failed to copy.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Shorter</h1>
            <p className="text-gray-500">Secure Link Management</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Access Key</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="Enter your secret key"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
            >
              Login
            </button>
          </form>
          {err && <p className="mt-4 text-center text-red-500 text-sm bg-red-50 py-2 rounded-lg">{err}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Shorter</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 sm:p-10 bg-gradient-to-br from-indigo-50/50 via-white to-white border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Link</h2>
            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <input
                  required
                  placeholder="https://example.com/long-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="sm:w-64">
                <input
                  placeholder="Custom slug (optional)"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] whitespace-nowrap"
              >
                Shorten
              </button>
            </form>
          </div>
        </div>

        {(msg || err) && (
          <div className={`mb-6 px-4 py-3 rounded-xl border flex items-center gap-2 ${err ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            <span className="text-lg">{err ? '⚠️' : '✅'}</span>
            {err || msg}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-semibold text-gray-900">Active Links</h3>
            <button onClick={refresh} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
              Refresh List
            </button>
          </div>
          
          {loading && links.length === 0 ? (
            <div className="p-12 text-center text-gray-500 animate-pulse">Loading links...</div>
          ) : links.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-gray-300 text-5xl mb-4">🔗</div>
              <p className="text-gray-500 text-lg">No links found yet.</p>
              <p className="text-gray-400 text-sm mt-1">Create your first short link above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4 font-semibold">Short Link</th>
                    <th className="px-6 py-4 font-semibold">Destination</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {links.map((item) => (
                    <tr key={item.slug} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <a 
                            href={buildShortUrl(origin, item.slug)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline transition-colors"
                          >
                            /{item.slug}
                          </a>
                          <button 
                            onClick={() => copy(buildShortUrl(origin, item.slug))}
                            className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-md hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
                            title="Copy to clipboard"
                          >
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingSlug === item.slug ? (
                          <div className="flex gap-2 items-center animate-in fade-in zoom-in-95 duration-200">
                            <input 
                              value={editUrl}
                              onChange={(e) => setEditUrl(e.target.value)}
                              className="flex-grow px-3 py-1.5 text-sm border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                              autoFocus
                            />
                            <button onClick={saveEdit} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 font-medium shadow-sm transition-colors">Save</button>
                            <button onClick={cancelEdit} className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                          </div>
                        ) : (
                          <div className="text-gray-600 truncate max-w-md font-mono text-sm" title={item.url}>{item.url}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                        {editingSlug !== item.slug && (
                          <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => startEdit(item)}
                              className="text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(item.slug)}
                              className="text-gray-500 hover:text-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
