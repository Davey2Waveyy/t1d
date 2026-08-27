import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getWebMcpToolDefinitions, isWebMcpSupported, WEBMCP_TOOL_NAMES } from '../lib/webmcp';
import { getDemoSnapshot, getDemoRangeSnapshot, DemoValidationError } from '../lib/dataService';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  delete document.modelContext;
});

describe('isWebMcpSupported', () => {
  it('is false when document.modelContext is missing', () => {
    delete document.modelContext;
    expect(isWebMcpSupported()).toBe(false);
  });

  it('is true when document.modelContext.registerTool exists', () => {
    document.modelContext = { registerTool: () => {} };
    expect(isWebMcpSupported()).toBe(true);
  });
});

describe('getWebMcpToolDefinitions', () => {
  function buildTools() {
    return getWebMcpToolDefinitions({ getSettings: () => ({ glucoseUnit: 'mg/dL' }) });
  }

  it('registers exactly three tools with the expected names', () => {
    const tools = buildTools();
    expect(tools).toHaveLength(3);
    expect(tools.map((tool) => tool.name)).toEqual(WEBMCP_TOOL_NAMES);
    expect(tools.map((tool) => tool.name)).toEqual(['get_demo_state', 'log_demo_entry', 'reset_demo_data']);
  });

  it('has no dose-calculation or recommendation tool', () => {
    const names = buildTools().map((tool) => tool.name);
    expect(names).not.toContain('recommend_dose');
    expect(names).not.toContain('calculate_dose');
    expect(names).not.toContain('correction_factor');
    expect(names.filter((name) => /dose|correction|recommend/i.test(name))).toHaveLength(0);
  });

  it('every tool has a name, description, and inputSchema', () => {
    for (const tool of buildTools()) {
      expect(typeof tool.name).toBe('string');
      expect(typeof tool.description).toBe('string');
      expect(tool.description.length).toBeGreaterThan(10);
      expect(tool.inputSchema.type).toBe('object');
      expect(typeof tool.execute).toBe('function');
    }
  });

  it('marks get_demo_state read-only and untrusted-content, with an optional closed range schema', () => {
    const tool = buildTools().find((t) => t.name === 'get_demo_state');
    expect(tool.annotations).toEqual({ readOnlyHint: true, untrustedContentHint: true });
    expect(tool.inputSchema.additionalProperties).toBe(false);
    expect(tool.inputSchema.properties.range.enum).toEqual(['current', '7d']);
    expect(tool.inputSchema.properties.range.default).toBe('current');
  });

  it('log_demo_entry requires at least one of glucose/meal/insulin and closes every object level', () => {
    const tool = buildTools().find((t) => t.name === 'log_demo_entry');
    expect(tool.inputSchema.additionalProperties).toBe(false);
    expect(tool.inputSchema.properties.glucose.additionalProperties).toBe(false);
    expect(tool.inputSchema.properties.meal.additionalProperties).toBe(false);
    expect(tool.inputSchema.properties.insulin.additionalProperties).toBe(false);
    expect(tool.inputSchema.anyOf).toEqual([
      { required: ['glucose'] },
      { required: ['meal'] },
      { required: ['insulin'] },
    ]);
  });

  it("log_demo_entry's description states it only records values and never calculates or recommends", () => {
    const tool = buildTools().find((t) => t.name === 'log_demo_entry');
    expect(tool.description).toMatch(/records/i);
    expect(tool.description).toMatch(/never calculates?, estimates?, or recommends?/i);
    expect(tool.annotations.readOnlyHint).toBe(false);
  });

  it('reset_demo_data requires confirm: true in its schema', () => {
    const tool = buildTools().find((t) => t.name === 'reset_demo_data');
    expect(tool.inputSchema.required).toEqual(['confirm']);
    expect(tool.inputSchema.properties.confirm.const).toBe(true);
    expect(tool.inputSchema.additionalProperties).toBe(false);
  });
});

describe('get_demo_state execute', () => {
  function tool(name) {
    return getWebMcpToolDefinitions({ getSettings: () => ({ glucoseUnit: 'mg/dL' }) }).find((t) => t.name === name);
  }

  it('returns a synthetic snapshot with no dosing, correction, A1C, or active-insulin fields', async () => {
    const result = await tool('get_demo_state').execute({}, {});

    expect(result.synthetic).toBe(true);
    expect(result.glucose).toHaveProperty('current');
    expect(result.glucose).toHaveProperty('unit');
    expect(result.glucose).toHaveProperty('timeInRangePercent');
    expect(result.today).toHaveProperty('carbsGrams');
    expect(result.today).toHaveProperty('insulinUnits');
    expect(result.safety).toMatch(/not medical advice/i);

    expect(result).not.toHaveProperty('recommendedDose');
    expect(result).not.toHaveProperty('doseRecommendation');
    expect(result).not.toHaveProperty('correctionFactor');
    expect(result.glucose).not.toHaveProperty('estimatedA1C');
    expect(result.today).not.toHaveProperty('activeInsulin');
    expect(result.today).not.toHaveProperty('activeInsulinUnits');

    // The safety disclaimer is the one place these words are expected (to
    // say what this tool does NOT do); everything else in the payload
    // should stay free of them.
    const { safety: _safety, ...rest } = result;
    const serialized = JSON.stringify(rest).toLowerCase();
    expect(serialized).not.toMatch(/a1c/);
    expect(serialized).not.toMatch(/activeinsulin/);
    expect(serialized).not.toMatch(/recommend/);
    expect(serialized).not.toMatch(/correction/);
  });

  it("reports each recent entry's provenance", async () => {
    await tool('log_demo_entry').execute({ glucose: { value: 111, unit: 'mg/dL' } }, {});
    const result = await tool('get_demo_state').execute({}, {});
    expect(result.recent.glucose[0].source).toBe('webmcp');
  });

  it('returns the same full seven-day timeline used by the chart, with aligned meal provenance', async () => {
    const created = await tool('log_demo_entry').execute({
      glucose: { value: 137, unit: 'mg/dL' },
      meal: { foodName: 'WebMCP marker meal', carbs: 42, mealType: 'lunch' },
    }, {});
    const result = await tool('get_demo_state').execute({ range: '7d' }, {});
    const chartRange = getDemoRangeSnapshot(24 * 7);
    const times = result.history.glucose.map((reading) => new Date(reading.recordedAt).getTime());

    expect(result.range).toBe('7d');
    expect(result.history.unit).toBe('mg/dL');
    expect(result.history.coverageStart).toBeTruthy();
    expect(result.history.coverageEnd).toBeTruthy();
    expect(times.at(-1) - times[0]).toBeGreaterThan(6 * 24 * 60 * 60 * 1000);
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(result.history.glucose.map((reading) => reading.id)).toEqual(chartRange.glucose.map((reading) => reading.id));
    expect(result.history.glucose.find((reading) => reading.id === created.created.glucose.id)?.source).toBe('webmcp');
    expect(result.history.meals.find((meal) => meal.id === created.created.meal.id)).toMatchObject({
      foodName: 'WebMCP marker meal',
      carbs: 42,
      source: 'webmcp',
    });
  });

  it('rejects an invalid range without mutating demo data', async () => {
    const before = getDemoSnapshot();
    await expect(tool('get_demo_state').execute({ range: '30d' }, {})).rejects.toThrow(DemoValidationError);
    expect(getDemoSnapshot()).toEqual(before);
  });

  it('rejects an already-aborted signal without mutating anything', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(tool('get_demo_state').execute({}, { signal: controller.signal })).rejects.toThrow();
  });
});

describe('log_demo_entry execute', () => {
  function tool(name) {
    return getWebMcpToolDefinitions({}).find((t) => t.name === name);
  }

  it('creates all requested records and returns ids and normalized values without echoing notes', async () => {
    const result = await tool('log_demo_entry').execute(
      {
        glucose: { value: 6.1, unit: 'mmol/L', notes: 'secret note' },
        meal: { foodName: 'Toast', carbs: 30, mealType: 'breakfast', notes: 'secret note' },
        insulin: { units: 4, insulinType: 'bolus', notes: 'secret note' },
      },
      {}
    );

    expect(result.created.glucose.id).toBeTruthy();
    expect(result.created.meal.id).toBeTruthy();
    expect(result.created.insulin.id).toBeTruthy();
    expect(result.created.glucose.value).toBeCloseTo(109.8, 1);
    expect(JSON.stringify(result)).not.toMatch(/secret note/);
  });

  it('marks created records source: webmcp', async () => {
    await tool('log_demo_entry').execute({ glucose: { value: 100, unit: 'mg/dL' } }, {});
    expect(getDemoSnapshot().glucose[0].source).toBe('webmcp');
  });

  it('rejects a request with none of glucose, meal, or insulin, and makes zero mutations', async () => {
    const before = getDemoSnapshot();
    await expect(tool('log_demo_entry').execute({}, {})).rejects.toThrow(DemoValidationError);
    expect(getDemoSnapshot()).toEqual(before);
  });

  it('rejects invalid input and makes zero mutations, even alongside a valid sibling field', async () => {
    const before = getDemoSnapshot();
    await expect(
      tool('log_demo_entry').execute(
        { glucose: { value: 9999, unit: 'mg/dL' }, meal: { foodName: 'Toast', carbs: 10, mealType: 'snack' } },
        {}
      )
    ).rejects.toThrow(DemoValidationError);
    expect(getDemoSnapshot()).toEqual(before);
  });

  it('does not mutate when the signal is already aborted before the write', async () => {
    const before = getDemoSnapshot();
    const controller = new AbortController();
    controller.abort();
    await expect(
      tool('log_demo_entry').execute({ glucose: { value: 100, unit: 'mg/dL' } }, { signal: controller.signal })
    ).rejects.toThrow();
    expect(getDemoSnapshot()).toEqual(before);
  });
});

describe('reset_demo_data execute', () => {
  function tool(name) {
    return getWebMcpToolDefinitions({}).find((t) => t.name === name);
  }

  it('requires confirm: true and makes no changes without it', async () => {
    await tool('log_demo_entry').execute({ glucose: { value: 100, unit: 'mg/dL' } }, {});
    const before = getDemoSnapshot();

    await expect(tool('reset_demo_data').execute({}, {})).rejects.toThrow(DemoValidationError);
    await expect(tool('reset_demo_data').execute({ confirm: false }, {})).rejects.toThrow(DemoValidationError);

    expect(getDemoSnapshot()).toEqual(before);
  });

  it('clears added demo entries when confirmed and refreshes immediately', async () => {
    await tool('log_demo_entry').execute({ glucose: { value: 100, unit: 'mg/dL' } }, {});
    expect(getDemoSnapshot().glucose[0].source).toBe('webmcp');

    const result = await tool('reset_demo_data').execute({ confirm: true }, {});

    expect(result.reset).toBe(true);
    expect(getDemoSnapshot().glucose.some((r) => r.source)).toBe(false);
  });
});
