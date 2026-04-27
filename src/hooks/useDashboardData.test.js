import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import * as dataService from '../lib/dataService';
import { useDashboardData } from './useDashboardData';

vi.mock('../lib/dataService');

beforeEach(() => {
  vi.clearAllMocks();
  dataService.getGlucoseReadings.mockResolvedValue({
    data: [{ value: 110, recorded_at: new Date().toISOString() }],
    error: null,
  });
  dataService.getMeals.mockResolvedValue({ data: [], error: null });
  dataService.getInsulinDoses.mockResolvedValue({ data: [], error: null });
  dataService.calculateStats.mockReturnValue({
    currentGlucose: 110,
    glucoseTrend: 'stable',
    timeInRange: 100,
    activeInsulin: 0,
    carbsToday: 0,
    insulinToday: 0,
    avgGlucose: 110,
    estimatedA1C: 5.5,
    standardDeviation: 0,
  });
});

describe('useDashboardData', () => {
  it('fetches all three streams on mount', async () => {
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(dataService.getGlucoseReadings).toHaveBeenCalledTimes(1);
    expect(dataService.getMeals).toHaveBeenCalledTimes(1);
    expect(dataService.getInsulinDoses).toHaveBeenCalledTimes(1);
    expect(result.current.stats.currentGlucose).toBe(110);
  });

  it('exposes a refresh that re-fetches', async () => {
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.refresh();

    await waitFor(() => expect(dataService.getGlucoseReadings).toHaveBeenCalledTimes(2));
  });
});
