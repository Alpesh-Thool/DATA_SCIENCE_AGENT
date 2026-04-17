/**
 * ChartPanel — renders Plotly charts from visualization specs.
 */

import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { BarChart3 } from 'lucide-react';

export default function ChartPanel({ visualizations = [] }) {
  if (visualizations.length === 0) {
    return (
      <div className="chart-panel-empty" id="chart-panel">
        <div className="empty-state">
          <BarChart3 size={40} className="empty-icon-svg" />
          <h3>Visualizations</h3>
          <p>Charts and graphs will appear here after analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-panel" id="chart-panel">
      <h3 className="chart-panel-title">
        <BarChart3 size={18} />
        Visualizations
      </h3>
      <div className="charts-grid">
        {visualizations.map((viz, idx) => (
          <div key={idx} className="chart-card">
            <h4 className="chart-title">{viz.title}</h4>
            <Plot
              data={viz.plotly_json.data || []}
              layout={{
                ...(viz.plotly_json.layout || {}),
                autosize: true,
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'rgba(255,255,255,0.03)',
                font: { color: '#c9d1d9', family: 'Inter, sans-serif' },
                margin: { t: 30, r: 20, b: 40, l: 50 },
              }}
              config={{
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
              }}
              useResizeHandler
              className="plotly-chart"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
