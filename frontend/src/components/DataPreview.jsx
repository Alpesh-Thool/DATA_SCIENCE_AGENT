/**
 * DataPreview — renders the first rows of uploaded data as a styled table.
 */

import { Database, Rows3, Columns3 } from 'lucide-react';
import useSessionStore from '../stores/sessionStore';

export default function DataPreview() {
  const { fileId, fileName, rowCount, columnCount, columns, preview } =
    useSessionStore();

  if (!fileId || preview.length === 0) return null;

  const columnNames = columns.map((c) => c.name);

  return (
    <div className="data-preview" id="data-preview">
      {/* Header stats */}
      <div className="preview-header">
        <h3 className="preview-title">
          <Database size={18} />
          Data Preview
        </h3>
        <div className="preview-stats">
          <span className="stat-badge">
            <Rows3 size={14} />
            {rowCount.toLocaleString()} rows
          </span>
          <span className="stat-badge">
            <Columns3 size={14} />
            {columnCount} columns
          </span>
        </div>
      </div>

      {/* Column type pills */}
      <div className="column-pills">
        {columns.map((col) => (
          <span
            key={col.name}
            className={`column-pill ${col.dtype.includes('int') || col.dtype.includes('float') ? 'numeric' : col.dtype.includes('datetime') ? 'datetime' : 'text'}`}
            title={`${col.name} (${col.dtype}) — ${col.null_count} nulls, ${col.unique_count} unique`}
          >
            {col.name}
            <span className="pill-type">{col.dtype}</span>
          </span>
        ))}
      </div>

      {/* Data table */}
      <div className="table-container">
        <table className="data-table" id="data-table">
          <thead>
            <tr>
              <th className="row-num">#</th>
              {columnNames.map((name) => (
                <th key={name}>{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, idx) => (
              <tr key={idx}>
                <td className="row-num">{idx + 1}</td>
                {columnNames.map((name) => (
                  <td key={name} className={row[name] === null ? 'null-cell' : ''}>
                    {row[name] === null ? (
                      <span className="null-badge">null</span>
                    ) : typeof row[name] === 'number' ? (
                      <span className="num-value">{row[name]}</span>
                    ) : (
                      String(row[name])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="preview-note">
        Showing first {preview.length} of {rowCount.toLocaleString()} rows
      </p>
    </div>
  );
}
