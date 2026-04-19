/**
 * ChartPanel — renders Plotly charts from visualization specs.
 */

import { useEffect, useRef } from 'react';
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
          <PlotlyCard key={idx} viz={viz} />
        ))}
      </div>
    </div>
  );
}

/**
 * Renders a single Plotly chart using the raw Plotly.js API (no react-plotly.js).
 * This avoids all ESM/CJS interop issues with react-plotly.js.
 */
function PlotlyCard({ viz }) {
  const chartRef = useRef(null);
  const plotlyJson = viz?.plotly_json || {};
  const data = plotlyJson.data || [];
  const layout = plotlyJson.layout || {};

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    let Plotly;
    import('plotly.js-dist-min').then((mod) => {
      Plotly = mod.default || mod;
      Plotly.newPlot(chartRef.current, data, {
        ...layout,
        autosize: true,
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'rgba(255,255,255,0.03)',
        font: { color: '#c9d1d9', family: 'Inter, sans-serif' },
        margin: { t: 30, r: 20, b: 40, l: 50 },
      }, {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
      });
    }).catch((err) => {
      console.error('Failed to load Plotly:', err);
    });

    return () => {
      if (chartRef.current && Plotly) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [data, layout]);

  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <h4 className="chart-title">{viz?.title || 'Chart'}</h4>
        <p style={{ color: '#9ca3af', padding: '1rem', textAlign: 'center' }}>
          No chart data available.
        </p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h4 className="chart-title">{viz?.title || 'Chart'}</h4>
      <div ref={chartRef} className="plotly-chart" style={{ width: '100%', minHeight: '300px' }} />
    </div>
  );
}
