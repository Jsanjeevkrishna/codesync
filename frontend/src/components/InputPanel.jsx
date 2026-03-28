import { useEditor } from '../context/EditorContext';

export default function InputPanel() {
  const { activeFile, updateFile } = useEditor();
  if (!activeFile) return null;

  return (
    <div className="input-panel">
      <div className="panel-header">
        <span className="panel-title">⌨️ Standard Input (stdin)</span>
      </div>
      <textarea
        className="stdin-textarea"
        value={activeFile.stdin}
        onChange={(e) => updateFile(activeFile.id, { stdin: e.target.value })}
        placeholder="Enter program input here…"
        spellCheck={false}
      />
    </div>
  );
}
