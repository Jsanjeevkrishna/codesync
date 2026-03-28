import Editor from '@monaco-editor/react';
import { FiX } from 'react-icons/fi';
import { useEditor } from '../context/EditorContext';
import { useRoom } from '../context/RoomContext';
import { useEffect, useCallback, useRef } from 'react';

const MONACO_LANG_MAP = {
  javascript: 'javascript',
  python: 'python',
  c: 'c',
  cpp: 'cpp',
  java: 'java',
};

export default function EditorPanel() {
  const { files, activeFile, activeId, switchFile, closeFile, updateFile, changeFileLanguage, theme } = useEditor();
  const { inRoom, roomCode, setRoomCode, roomLanguage, emitCodeChange } = useRoom();

  const suppressRef = useRef(false); // prevent echo loops

  // When room sends a code update → push it into the active file
  useEffect(() => {
    if (!inRoom || roomCode === null) return;
    suppressRef.current = true;
    updateFile(activeFile?.id, { code: roomCode });
    setTimeout(() => { suppressRef.current = false; }, 50);
  }, [roomCode]); // eslint-disable-line

  // When room sends language update → update active file language
  useEffect(() => {
    if (!inRoom || roomLanguage === null) return;
    if (activeFile && activeFile.language !== roomLanguage) {
      changeFileLanguage(activeFile.id, roomLanguage);
    }
  }, [roomLanguage]); // eslint-disable-line

  const handleChange = useCallback((val) => {
    const code = val || '';
    updateFile(activeFile?.id, { code });
    if (inRoom && !suppressRef.current) {
      setRoomCode(code);
      emitCodeChange(code);
    }
  }, [activeFile, inRoom, emitCodeChange, updateFile, setRoomCode]);

  if (!activeFile) return null;

  return (
    <div className="editor-panel">
      {/* Multi-file tab bar */}
      <div className="editor-tab-bar">
        {files.map((f) => (
          <div
            key={f.id}
            className={`editor-tab${f.id === activeId ? ' active' : ''}`}
            onClick={() => switchFile(f.id)}
            title={f.name}
          >
            <span className="tab-name">{f.name}</span>
            {f.dirty && <span className="dirty-dot tab-dirty" title="Unsaved changes" />}
            {files.length > 1 && (
              <button
                className="tab-close"
                onClick={(e) => { e.stopPropagation(); closeFile(f.id); }}
                title="Close"
              >
                <FiX size={11} />
              </button>
            )}
          </div>
        ))}
        {inRoom && <div className="tab-live-indicator">● LIVE</div>}
      </div>

      <Editor
        height="100%"
        language={MONACO_LANG_MAP[activeFile.language] || 'javascript'}
        value={activeFile.code}
        theme={theme}
        onChange={handleChange}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          tabSize: 2,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          bracketPairColorization: { enabled: true },
        }}
      />
    </div>
  );
}
