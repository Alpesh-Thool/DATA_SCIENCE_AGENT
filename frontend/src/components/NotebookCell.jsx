/**
 * NotebookCell — a single code cell with CodeMirror editor and run button.
 */

import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Play, Trash2, Loader2, Copy, Check } from 'lucide-react';
import useNotebookStore from '../stores/notebookStore';
import useSessionStore from '../stores/sessionStore';
import { executeCode } from '../services/api';

export default function NotebookCell({ cell }) {
  const { updateCellCode, setCellRunning, setCellOutput, setCellError, removeCell } =
    useNotebookStore();
  const fileId = useSessionStore((s) => s.fileId);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    if (!fileId || !cell.code.trim()) return;
    setCellRunning(cell.id);

    try {
      const result = await executeCode(fileId, cell.code, cell.id);
      setCellOutput(cell.id, result);
    } catch (err) {
      setCellError(cell.id, err.message || 'Execution failed');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cell.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`notebook-cell ${cell.isRunning ? 'running' : ''} ${cell.error ? 'error' : ''}`} id={`cell-${cell.id}`}>
      {/* Cell header */}
      <div className="cell-header">
        <span className="cell-indicator">{cell.isRunning ? '⏳' : '▶'}</span>
        {cell.title && <span className="cell-title">{cell.title}</span>}
        <div className="cell-actions">
          <button
            className="cell-btn copy"
            onClick={handleCopy}
            title="Copy code"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button
            className="cell-btn run"
            onClick={handleRun}
            disabled={cell.isRunning || !fileId}
            title="Run cell"
          >
            {cell.isRunning ? <Loader2 size={14} className="spin" /> : <Play size={14} />}
            Run
          </button>
          <button
            className="cell-btn delete"
            onClick={() => removeCell(cell.id)}
            title="Delete cell"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Code editor */}
      <div className="cell-editor">
        <CodeMirror
          value={cell.code}
          height="auto"
          minHeight="60px"
          maxHeight="400px"
          extensions={[python()]}
          onChange={(val) => updateCellCode(cell.id, val)}
          theme="dark"
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
            autocompletion: true,
          }}
        />
      </div>

      {/* Output area */}
      {cell.output && (
        <div className="cell-output">
          {cell.output.stdout && (
            <pre className="output-stdout">{cell.output.stdout}</pre>
          )}
          {cell.output.stderr && (
            <pre className="output-stderr">{cell.output.stderr}</pre>
          )}
          {cell.output.error && (
            <pre className="output-error">{cell.output.error}</pre>
          )}
        </div>
      )}

      {/* Error display */}
      {cell.error && (
        <div className="cell-output">
          <pre className="output-error">{cell.error}</pre>
        </div>
      )}
    </div>
  );
}
