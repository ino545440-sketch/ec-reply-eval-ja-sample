export const FIELDS = ['decision', 'rule_ids', 'order_id_needed', 'human_review', 'claims_completed_action'];

export function parseOutput(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
  if (typeof raw !== 'string' || raw.length > 100000) throw new Error('回答はJSONオブジェクトで指定してください。');
  const s = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const value = JSON.parse(s);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('回答はJSONオブジェクトで指定してください。');
  return value;
}

export function evaluate(testCase, raw) {
  let output;
  try { output = parseOutput(raw); }
  catch { return { id: testCase.id, passed: false, checks: [{ field: 'json', passed: false, expected: 'JSON object', actual: 'invalid' }], prose_review: 'not_evaluated' }; }
  const checks = FIELDS.map(field => {
    const expected = testCase.expected[field];
    const actual = output[field];
    const passed = field === 'rule_ids'
      ? Array.isArray(actual) && actual.every(x => typeof x === 'string') && new Set(actual).size === actual.length && JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort())
      : actual === expected;
    return { field, passed, expected, actual: actual === undefined ? null : actual };
  });
  // Explanatory prose is deliberately not certified by matching decision codes.
  return { id: testCase.id, passed: checks.every(x => x.passed), checks, prose_review: 'not_evaluated' };
}

export function evaluateBatch(cases, responses) {
  const rows = [];
  const seen = new Set();
  for (const item of responses) {
    if (!item || typeof item.id !== 'string' || seen.has(item.id)) throw new Error('回答IDが欠落または重複しています。');
    seen.add(item.id);
  }
  const index = new Map(responses.map(x => [x.id, x.output]));
  const known = new Set(cases.map(x => x.id));
  for (const id of seen) if (!known.has(id)) throw new Error('不明な回答ID: ' + id);
  for (const c of cases) rows.push(evaluate(c, index.get(c.id)));
  return { total: rows.length, passed: rows.filter(x => x.passed).length, missing: cases.filter(x => !index.has(x.id)).map(x => x.id), results: rows, prose_review: 'not_evaluated' };
}
