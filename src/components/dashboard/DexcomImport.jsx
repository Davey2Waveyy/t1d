import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, CloudUpload } from 'lucide-react';
import './DexcomImport.css';

export default function DexcomImport() {
  const [dragOver, setDragOver] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    setUploadState('uploading');
    setTimeout(() => setUploadState('success'), 2000);
  };

  return (
    <div className="dexcom-import">
      <div className="module-header">
        <div>
          <h1 className="module-title">Dexcom Import</h1>
          <p className="module-subtitle">Import your CGM data from Dexcom Clarity</p>
        </div>
      </div>

      <div className="dexcom-grid">
        <div
          className={`card dexcom-dropzone ${dragOver ? 'dexcom-dropzone--active' : ''} ${uploadState === 'success' ? 'dexcom-dropzone--success' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploadState === 'idle' && (
            <>
              <div className="dropzone-icon"><CloudUpload size={48} /></div>
              <h3 className="dropzone-title">Drop your Clarity export here</h3>
              <p className="dropzone-desc">Supports .csv files from Dexcom Clarity</p>
              <button className="btn btn-primary" onClick={() => { setUploadState('uploading'); setTimeout(() => setUploadState('success'), 2000); }}>
                <Upload size={16} /> Browse Files
              </button>
            </>
          )}
          {uploadState === 'uploading' && (
            <div className="upload-progress">
              <div className="upload-spinner" />
              <p className="dropzone-title">Processing CGM data...</p>
              <div className="upload-bar"><div className="upload-bar-fill" /></div>
            </div>
          )}
          {uploadState === 'success' && (
            <div className="upload-success">
              <CheckCircle size={48} />
              <h3 className="dropzone-title">Import Successful!</h3>
              <p className="dropzone-desc">1,247 glucose readings imported</p>
              <button className="btn btn-secondary" onClick={() => setUploadState('idle')}>Import Another</button>
            </div>
          )}
        </div>

        <div className="dexcom-info">
          <div className="card dexcom-guide">
            <h3 className="card-title">How to Export from Clarity</h3>
            <ol className="guide-steps">
              <li><span className="guide-step-num">1</span> Log in to <strong>clarity.dexcom.com</strong></li>
              <li><span className="guide-step-num">2</span> Navigate to <strong>Reports</strong></li>
              <li><span className="guide-step-num">3</span> Select date range and click <strong>Export</strong></li>
              <li><span className="guide-step-num">4</span> Choose <strong>CSV format</strong></li>
              <li><span className="guide-step-num">5</span> Upload the file here</li>
            </ol>
          </div>

          <div className="card dexcom-status">
            <h3 className="card-title">Connection Status</h3>
            <div className="status-item">
              <div className="status-dot status-dot--connected" />
              <div>
                <span className="status-label">Dexcom G7</span>
                <span className="status-detail">Last sync: 2 hours ago</span>
              </div>
            </div>
            <div className="status-item">
              <div className="status-dot status-dot--pending" />
              <div>
                <span className="status-label">Dexcom Clarity API</span>
                <span className="status-detail">Connection available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
