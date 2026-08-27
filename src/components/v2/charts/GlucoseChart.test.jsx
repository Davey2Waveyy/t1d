import { describe, expect, it } from 'vitest';
import { buildGlucoseChartData, buildMealMarkerData } from './glucoseChartData';

describe('GlucoseChart data alignment', () => {
  const readings = [
    { id: 'g1', recorded_at: '2026-08-26T10:00:00.000Z', value: 110 },
    { id: 'g2', recorded_at: '2026-08-26T12:00:00.000Z', value: 145, source: 'webmcp' },
  ];

  it('keeps a WebMCP glucose reading at its exact timestamp', () => {
    const data = buildGlucoseChartData(readings, 'mg/dL');
    expect(data[1]).toMatchObject({
      t: new Date('2026-08-26T12:00:00.000Z').getTime(),
      value: 145,
      source: 'webmcp',
    });
  });

  it('places meals at their real timestamp with accessible tooltip details', () => {
    const meals = [
      {
        id: 'm1',
        logged_at: '2026-08-26T11:15:00.000Z',
        food_name: 'Whoopty',
        carbs: 23,
        meal_type: 'snack',
        source: 'webmcp',
      },
      { id: 'outside', logged_at: '2026-08-25T11:15:00.000Z', name: 'Outside range', carbs: 12 },
    ];

    expect(buildMealMarkerData(meals, readings, 48)).toEqual([
      expect.objectContaining({
        t: new Date('2026-08-26T11:15:00.000Z').getTime(),
        mealY: 48,
        mealName: 'Whoopty',
        carbs: 23,
        mealType: 'snack',
        source: 'webmcp',
      }),
    ]);
  });
});
