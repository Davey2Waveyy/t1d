import { useState } from 'react'
import {
  CheckCircle,
  Clock,
  CloudUpload,
  FileUp,
  Lock,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useSettings } from '../../contexts/SettingsContext'
import { getIntegrationAccess } from '../../lib/dashboardAccess'
import { syncNightscoutToSupabase } from '../../lib/nightscoutService'
import './DexcomImport.css'

export default function DexcomImport({ onOpenSettings }) {
  const { settings } = useSettings()
  const { user, isGuest } = useAuth()
  const access = getIntegrationAccess({ user, isGuest })
  const [dragOver, setDragOver] = useState(false)
  const [uploadState, setUploadState] = useState('idle')
  const [syncState, setSyncState] = useState('idle')
  const [syncMsg, setSyncMsg] = useState('')
  const [lastSync, setLastSync] = useState(null)

  const hasNightscout = Boolean(settings.nightscoutUrl?.trim() && settings.nightscoutToken?.trim())

  const handleSync = async () => {
    if (!hasNightscout) {
      return
    }

    setSyncState('syncing')
    setSyncMsg('')

    try {
      const result = await syncNightscoutToSupabase(
        settings.nightscoutUrl,
        settings.nightscoutToken,
        24
      )

      const now = new Date().toLocaleString()
      setLastSync(now)
      setSyncState('success')
      setSyncMsg(`Synced ${result.inserted} new reading${result.inserted === 1 ? '' : 's'} from ${result.total} fetched entries.`)
    } catch (err) {
      setSyncState('error')
      setSyncMsg(err.message || 'Sync failed')
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    setUploadState('uploading')
    setTimeout(() => setUploadState('success'), 1800)
  }

  if (access.showLockedPreview) {
    return (
      <section className="sync-panel sync-panel--locked">
        <div className="sync-panel-header">
          <div>
            <span className="sync-eyebrow">Nightscout + Dexcom</span>
            <h3>Preview only in guest mode</h3>
          </div>
          <span className="sync-status sync-status--locked">
            <Lock size={12} /> Locked
          </span>
        </div>
        <p className="sync-copy">
          Signed-in users can enter Nightscout credentials for the current session, trigger sync, and keep the Dexcom CSV import workflow visible in the dashboard.
        </p>
        <div className="sync-preview-list">
          <div className="sync-preview-item">
            <Wifi size={14} />
            <span>Live Nightscout sync status and manual refresh</span>
          </div>
          <div className="sync-preview-item">
            <FileUp size={14} />
            <span>Dexcom Clarity CSV drag-and-drop import surface</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="sync-panel">
      <div className="sync-panel-header">
        <div>
          <span className="sync-eyebrow">Nightscout + Dexcom</span>
          <h3>Import and live sync</h3>
        </div>
        <span className="sync-status">
          {hasNightscout ? <Wifi size={12} /> : <WifiOff size={12} />}
          {hasNightscout ? 'Connected' : 'Needs setup'}
        </span>
      </div>

      <div className="sync-status-card">
        <div className="sync-status-card__top">
          <div>
            <h4>Nightscout connection</h4>
            <p>
              {hasNightscout
                ? settings.nightscoutUrl
                : 'Add your Nightscout URL and API secret in Settings. They stay in session memory only.'}
            </p>
          </div>
          {hasNightscout ? (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleSync}
              disabled={syncState === 'syncing'}
              type="button"
            >
              <RefreshCw size={14} className={syncState === 'syncing' ? 'ns-spin' : ''} />
              {syncState === 'syncing' ? 'Syncing...' : 'Sync Now'}
            </button>
          ) : onOpenSettings ? (
            <button className="btn btn-secondary btn-sm" type="button" onClick={onOpenSettings}>
              Open Settings
            </button>
          ) : null}
        </div>

        <div className="sync-meta-row">
          {lastSync ? (
            <span className="sync-meta-chip">
              <Clock size={12} /> Last sync {lastSync}
            </span>
          ) : (
            <span className="sync-meta-chip">No sync in this session yet</span>
          )}
          {syncState === 'success' && (
            <span className="sync-meta-chip sync-meta-chip--success">
              <CheckCircle size={12} /> {syncMsg}
            </span>
          )}
          {syncState === 'error' && (
            <span className="sync-meta-chip sync-meta-chip--error">{syncMsg}</span>
          )}
        </div>
      </div>

      <div
        className={`sync-dropzone ${dragOver ? 'sync-dropzone--active' : ''} ${uploadState === 'success' ? 'sync-dropzone--success' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {uploadState === 'idle' && (
          <>
            <div className="sync-dropzone-icon"><CloudUpload size={26} /></div>
            <div className="sync-dropzone-copy">
              <h4>Dexcom Clarity CSV</h4>
              <p>Drop a Clarity export here to keep the manual import path visible while direct sync is optional.</p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => {
                setUploadState('uploading')
                setTimeout(() => setUploadState('success'), 1800)
              }}
            >
              <FileUp size={14} /> Simulate Import
            </button>
          </>
        )}

        {uploadState === 'uploading' && (
          <div className="sync-upload-state">
            <RefreshCw size={18} className="ns-spin" />
            <span>Processing Dexcom CSV...</span>
          </div>
        )}

        {uploadState === 'success' && (
          <div className="sync-upload-state sync-upload-state--success">
            <CheckCircle size={18} />
            <span>Sample import completed. Replace this stub with the real parser when ready.</span>
          </div>
        )}
      </div>
    </section>
  )
}
