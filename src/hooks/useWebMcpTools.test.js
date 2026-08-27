import { describe, it, expect, vi, afterEach } from 'vitest';
import { StrictMode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useWebMcpTools, WEBMCP_STATUS } from './useWebMcpTools';

afterEach(() => {
  delete document.modelContext;
  localStorage.clear();
});

describe('useWebMcpTools', () => {
  it('is disabled when not enabled (non-guest session)', () => {
    document.modelContext = { registerTool: vi.fn().mockResolvedValue(undefined) };
    const { result } = renderHook(() => useWebMcpTools({ enabled: false }));
    expect(result.current).toBe(WEBMCP_STATUS.DISABLED);
  });

  it('reports unsupported when document.modelContext is missing', () => {
    delete document.modelContext;
    const { result } = renderHook(() => useWebMcpTools({ enabled: true }));
    expect(result.current).toBe(WEBMCP_STATUS.UNSUPPORTED);
  });

  it('registers exactly three tools and becomes ready', async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    document.modelContext = { registerTool };

    const { result } = renderHook(() => useWebMcpTools({ enabled: true }));

    await waitFor(() => expect(result.current).toBe(WEBMCP_STATUS.READY));

    expect(registerTool).toHaveBeenCalledTimes(3);
    const names = registerTool.mock.calls.map(([tool]) => tool.name).sort();
    expect(names).toEqual(['get_demo_state', 'log_demo_entry', 'reset_demo_data']);
  });

  it('passes a live AbortSignal as the second argument to every registerTool call', async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    document.modelContext = { registerTool };

    const { result } = renderHook(() => useWebMcpTools({ enabled: true }));
    await waitFor(() => expect(result.current).toBe(WEBMCP_STATUS.READY));

    for (const call of registerTool.mock.calls) {
      expect(call[1]).toBeInstanceOf(AbortSignal);
      expect(call[1].aborted).toBe(false);
    }
  });

  it('aborts the registration signal on unmount', async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    document.modelContext = { registerTool };

    const { result, unmount } = renderHook(() => useWebMcpTools({ enabled: true }));
    await waitFor(() => expect(result.current).toBe(WEBMCP_STATUS.READY));

    const signal = registerTool.mock.calls[0][1];
    expect(signal.aborted).toBe(false);

    unmount();

    expect(signal.aborted).toBe(true);
  });

  it('does not duplicate registration across rerenders', async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    document.modelContext = { registerTool };

    const { result, rerender } = renderHook((props) => useWebMcpTools(props), {
      initialProps: { enabled: true },
    });
    await waitFor(() => expect(result.current).toBe(WEBMCP_STATUS.READY));

    rerender({ enabled: true });
    rerender({ enabled: true });

    expect(registerTool).toHaveBeenCalledTimes(3);
  });

  it('registers only one tool set under React StrictMode', async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    document.modelContext = { registerTool };

    const { result } = renderHook(() => useWebMcpTools({ enabled: true }), {
      wrapper: StrictMode,
    });
    await waitFor(() => expect(result.current).toBe(WEBMCP_STATUS.READY));

    expect(registerTool).toHaveBeenCalledTimes(3);
  });

  it('unregisters and re-registers cleanly when enabled toggles off then on', async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    document.modelContext = { registerTool };

    const { result, rerender } = renderHook((props) => useWebMcpTools(props), {
      initialProps: { enabled: true },
    });
    await waitFor(() => expect(result.current).toBe(WEBMCP_STATUS.READY));
    const firstSignal = registerTool.mock.calls[0][1];

    rerender({ enabled: false });
    expect(result.current).toBe(WEBMCP_STATUS.DISABLED);
    expect(firstSignal.aborted).toBe(true);

    rerender({ enabled: true });
    await waitFor(() => expect(result.current).toBe(WEBMCP_STATUS.READY));
    expect(registerTool).toHaveBeenCalledTimes(6);
  });

  it('reports an error and does not crash when registration rejects', async () => {
    const registerTool = vi.fn().mockRejectedValue(new Error('registration failed'));
    document.modelContext = { registerTool };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useWebMcpTools({ enabled: true }));

    await waitFor(() => expect(result.current).toBe(WEBMCP_STATUS.ERROR));
    consoleSpy.mockRestore();
  });

  it('lets get_demo_state read the latest settings without re-registering', async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    document.modelContext = { registerTool };
    let unit = 'mg/dL';

    const { result, rerender } = renderHook((props) => useWebMcpTools(props), {
      initialProps: { enabled: true, getSettings: () => ({ glucoseUnit: unit }) },
    });
    await waitFor(() => expect(result.current).toBe(WEBMCP_STATUS.READY));

    unit = 'mmol/L';
    rerender({ enabled: true, getSettings: () => ({ glucoseUnit: unit }) });

    const getDemoState = registerTool.mock.calls.map(([tool]) => tool).find((tool) => tool.name === 'get_demo_state');
    const response = await getDemoState.execute({}, {});

    expect(response.glucose.unit).toBe('mmol/L');
    expect(registerTool).toHaveBeenCalledTimes(3);
  });
});
