const fs = require('fs');
const assert = require('assert');
const source = fs.readFileSync('C4143-DVScale-Dashboard.user.js', 'utf8');
const D = {};
const grab = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
eval(grab('  D.collect = ', '\n'));
eval(grab('  D.resultOutcomeKey = ', '  D.resultOutcomeSummary = '));
eval(grab('  D.FAILBUG_LINK = ', '  D.linkTag = '));
const bug = id => ({ id, title: 'Bug ' + id, state: 'Active' });
const tc = (id, outcome, child, related) => ({ id, type: 'Test Case', title: 'Case ' + id, latestTestPoint: { outcome }, bugs: child.map(bug), relatedBugs: related.map(bug) });
const racks = [
  { type: 'Feature', label: 'Rack 1', children: [tc(1, 'Failed', [10], [11]), tc(2, 'Failed', [12], [12]), tc(3, 'Blocked', [], [13]), tc(4, 'Failed', [], []), tc(5, 'Passed', [14], [15])] },
  { type: 'Feature', label: 'Rack 2', children: [tc(6, 'Failed', [10], [])] }
];
const r = D.failBugReport(racks), r1 = r.rows[0];
assert.deepStrictEqual([r1.failed, r1.blocked, r1.withBug, r1.withoutBug, r1.childCount, r1.relatedCount, r1.bothCount, r1.uniqueCount], [3, 1, 3, 1, 2, 3, 1, 4]);
assert.deepStrictEqual(r1.items.find(i => i.testCase.id === 2).links.map(l => l.link), ['both']);
assert.deepStrictEqual([r.total.failed, r.total.blocked, r.total.childCount, r.total.relatedCount, r.total.uniqueCount], [4, 1, 2, 3, 4], 'Bug 10 on two Racks counts once');
const overlap = D.childRelatedOverlap(racks);
assert.deepStrictEqual(overlap.map(e => e.bug.id), [12]);
console.log('PASS: Failed / Blocked bug report splits Child, Related and Child + Related per Rack with unique totals');
