const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const source = fs.readFileSync('C4143-DVScale-Dashboard.user.js', 'utf8');
const refresh = source.match(/p\.panel\.querySelectorAll\('\.caserow'\)\.forEach\(function \(row\) \{[\s\S]*?\n        \}\);/);
assert(refresh, 'case outcome refresh loop exists');
const cases = ['Passed', 'Failed', 'Blocked', 'Not Applicable', 'Active'].map(outcome => ({ latestTestPoint: { outcome } }));
const rows = cases.map(testCase => {
  const row = { _case: testCase, badge: null };
  row.badge = { replaceWith(value) { row.badge = value; } };
  row.querySelector = selector => selector === '.case-outcome-badge' ? row.badge : null;
  return row;
});
const D = { caseOutcome: item => item.latestTestPoint, testResultBadge: result => ({ outcome: result.outcome, classList: { add(value) { assert.equal(value, 'case-outcome-badge'); } } }) };
const p = { panel: { querySelectorAll: () => rows } };
vm.runInNewContext(refresh[0], { D, p });
assert.deepStrictEqual(rows.map(row => row.badge.outcome), cases.map(item => item.latestTestPoint.outcome));
console.log('PASS: five delayed case outcomes update from the same case objects used for statistics');
