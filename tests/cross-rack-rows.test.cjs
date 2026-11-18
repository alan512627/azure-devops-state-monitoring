const fs = require('fs');
const assert = require('assert');
const source = fs.readFileSync('C4143-DVScale-Dashboard.user.js', 'utf8');
const D = {};
const grab = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
eval(grab('  D.normalizedTitle = ', '\n'));
eval(grab('  D.collect = ', '\n'));
eval(grab('  D.crossRackIndex = ', '  D.crossRackOutcomeChips = '));
const tc = (id, title) => ({ id, type: 'Test Case', title });
// Rack 1 has two Cases with the same title (4131866 and 3943813); Rack 2 has one.
const racks = [
  { type: 'Feature', label: 'Rack 1', children: [tc(4131866, 'Enumerate HW'), tc(3943813, 'Enumerate HW'), tc(11, 'Other')] },
  { type: 'Feature', label: 'Rack 2', children: [tc(3943824, 'Enumerate HW')] }
];
const rows = D.crossRackRows(racks);
const ids = rows.map(r => r.cases.map(c => c && c.id));
assert.deepStrictEqual(ids, [[3943813, 3943824], [4131866, null], [11, null]], 'every Case kept, duplicates paired by Case ID');
assert.deepStrictEqual(rows.map(r => [r.dup, r.dupOf]), [[1, 2], [2, 2], [0, 1]]);
assert.strictEqual(rows.reduce((n, r) => n + r.cases.filter(Boolean).length, 0), 4, 'covers all 4 Cases of the Phase');
console.log('PASS: crossRackRows keeps every Case per Rack, including same-title duplicates');
