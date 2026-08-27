import { useEffect, useRef, useState, useCallback } from 'react'
import { getWebMcpToolDefinitions, isWebMcpSupported } from '../lib/webmcp'

export const WEBMCP_STATUS = {
  DISABLED: 'disabled',
  UNSUPPORTED: 'unsupported',
  REGISTERING: 'registering',
  READY: 'ready',
  ERROR: 'error',
}

/**
 * Registers Betatrace's three WebMCP tools (get_demo_state, log_demo_entry,
 * reset_demo_data) via the native document.modelContext.registerTool() API
 * while `enabled` is true, and cleanly unregisters them (via AbortController)
 * when it goes false or the hook unmounts.
 *
 * `enabled` should be the guest-mode flag - WebMCP tools must only exist for
 * the guest demo, never for an authenticated session. `getSettings` is an
 * optional () => settings getter so get_demo_state can read the live glucose
 * unit without forcing a re-registration whenever settings change.
 */
export function useWebMcpTools({ enabled, getSettings } = {}) {
  const [status, setStatus] = useState(enabled ? WEBMCP_STATUS.REGISTERING : WEBMCP_STATUS.DISABLED)
  const registeredRef = useRef(false)
  const getSettingsRef = useRef(getSettings)

  useEffect(() => {
    getSettingsRef.current = getSettings
  }, [getSettings])

  const getSettingsStable = useCallback((...args) => getSettingsRef.current?.(...args), [])

  useEffect(() => {
    if (!enabled) {
      setStatus(WEBMCP_STATUS.DISABLED)
      return undefined
    }

    if (!isWebMcpSupported()) {
      setStatus(WEBMCP_STATUS.UNSUPPORTED)
      return undefined
    }

    // Guards against duplicate live registrations from rerenders/StrictMode;
    // each registration is always torn down (see cleanup) before a new one starts.
    if (registeredRef.current) {
      return undefined
    }
    registeredRef.current = true

    let cancelled = false
    const controller = new AbortController()
    setStatus(WEBMCP_STATUS.REGISTERING)

    // Defer registration by one microtask so React StrictMode's intentional
    // setup/cleanup probe can cancel its throwaway effect before any native
    // tools are registered. Without this, the second setup can race the
    // first abort and falsely report duplicate-registration failure.
    Promise.resolve()
      .then(() => {
        if (cancelled) return []
        const tools = getWebMcpToolDefinitions({ getSettings: getSettingsStable })
        return Promise.all(
          tools.map((tool) => Promise.resolve(document.modelContext.registerTool(tool, controller.signal)))
        )
      })
      .then(() => {
        if (!cancelled) setStatus(WEBMCP_STATUS.READY)
      })
      .catch((err) => {
        console.error('WebMCP tool registration failed.', err)
        if (!cancelled) setStatus(WEBMCP_STATUS.ERROR)
      })

    return () => {
      cancelled = true
      controller.abort()
      registeredRef.current = false
    }
  }, [enabled, getSettingsStable])

  return status
}
