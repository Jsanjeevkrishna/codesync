import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { executeCode, getSnippets, createSnippet, deleteSnippet } from '../api/api';

const EditorContext = createContext(null);

const DEFAULT_CODE = {
  javascript: `// JavaScript\nconsole.log("Hello, World!");`,
  python: `# Python\nprint("Hello, World!")`,
  c: `// C\n#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  cpp: `// C++\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  java: `// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
};

let _nextId = 1;
const newFile = (language = 'javascript', customName = null) => ({
  id: _nextId++,
  name: customName || `untitled-${_nextId - 1}.${langExt(language)}`,
  language,
  code: DEFAULT_CODE[language] || '',
  stdin: '',
  dirty: false,
  savedToDb: false,
  dbId: null,
});

function langExt(lang) {
  return { javascript: 'js', python: 'py', c: 'c', cpp: 'cpp', java: 'java' }[lang] || 'txt';
}

export { DEFAULT_CODE, langExt };

export const EditorProvider = ({ children }) => {
  const [files, setFiles] = useState([newFile('javascript')]);
  const [activeId, setActiveId] = useState(1);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState('vs-dark');
  const [snippets, setSnippets] = useState([]);
  const [activePanel, setActivePanel] = useState('files');
  const [error, setError] = useState(null);

  const activeFile = files.find((f) => f.id === activeId) || files[0];

  // ── File CRUD ────────────────────────────────────────────────────────────
  const createNewFile = useCallback((language = 'javascript', customName = null) => {
    const f = newFile(language, customName);
    setFiles((prev) => [...prev, f]);
    setActiveId(f.id);
    setOutput(null);
  }, []);

  const closeFile = useCallback((id) => {
    setFiles((prev) => {
      if (prev.length === 1) return prev; // keep at least 1 file
      const next = prev.filter((f) => f.id !== id);
      setActiveId((cur) => (cur === id ? next[next.length - 1].id : cur));
      return next;
    });
  }, []);

  const updateFile = useCallback((id, changes) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...changes, dirty: true } : f))
    );
  }, []);

  const switchFile = useCallback((id) => {
    setActiveId(id);
    setOutput(null);
    setError(null);
  }, []);

  // Rename file (also updates extension when language changes)
  const renameFile = useCallback((id, name) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name, dirty: true } : f)));
  }, []);

  const changeFileLanguage = useCallback((id, language) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const baseName = f.name.split('.')[0] || 'untitled';
        return { ...f, language, name: `${baseName}.${langExt(language)}`, dirty: true };
      })
    );
  }, []);

  // ── Execution ────────────────────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (!activeFile) return;
    setIsRunning(true);
    setOutput(null);
    setError(null);
    try {
      const { data } = await executeCode(activeFile.language, activeFile.code, activeFile.stdin);
      setOutput(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Execution failed');
    } finally {
      setIsRunning(false);
    }
  }, [activeFile]);

  // ── Permanent Save (to MongoDB) ──────────────────────────────────────────
  const saveFileToDB = useCallback(async (id) => {
    const file = files.find((f) => f.id === id);
    if (!file) return;
    try {
      const { data } = await createSnippet({
        title: file.name,
        language: file.language,
        code: file.code,
        stdin: file.stdin,
      });
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, dirty: false, savedToDb: true, dbId: data._id } : f
        )
      );
      setSnippets((prev) => [data, ...prev.filter((s) => s._id !== data._id)]);
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    }
  }, [files]);

  // ── Snippets (DB) ────────────────────────────────────────────────────────
  const loadSnippets = useCallback(async () => {
    try {
      const { data } = await getSnippets();
      setSnippets(data);
    } catch (_) {}
  }, []);

  // Load a saved snippet as a new tab
  const loadSnippetAsFile = useCallback((snippet) => {
    const f = {
      id: _nextId++,
      name: snippet.title,
      language: snippet.language,
      code: snippet.code,
      stdin: snippet.stdin || '',
      dirty: false,
      savedToDb: true,
      dbId: snippet._id,
    };
    setFiles((prev) => [...prev, f]);
    setActiveId(f.id);
    setOutput(null);
  }, []);

  const removeSnippet = useCallback(async (id) => {
    try {
      await deleteSnippet(id);
      setSnippets((prev) => prev.filter((s) => s._id !== id));
    } catch (_) {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'vs-dark' ? 'light' : 'vs-dark'));
  }, []);

  return (
    <EditorContext.Provider
      value={{
        // Files
        files, activeFile, activeId,
        createNewFile, closeFile, updateFile, switchFile, renameFile, changeFileLanguage,
        saveFileToDB,
        // Execution
        output, isRunning, handleRun,
        // Theme
        theme, toggleTheme,
        // Snippets
        snippets, loadSnippets, loadSnippetAsFile, removeSnippet,
        // UI
        activePanel, setActivePanel,
        error, setError,
        DEFAULT_CODE,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');
  return ctx;
};
