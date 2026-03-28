import { useEffect, useCallback } from 'react';
import { EditorProvider, useEditor } from './context/EditorContext';
import { RoomProvider } from './context/RoomContext';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import EditorPanel from './components/EditorPanel';
import InputPanel from './components/InputPanel';
import OutputConsole from './components/OutputConsole';
import FileManager from './components/FileManager';
import ExtensionPanel from './components/ExtensionPanel';
import CollabPanel from './components/CollabPanel';

function AppLayout() {
  const { theme, activePanel, handleRun } = useEditor();

  const handleKeyDown = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    },
    [handleRun]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={`app-root ${theme === 'light' ? 'theme-light' : 'theme-dark'}`}>
      <Toolbar />
      <div className="app-body">
        <Sidebar />
        {activePanel && (
          <div className="secondary-panel">
            {activePanel === 'files'      && <FileManager />}
            {activePanel === 'collab'     && <CollabPanel />}
            {activePanel === 'extensions' && <ExtensionPanel />}
          </div>
        )}
        <EditorPanel />
        <div className="right-panel">
          <InputPanel />
          <OutputConsole />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <EditorProvider>
      <RoomProvider>
        <AppLayout />
      </RoomProvider>
    </EditorProvider>
  );
}
