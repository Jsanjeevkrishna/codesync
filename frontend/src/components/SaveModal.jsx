import { useState } from 'react';
import { useEditor } from '../context/EditorContext';

export default function SaveModal({ onClose }) {
  const { handleSave, language } = useEditor();
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await handleSave(title.trim());
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">💾 Save Snippet</h3>
        <form onSubmit={handleSubmit}>
          <label className="modal-label">Title</label>
          <input
            className="modal-input"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`My ${language} snippet`}
            required
          />
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !title.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
