import { useEffect, useState } from 'react';
import { FiTrash2, FiDownload } from 'react-icons/fi';
import { useEditor } from '../context/EditorContext';

const LANG_COLORS = {
  javascript: '#f7df1e',
  python: '#3572A5',
  c: '#555555',
  cpp: '#f34b7d',
  java: '#b07219',
};

export default function SnippetManager() {
  const { snippets, loadSnippets, loadSnippet, removeSnippet } = useEditor();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadSnippets().finally(() => setLoading(false));
  }, [loadSnippets]);

  if (loading) return <div className="panel-empty">Loading snippets…</div>;

  return (
    <div className="panel-content">
      <div className="panel-header">
        <span className="panel-title">📁 Saved Snippets</span>
        <span className="panel-count">{snippets.length}</span>
      </div>

      {snippets.length === 0 ? (
        <div className="panel-empty">
          <p>No snippets saved yet.</p>
          <p>Write some code and click <strong>Save</strong>!</p>
        </div>
      ) : (
        <ul className="snippet-list">
          {snippets.map((s) => (
            <li key={s._id} className="snippet-item">
              <div className="snippet-info">
                <span
                  className="snippet-lang-dot"
                  style={{ background: LANG_COLORS[s.language] || '#888' }}
                />
                <div>
                  <div className="snippet-title">{s.title}</div>
                  <div className="snippet-meta">
                    {s.language} · {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="snippet-actions">
                <button
                  className="icon-btn"
                  onClick={() => loadSnippet(s)}
                  title="Load into editor"
                >
                  <FiDownload size={14} />
                </button>
                <button
                  className="icon-btn icon-btn-danger"
                  onClick={() => removeSnippet(s._id)}
                  title="Delete snippet"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
