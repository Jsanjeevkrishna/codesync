import { useEffect, useState, useRef } from 'react';
import { FiPlus, FiSave, FiTrash2, FiDownload } from 'react-icons/fi';
import { useEditor, langExt } from '../context/EditorContext';

const LANG_COLORS = {
  javascript: '#f7df1e',
  python: '#3572A5',
  c: '#555555',
  cpp: '#f34b7d',
  java: '#b07219',
};

const LANGUAGES = ['javascript', 'python', 'c', 'cpp', 'java'];

// Small inline rename input shown on double-click
function RenameInput({ value, onDone }) {
  const ref = useRef(null);
  const [val, setVal] = useState(value);

  useEffect(() => { ref.current?.select(); }, []);

  const commit = () => onDone(val.trim() || value);

  return (
    <input
      ref={ref}
      className="rename-input"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') onDone(value); // cancel
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

export default function FileManager() {
  const {
    files, activeId, createNewFile, switchFile, saveFileToDB, closeFile, renameFile,
    snippets, loadSnippets, loadSnippetAsFile, removeSnippet,
  } = useEditor();

  const [showNewFile, setShowNewFile] = useState(false);
  const [newLang, setNewLang]         = useState('javascript');
  const [newName, setNewName]         = useState('');
  const [tab, setTab]                 = useState('local');
  const [renamingId, setRenamingId]   = useState(null); // id of file being renamed

  useEffect(() => { loadSnippets(); }, [loadSnippets]);

  // When language changes, auto-update the filename extension in the form
  const handleLangChange = (lang) => {
    setNewLang(lang);
    if (newName) {
      const base = newName.replace(/\.[^.]+$/, ''); // strip old ext
      setNewName(`${base}.${langExt(lang)}`);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    // Use the entered name, or fall back to auto-generated inside createNewFile
    createNewFile(newLang, trimmed || null);
    setShowNewFile(false);
    setNewName('');
    setNewLang('javascript');
  };

  return (
    <div className="panel-content">
      {/* Tab switcher */}
      <div className="fm-tabs">
        <button className={`fm-tab${tab === 'local' ? ' fm-tab-active' : ''}`} onClick={() => setTab('local')}>
          Local Files
        </button>
        <button className={`fm-tab${tab === 'saved' ? ' fm-tab-active' : ''}`} onClick={() => setTab('saved')}>
          Saved ({snippets.length})
        </button>
        <button className="icon-btn fm-new-btn" title="New file" onClick={() => setShowNewFile((s) => !s)}>
          <FiPlus size={16} />
        </button>
      </div>

      {/* New file form */}
      {showNewFile && (
        <form className="ext-form" onSubmit={handleCreate}>
          <input
            className="ext-input"
            placeholder={`e.g. solution.${langExt(newLang)}`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <select
            className="ext-input"
            value={newLang}
            onChange={(e) => handleLangChange(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary btn-sm">Create File</button>
        </form>
      )}

      {/* LOCAL FILES */}
      {tab === 'local' && (
        <ul className="snippet-list">
          {files.map((f) => (
            <li
              key={f.id}
              className={`snippet-item${f.id === activeId ? ' snippet-item-active' : ''}`}
              onClick={() => switchFile(f.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="snippet-info">
                <span className="snippet-lang-dot" style={{ background: LANG_COLORS[f.language] || '#888' }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  {renamingId === f.id ? (
                    <RenameInput
                      value={f.name}
                      onDone={(name) => {
                        if (name && name !== f.name) renameFile(f.id, name);
                        setRenamingId(null);
                      }}
                    />
                  ) : (
                    <div
                      className="snippet-title"
                      title="Double-click to rename"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setRenamingId(f.id);
                      }}
                    >
                      {f.name}
                      {f.dirty && <span className="dirty-dot" style={{ marginLeft: 5 }} title="Unsaved changes" />}
                    </div>
                  )}
                  <div className="snippet-meta">{f.language}</div>
                </div>
              </div>
              <div className="snippet-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="icon-btn"
                  title={f.savedToDb && !f.dirty ? 'Already saved ✓' : 'Save permanently to DB'}
                  onClick={() => saveFileToDB(f.id)}
                  style={{ color: f.savedToDb && !f.dirty ? 'var(--accent-green)' : undefined }}
                >
                  <FiSave size={14} />
                </button>
                {files.length > 1 && (
                  <button
                    className="icon-btn icon-btn-danger"
                    title="Close file"
                    onClick={() => closeFile(f.id)}
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* SAVED SNIPPETS FROM DB */}
      {tab === 'saved' && (
        <>
          {snippets.length === 0 ? (
            <div className="panel-empty">
              <p>No saved files yet.</p>
              <p>Click 💾 beside a local file to save it permanently.</p>
            </div>
          ) : (
            <ul className="snippet-list">
              {snippets.map((s) => (
                <li key={s._id} className="snippet-item">
                  <div className="snippet-info">
                    <span className="snippet-lang-dot" style={{ background: LANG_COLORS[s.language] || '#888' }} />
                    <div>
                      <div className="snippet-title">{s.title}</div>
                      <div className="snippet-meta">
                        {s.language} · {new Date(s.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="snippet-actions">
                    <button className="icon-btn" title="Open in new tab" onClick={() => loadSnippetAsFile(s)}>
                      <FiDownload size={14} />
                    </button>
                    <button className="icon-btn icon-btn-danger" title="Delete from DB" onClick={() => removeSnippet(s._id)}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
