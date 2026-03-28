import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { FiX, FiPlus, FiCode } from 'react-icons/fi';
import { useEditor } from '../context/EditorContext';

const DEFAULT_FN = `// Write a reusable function here
function myFunction(input) {
  // your logic
  return input;
}`;

export default function FunctionBuilder({ onClose }) {
  const { activeFile, updateFile, theme } = useEditor();
  const [fnCode, setFnCode]   = useState(DEFAULT_FN);
  const [fnName, setFnName]   = useState('');
  const [savedFns, setSavedFns] = useState([]);
  const editorRef = useRef(null);

  const handleMount = (editor) => { editorRef.current = editor; };

  // Insert function at cursor position in the main editor
  const addToEditor = (code) => {
    if (!activeFile) return;
    const pos = editorRef.current?.getPosition();
    const currentCode = activeFile.code || '';
    // Append after current content with a blank line separator
    const newCode = currentCode + '\n\n' + code;
    updateFile(activeFile.id, { code: newCode });
    onClose();
  };

  const saveFunction = () => {
    const name = fnName.trim() || `fn_${savedFns.length + 1}`;
    setSavedFns((prev) => [...prev, { name, code: fnCode }]);
    setFnName('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="fn-builder-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="fn-builder-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiCode size={18} />
            <span className="modal-title" style={{ margin: 0 }}>Function Builder</span>
          </div>
          <button className="icon-btn" onClick={onClose}><FiX size={18} /></button>
        </div>

        <div className="fn-builder-body">
          {/* Mini editor */}
          <div className="fn-editor-wrap">
            <Editor
              height="280px"
              language="javascript"
              value={fnCode}
              theme={theme}
              onChange={(val) => setFnCode(val || '')}
              onMount={handleMount}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                lineNumbers: 'on',
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 8 },
                automaticLayout: true,
              }}
            />
          </div>

          {/* Actions */}
          <div className="fn-builder-actions">
            <div style={{ display: 'flex', gap: 8, flex: 1 }}>
              <input
                className="ext-input"
                placeholder="Save as (optional name)"
                value={fnName}
                onChange={(e) => setFnName(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-secondary btn-sm" onClick={saveFunction} title="Add to saved list">
                Save
              </button>
            </div>
            <button className="btn btn-primary" onClick={() => addToEditor(fnCode)}>
              <FiPlus size={14} /> Add to Editor
            </button>
          </div>

          {/* Saved functions library */}
          {savedFns.length > 0 && (
            <div className="fn-library">
              <div className="collab-section-title">📚 Saved Functions</div>
              <div className="fn-list">
                {savedFns.map((fn, i) => (
                  <div key={i} className="fn-item">
                    <span className="fn-item-name">{fn.name}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => setFnCode(fn.code)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-primary" onClick={() => addToEditor(fn.code)}>
                        Insert
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
