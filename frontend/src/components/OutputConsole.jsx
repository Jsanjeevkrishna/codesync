import { useEditor } from '../context/EditorContext';

export default function OutputConsole() {
  const { output, isRunning, error } = useEditor();

  const renderContent = () => {
    if (isRunning) {
      return (
        <div className="output-loading">
          <div className="output-spinner" />
          <span>Running code on Judge0…</span>
        </div>
      );
    }

    if (error) {
      return <pre className="output-text output-error">❌ {error}</pre>;
    }

    if (!output) {
      return <span className="output-placeholder">Output will appear here after you run your code.</span>;
    }

    const { stdout, stderr, compile_output, status, time, memory } = output;

    return (
      <>
        {/* Status badge */}
        <div className={`output-status ${getStatusClass(status)}`}>
          {getStatusIcon(status)} {status}
          {time && <span className="output-meta"> · {time}s</span>}
          {memory && <span className="output-meta"> · {(memory / 1024).toFixed(1)} MB</span>}
        </div>

        {/* Compile errors */}
        {compile_output && (
          <div className="output-section">
            <span className="output-section-label">Compile Output</span>
            <pre className="output-text output-compile">{compile_output}</pre>
          </div>
        )}

        {/* stdout */}
        {stdout && (
          <div className="output-section">
            <span className="output-section-label">Output</span>
            <pre className="output-text output-stdout">{stdout}</pre>
          </div>
        )}

        {/* stderr */}
        {stderr && (
          <div className="output-section">
            <span className="output-section-label">Errors</span>
            <pre className="output-text output-stderr">{stderr}</pre>
          </div>
        )}

        {/* Empty output */}
        {!stdout && !stderr && !compile_output && (
          <span className="output-placeholder">Program produced no output.</span>
        )}
      </>
    );
  };

  return (
    <div className="output-console">
      <div className="panel-header">
        <span className="panel-title">🖥️ Output Console</span>
      </div>
      <div className="output-body">{renderContent()}</div>
    </div>
  );
}

function getStatusClass(status) {
  if (!status) return '';
  if (status === 'Accepted') return 'status-ok';
  if (status.includes('Error') || status.includes('Exception')) return 'status-error';
  if (status.includes('Time Limit')) return 'status-tle';
  return 'status-warn';
}

function getStatusIcon(status) {
  if (status === 'Accepted') return '✅';
  if (status?.includes('Error') || status?.includes('Exception')) return '❌';
  if (status?.includes('Time Limit')) return '⏱️';
  return '⚠️';
}
