import { useState } from 'react';
import { FiPlay, FiSun, FiMoon, FiUsers, FiCode } from 'react-icons/fi';
import { useEditor } from '../context/EditorContext';
import { useRoom } from '../context/RoomContext';
import RoomModal from './RoomModal';
import FunctionBuilder from './FunctionBuilder';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python',     label: 'Python' },
  { value: 'c',         label: 'C' },
  { value: 'cpp',       label: 'C++' },
  { value: 'java',      label: 'Java' },
];

export default function Toolbar() {
  const { activeFile, changeFileLanguage, isRunning, handleRun, theme, toggleTheme } = useEditor();
  const { inRoom, emitLanguageChange } = useRoom();

  const [showRoom, setShowRoom]       = useState(false);
  const [showFnBuilder, setShowFnBuilder] = useState(false);

  if (!activeFile) return <div className="toolbar" />;

  const handleLangChange = (lang) => {
    changeFileLanguage(activeFile.id, lang);
    if (inRoom) emitLanguageChange(lang);
  };

  return (
    <>
      <div className="toolbar">
        {/* Logo */}
        <div className="toolbar-logo">
          <FiCode size={20} />
          <span>CodeSync</span>
          {inRoom && <span className="collab-badge">● LIVE</span>}
        </div>

        {/* Language selector */}
        <div className="toolbar-center">
          <select
            className="lang-select"
            value={activeFile.language}
            onChange={(e) => handleLangChange(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Right controls */}
        <div className="toolbar-right">
          {/* Function Builder */}
          <button className="btn btn-secondary btn-sm" onClick={() => setShowFnBuilder(true)} title="Function Builder">
            <FiCode size={13} /> Function
          </button>

          {/* Collaborate */}
          <button
            className={`btn btn-sm ${inRoom ? 'btn-collab-active' : 'btn-secondary'}`}
            onClick={() => setShowRoom(true)}
            title="Collaborate"
          >
            <FiUsers size={13} /> {inRoom ? 'In Room' : 'Collaborate'}
          </button>

          <button className="btn btn-ghost" onClick={toggleTheme} title="Toggle theme">
            {theme === 'vs-dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>

          <button
            className="btn btn-primary"
            onClick={handleRun}
            disabled={isRunning}
            title="Run code (Ctrl+Enter)"
          >
            {isRunning ? <span className="spinner" /> : <FiPlay size={14} />}
            {isRunning ? 'Running…' : 'Run'}
          </button>
        </div>
      </div>

      {showRoom      && <RoomModal       onClose={() => setShowRoom(false)} />}
      {showFnBuilder && <FunctionBuilder onClose={() => setShowFnBuilder(false)} />}
    </>
  );
}
