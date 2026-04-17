/**
 * Notebook store — manages code cells, their outputs, and execution state.
 */

import { create } from 'zustand';

let cellCounter = 0;

const createCell = (code = '', title = '') => ({
  id: `cell-${++cellCounter}`,
  title,
  code,
  output: null,
  isRunning: false,
  error: null,
});

const useNotebookStore = create((set, get) => ({
  cells: [],

  /** Add a new cell at the end. */
  addCell: (code = '', title = '') =>
    set((state) => ({
      cells: [...state.cells, createCell(code, title)],
    })),

  /** Add multiple cells at once (e.g., from analysis result). */
  addCells: (snippets) =>
    set((state) => ({
      cells: [
        ...state.cells,
        ...snippets.map((s) => createCell(s.code, s.title)),
      ],
    })),

  /** Update the code in a cell. */
  updateCellCode: (cellId, code) =>
    set((state) => ({
      cells: state.cells.map((c) =>
        c.id === cellId ? { ...c, code } : c
      ),
    })),

  /** Mark a cell as running. */
  setCellRunning: (cellId) =>
    set((state) => ({
      cells: state.cells.map((c) =>
        c.id === cellId ? { ...c, isRunning: true, error: null } : c
      ),
    })),

  /** Set the output of a cell after execution. */
  setCellOutput: (cellId, output) =>
    set((state) => ({
      cells: state.cells.map((c) =>
        c.id === cellId ? { ...c, output, isRunning: false, error: null } : c
      ),
    })),

  /** Set an error on a cell. */
  setCellError: (cellId, error) =>
    set((state) => ({
      cells: state.cells.map((c) =>
        c.id === cellId ? { ...c, error, isRunning: false } : c
      ),
    })),

  /** Remove a cell by ID. */
  removeCell: (cellId) =>
    set((state) => ({
      cells: state.cells.filter((c) => c.id !== cellId),
    })),

  /** Clear all cells. */
  clearCells: () => set({ cells: [] }),
}));

export default useNotebookStore;
