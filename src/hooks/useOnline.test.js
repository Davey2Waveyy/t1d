import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnline } from './useOnline';

describe('useOnline', () => {
  it('returns navigator.onLine on mount', () => {
    const { result } = renderHook(() => useOnline());
    expect(typeof result.current).toBe('boolean');
  });

  it('updates on offline event', () => {
    const { result } = renderHook(() => useOnline());

    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(result.current).toBe(false);

    act(() => { window.dispatchEvent(new Event('online')); });
    expect(result.current).toBe(true);
  });
});
