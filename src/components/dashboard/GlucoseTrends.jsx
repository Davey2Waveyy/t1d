import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Area, ComposedChart } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { glucoseReadings, weeklyGlucose, timeInRangeData, currentStats } from '../../data/mockData';
import './GlucoseTrends.css';

const timeRanges = ['6h', '12h', '24h', '7d'];

export default function GlucoseTrends() {
  const [range, setRange] = useState('24h');
  
  const getFilteredData = () => {
    const now = Date.now();
    const hours = { '6h': 6, '12h': 12, '24h': 24, '7d': 168 };
    const cutoff = now - hours[range] * 3600000;
    if (range === '7d') {
      return weeklyGlucose;
    }
    return glucoseReadings
      .filter((r) => new Date(r.time).getTime() > cutoff)
      .filter((_, i) => i % (range === '6h' ? 1 : 2) === 0)
      .map((r) => ({ ...r, time: r.timeLabel }));
  };

  const data = getFilteredData();
  const is7d = range === '7d';

  return (
    <div className="glucose-trends">
      <div className="module-header">
        <div>
          <h1 className="module-title">Glucose Trends</h1>
          <p className="module-subtitle">Monitor your glucose patterns and time in range</p>
        </div>
        <div className="range-tabs">
          {timeRanges.map((r) => (
            <button key={r} className={`range-tab ${range === r ? 'range-tab--active' : ''}`} onClick={() => setRange(r)}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="card glucose-main-chart">
        <div className="card-header">
          <h3 className="card-title">{is7d ? 'Weekly Average Glucose' : `${range} Glucose`}</h3>
          <div className="glucose-chart-stats">
            <span className="chart-stat"><span className="chart-stat-dot" style={{ background: 'var(--accent-teal)' }} />In Range (70-180)</span>
            <span className="chart-stat"><span className="chart-stat-dot" style={{ background: 'var(--accent-amber)' }} />High</span>
            <span className="chart-stat"><span className="chart-stat-dot" style={{ background: 'var(--accent-rose)' }} />Low</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          {is7d ? (
            <ComposedChart data={data}>
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[40, 280]} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} unit=" " />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', color: 'var(--text-light)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }} />
              <ReferenceLine y={180} stroke="var(--accent-amber)" strokeDasharray="4 4" strokeOpacity={0.4} />
              <ReferenceLine y={70} stroke="var(--accent-rose)" strokeDasharray="4 4" strokeOpacity={0.4} />
              <Area type="monotone" dataKey="max" fill="var(--accent-teal-dim)" stroke="none" />
              <Area type="monotone" dataKey="min" fill="var(--bg-card)" stroke="none" />
              <Line type="monotone" dataKey="avg" stroke="#2DD4A8" strokeWidth={2.5} dot={{ r: 4, fill: '#2DD4A8', stroke: '#0D1B16', strokeWidth: 2 }} />
            </ComposedChart>
          ) : (
            <LineChart data={data}>
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis domain={[40, 280]} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', color: 'var(--text-light)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }} formatter={(v) => [`${v} mg/dL`]} />
              <ReferenceLine y={180} stroke="var(--accent-amber)" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: '180', position: 'left', fill: 'var(--accent-amber)', fontSize: 11 }} />
              <ReferenceLine y={70} stroke="var(--accent-rose)" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: '70', position: 'left', fill: 'var(--accent-rose)', fontSize: 11 }} />
              <Line type="monotone" dataKey="value" stroke="#2DD4A8" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#2DD4A8', stroke: '#0D1B16', strokeWidth: 2 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="glucose-bottom">
        <div className="card glucose-tir">
          <h3 className="card-title">Time in Range</h3>
          <div className="tir-chart">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={timeInRangeData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {timeInRangeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="tir-center">
              <span className="tir-value">{currentStats.timeInRange}%</span>
              <span className="tir-label">In Range</span>
            </div>
          </div>
          <div className="tir-breakdown">
            {timeInRangeData.map((item) => (
              <div key={item.name} className="tir-row">
                <span className="legend-dot" style={{ background: item.fill }} />
                <span className="tir-row-label">{item.name}</span>
                <span className="tir-row-value">{item.value}%</span>
                <div className="tir-bar"><div className="tir-bar-fill" style={{ width: `${item.value}%`, background: item.fill }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card glucose-stats-card">
          <h3 className="card-title">Statistics</h3>
          <div className="glucose-stat-rows">
            <div className="summary-row"><span className="summary-label">Average</span><span className="summary-value">{currentStats.avgGlucose} mg/dL</span></div>
            <div className="summary-row"><span className="summary-label">Std. Deviation</span><span className="summary-value">{currentStats.standardDeviation}</span></div>
            <div className="summary-row"><span className="summary-label">Est. A1C</span><span className="summary-value accent">{currentStats.estimatedA1C}%</span></div>
            <div className="summary-row"><span className="summary-label">Coefficient of Variation</span><span className="summary-value">{Math.round(currentStats.standardDeviation / currentStats.avgGlucose * 100)}%</span></div>
            <div className="summary-row"><span className="summary-label">GMI</span><span className="summary-value">{(3.31 + 0.02392 * currentStats.avgGlucose).toFixed(1)}%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
