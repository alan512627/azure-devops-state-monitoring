const fs = require('fs');
const assert = require('assert');
const source = fs.readFileSync('C4143-DVScale-Dashboard.user.js', 'utf8');
const D = { S: { bugList: { status: 'ok', items: [{ id: 1 }, { id: 2 }, { id: 3 }] } }, queryExtras: () => null };
const grab = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
eval(grab('  D.normalizedTitle = ', '\n'));
eval(grab('  D.collect = ', '\n'));
eval(grab('  D.resultOutcomeKey = ', '  D.resultOutcomeSummary = '));
eval(grab('  D.crossRackIndex = ', '  D.crossRackOutcomeChips = '));
eval(grab('  D.TEST_WINDOW = ', '  D.exportInTestCsv = '));
eval(grab('  D.bugLinkCheck = ', '  D.bugLinkCheckView = '));
D.rackNumber = r => +r.label.slice(-1);
const bug = id => ({ id, title: 'Bug ' + id, created: '2026-10-20T00:00:00Z' });
const tc = (r, item, outcome, child = [], related = []) => ({ id: r * 100 + item, type: 'Test Case', title: 'Item ' + item, latestTestPoint: { outcome }, childBugsRaw: child.map(bug), bugs: [], relatedBugs: related.map(bug) });
// item0: common bug 1 — R1 Child, R2 Related, R3 Child (wrong)
// item1: R1 Passed; common bug 2 — R2 Child, R3 Related (OK); R4 Failed without bug
// item2: R1 Failed with rack-only bug 9; bug 3 on R3 (Related) + R4 (Child), not on R1 -> Child on R3 (lowest), Related on R4: both wrong
// item3: rack-only bug 4 only Related on R2 -> issue
const plan = [
  [['Failed', [1]], ['Failed', [], [1]], ['Failed', [1]], ['Passed'], ['Blocked']],
  [['Passed'], ['Failed', [2]], ['Failed', [], [2]], ['Failed'], ['Unspecified']],
  [['Failed', [9]], ['Unspecified'], ['Failed', [], [3]], ['Failed', [3]], ['Passed']],
  [['Unspecified'], ['Failed', [], [4]], ['Unspecified'], ['Unspecified'], ['Unspecified']]
];
const racks = [0, 1, 2, 3, 4].map(r => ({ type: 'Feature', label: 'Rack ' + (r + 1), children: plan.map((item, i) => tc(r + 1, i, ...item[r])) }));
const chk = D.bugLinkCheck(racks), byId = id => chk.common.concat(chk.single).find(x => x.e.bug.id === id);
assert.deepStrictEqual([byId(1).status, byId(1).problems], ['issue', ['R3 is Child — should be Related']]);
assert.deepStrictEqual([byId(2).status, byId(2).anchor], ['ok', 1], 'R1 Passed -> Child on lowest Rack with the Bug');
assert.deepStrictEqual([byId(3).status, byId(3).anchor, byId(3).problems], ['issue', 2, ['No Child on R3', 'R4 is Child — should be Related']], 'Not on R1 (R1 Failed) -> Child on lowest Rack');
assert.deepStrictEqual([byId(4).status, byId(4).problems], ['issue', ['Only Related on R2 — should be Child']]);
assert.deepStrictEqual([byId(9).status, chk.missing, chk.perRack[3].missing], ['ok', 1, 1]);
assert.deepStrictEqual([chk.common.length, chk.single.length, chk.issues.length, chk.review.length, chk.commonOk], [3, 2, 3, 0, 1]);
assert.deepStrictEqual(chk.report.notInList.map(x => x.bug.id).sort(), [4, 9]);
console.log('PASS: bug link check applies the Child-on-Rack-1 / Related-elsewhere rule, Passed-R1 fallback, not-on-R1 lowest-Rack Child and missing cases');
