import { useState } from 'react';
import { Plus, Syringe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { recentInsulin, dailyInsulinBreakdown } from '../../data/mockData';
import './InsulinLog.css';

export default function InsulinLog() {
  return (
    <div className="insulin-log">
      <div className="module-header">
        <div>
          <h1 className="module-title">Insulin Log</h1>
          <p className="module-subtitle">Track your insulin doses and daily usage</p>
        </div>
        <button className="btn btn-primary btn-sm"><Plus size={16} /> Add Dose</button>
      </div>

      <div className="insulin-grid">
        <div className="card insulin-form">
          <h3 className="card-title">Log Insulin Dose</h3>
          <form className="insulin-form-inner" onSubmit={(e) => e.preventDefault()}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="insulin-amount">Units</label>
                <input className="form-input" id="insulin-amount" type="number" step="0.5" placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="insulin-type">Type</label>
                <select className="form-select" id="insulin-type">
                  <option value="bolus">Bolus (Rapid)</option>
                  <option value="basal">Basal (Long-acting)</option>
                  <option value="correction">Correction</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="insulin-brand">Brand</label>
                <select className="form-select" id="insulin-brand">
                  <option>Humalog</option>
                  <option>NovoLog</option>
                  <option>Lantus</option>
                  <option>Tresiba</option>
                  <option>Fiasp</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="insulin-site">Site</label>
                <select className="form-select" id="insulin-site">
                  <option>Abdomen</option>
                  <option>Thigh</option>
                  <option>Arm</option>
                  <option>Hip</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="insulin-time">Time</label>
              <input className="form-input" id="insulin-time" type="datetime-local" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Save Dose</button>
          </form>
        </div>

        <div className="card insulin-chart">
          <h3 className="card-title">Weekly Insulin Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyInsulinBreakdown} barGap={2}>
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} unit="u" />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', color: 'var(--text-light)', fontSize: '0.85rem' }}
                formatter={(value) => [`${value}u`]}
              />
              <Legend wrapperStyle={{ fontSize: '0.8rem', fontFamily: 'var(--font-sans)' }} />
              <Bar dataKey="basal" name="Basal" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bolus" name="Bolus" fill="#2DD4A8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="correction" name="Correction" fill="#FBBF24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Doses</h3>
        </div>
        <div className="meals-table">
          <div className="table-header">
            <span>Amount</span>
            <span>Type</span>
            <span>Brand</span>
            <span>Site</span>
            <span>Time</span>
          </div>
          {recentInsulin.map((dose) => (
            <div key={dose.id} className="table-row">
              <span className="meal-name-cell">
                <div className="meal-type-icon" style={{ background: 'var(--accent-sky-dim)', color: 'var(--accent-sky)' }}><Syringe size={14} /></div>
                <strong>{dose.amount}u</strong>
              </span>
              <span><span className={`badge ${dose.type === 'Bolus' ? 'badge-teal' : dose.type === 'Basal' ? 'badge-sky' : 'badge-amber'}`}>{dose.type}</span></span>
              <span className="text-data">{dose.brand}</span>
              <span className="text-data">{dose.site}</span>
              <span className="text-data table-time">{new Date(dose.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
