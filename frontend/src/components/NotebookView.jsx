/**
 * NotebookView — collection of code cells, like a Jupyter notebook.
 */

import { Plus } from 'lucide-react';
import useNotebookStore from '../stores/notebookStore';
import NotebookCell from './NotebookCell';

export default function NotebookView() {
  const { cells, addCell } = useNotebookStore();

  if (cells.length === 0) {
    return (
      <div className="notebook-empty" id="notebook-view">
        <div className="empty-state">
          <span className="empty-icon">📓</span>
          <h3>Interactive Notebook</h3>
          <p>
            When you analyze a file, AI-generated code snippets will appear
            here. You can edit and run them in one click!
          </p>
          <button className="btn-secondary" onClick={() => addCell()}>
            <Plus size={16} />
            Add empty cell
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="notebook-view" id="notebook-view">
      <div className="notebook-header">
        <h3>📓 Notebook</h3>
        <button className="btn-secondary" onClick={() => addCell()}>
          <Plus size={16} />
          Add Cell
        </button>
      </div>
      <div className="cells-container">
        {cells.map((cell) => (
          <NotebookCell key={cell.id} cell={cell} />
        ))}
      </div>
    </div>
  );
}
