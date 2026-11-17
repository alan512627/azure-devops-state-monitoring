const fs = require('fs');
const assert = require('assert');
const source = fs.readFileSync('C4143-DVScale-Dashboard.user.js', 'utf8');
const D = { S: { bugList: { status: 'ok', items: [{ id: 1, created: '2026-10-20T00:00:00Z' }, { id: 9, created: '2026-10-25T00:00:00Z' }, { id: 8, created: '2026-12-01T00:00:00Z' }] } }, queryExtras: () => null };
const grab = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
eval(grab('  D.normalizedTitle = ', '\n'));
eval(grab('  D.collect = ', '\n'));
eval(grab('  D.resultOutcomeKey = ', '  D.resultOutcomeSummary = '));
eval(grab('  D.crossRackIndex = ', '  D.crossRackOutcomeChips = '));
eval(grab('  D.TEST_WINDOW = ', '  D.exportInTestCsv = '));
const b = (id, created) => ({ id, created, title: 'Bug ' + id });
const tc = (id, title, outcome, child, related) => ({ id, type: 'Test Case', title, latestTestPoint: { outcome }, childBugsRaw: child, bugs: [], relatedBugs: related });
const racks = [
  { type: 'Feature', label: 'Rack 1', children: [tc(11, 'Fan test', 'Failed', [b(1, '2026-10-20T00:00:00Z')], [b(2, '2026-10-07T15:59:00Z')]), tc(12, 'PSU test', 'Failed', [], [b(3, '2026-09-01T00:00:00Z')])] },
  { type: 'Feature', label: 'Rack 2', children: [tc(21, 'Fan test', 'Failed', [], [b(1, '2026-10-20T00:00:00Z'), b(4, '2026-11-13T15:59:00Z')])] }
];
const r = D.inTestReport(racks), fan = r.rows.find(x => x.title === 'Fan test'), psu = r.rows.find(x => x.title === 'PSU test');
assert.deepStrictEqual(fan.cells[0].inTest.map(l => l.bug.id), [1], '10/07 23:59 Taipei is outside the window');
assert.strictEqual(fan.cells[0].older, 1);
assert.deepStrictEqual(fan.cells[1].inTest.map(l => l.bug.id + l.link), ['1related', '4related'], '11/13 23:59 Taipei is inside');
assert.deepStrictEqual(fan.bugs.map(x => x.id).sort(), [1, 4]);
assert.deepStrictEqual([psu.gaps, psu.cells[1]], [1, null], 'Failed with only an older bug is a missing bug; no Case on Rack 2');
assert.deepStrictEqual([r.failedCells, r.gapCells, r.linked, r.inList], [3, 1, 2, 1]);
assert.deepStrictEqual(r.notInList.map(x => x.bug.id), [4]);
assert.deepStrictEqual(r.listOnly.map(x => x.id), [9], 'Bug List only lists in-window bugs');
const bug1 = r.byBug.find(e => e.bug.id === 1);
assert.deepStrictEqual([bug1.rackCount, bug1.caseCount, bug1.itemCount, Object.keys(bug1.racks).sort(), bug1.inList], [2, 2, 1, ['0', '1'], true], 'Bug 1 appears on Rack 1 and Rack 2');
assert.strictEqual(r.byBug[0].bug.id, 1, 'Bugs on more Racks sort first');
console.log('PASS: in-test bugs use the Taipei test window, merge Child and Related per Rack and compare with the Bug List, with per-Bug Rack spread');
