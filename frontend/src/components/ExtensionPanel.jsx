import { useEffect, useState } from 'react';
import { FiTrash2, FiToggleLeft, FiToggleRight, FiPlus } from 'react-icons/fi';
import { getExtensions, createExtension, updateExtension, deleteExtension } from '../api/api';

export default function ExtensionPanel() {
  const [extensions, setExtensions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', script: 'return code;' });
  const [error, setError] = useState('');

  useEffect(() => {
    getExtensions().then(({ data }) => setExtensions(data)).catch(console.error);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await createExtension(form);
      setExtensions((prev) => [data, ...prev]);
      setShowForm(false);
      setForm({ name: '', description: '', script: 'return code;' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create extension');
    }
  };

  const handleToggle = async (ext) => {
    const { data } = await updateExtension(ext._id, { enabled: !ext.enabled });
    setExtensions((prev) => prev.map((e) => (e._id === data._id ? data : e)));
  };

  const handleDelete = async (id) => {
    await deleteExtension(id);
    setExtensions((prev) => prev.filter((e) => e._id !== id));
  };

  return (
    <div className="panel-content">
      <div className="panel-header">
        <span className="panel-title">🧩 Extensions</span>
        <button className="icon-btn" onClick={() => setShowForm((s) => !s)} title="Add extension">
          <FiPlus size={16} />
        </button>
      </div>

      {showForm && (
        <form className="ext-form" onSubmit={handleCreate}>
          <input
            className="ext-input"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="ext-input"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <textarea
            className="ext-textarea"
            placeholder="Script — receives `code`, must return transformed code"
            value={form.script}
            onChange={(e) => setForm({ ...form, script: e.target.value })}
            rows={4}
            required
          />
          {error && <p className="ext-error">{error}</p>}
          <button className="btn btn-primary btn-sm" type="submit">Save Extension</button>
        </form>
      )}

      {extensions.length === 0 ? (
        <div className="panel-empty">
          <p>No extensions yet.</p>
          <p>Add an extension to transform your code before execution.</p>
        </div>
      ) : (
        <ul className="snippet-list">
          {extensions.map((ext) => (
            <li key={ext._id} className="snippet-item">
              <div className="snippet-info">
                <div>
                  <div className="snippet-title">{ext.name}</div>
                  {ext.description && <div className="snippet-meta">{ext.description}</div>}
                </div>
              </div>
              <div className="snippet-actions">
                <button className="icon-btn" onClick={() => handleToggle(ext)} title="Toggle">
                  {ext.enabled ? <FiToggleRight size={18} color="#4ade80" /> : <FiToggleLeft size={18} />}
                </button>
                <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(ext._id)} title="Delete">
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
