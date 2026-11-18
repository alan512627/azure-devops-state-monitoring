const fs = require('fs');
const assert = require('assert');
const source = fs.readFileSync('C4143-DVScale-Dashboard.user.js', 'utf8');
const D = { S: { bugList: { status: 'ok', items: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 6, relCases: { parent: [{ id: 99999 }], other: [] } }] } }, queryExtras: () => null };
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
// bug 1: Child on R1 item0, Related on R2 item0 and R1 item1 -> OK (one Parent, on R1)
// bug 2: Child on R3 item1 but also on R2 item1 (Related) -> Child should be on R2 (lowest Rack)
// bug 3: Related only (R2 item2, R4 item2), no Parent anywhere -> no Child, suggest R2 item2
// bug 4: single Case, Child on R5 item3 -> OK
// bug 6: Related on R2 item3, Parent is Case 99999 outside this Phase -> OK
const plan = [
  [['Failed', [1]], ['Failed', [], [1]], ['Passed'], ['Passed'], ['Blocked']],
  [['Failed', [], [1]], ['Failed', [], [2]], ['Failed', [2]], ['Failed'], ['Unspecified']],
  [['Passed'], ['Failed', [], [3]], ['Passed'], ['Failed', [], [3]], ['Passed']],
  [['Unspecified'], ['Failed', [], [6]], ['Unspecified'], ['Unspecified'], ['Failed', [4]]]
];
const racks = [0, 1, 2, 3, 4].map(r => ({ type: 'Feature', label: 'Rack ' + (r + 1), children: plan.map((item, i) => tc(r + 1, i, ...item[r])) }));
const chk = D.bugLinkCheck(racks), byId = id => chk.all.find(x => x.e.bug.id === id);
assert.deepStrictEqual([byId(1).status, byId(1).home.testCase.id, chk.expectedOf['1|item 1|0']], ['ok', 100, 'related']);
assert.deepStrictEqual([byId(2).status, byId(2).problems, chk.expectedOf['2|item 1|1'], chk.expectedOf['2|item 1|2']], ['issue', ['Child on R3 — should be on R2'], 'child', 'related']);
assert.deepStrictEqual([byId(3).status, byId(3).problems, byId(3).suggest.testCase.id], ['issue', ['No Child (Parent) Case'], 202]);
assert.deepStrictEqual([byId(4).status, chk.single.map(x => x.e.bug.id).sort()], ['ok', [4, 6]]);
assert.deepStrictEqual([byId(6).status, byId(6).elsewhere], ['ok', '#99999 (not in this Query)']);
assert.deepStrictEqual(chk.r1Common.map(x => x.e.bug.id), [1]);
assert.deepStrictEqual([chk.common.length, chk.issues.length, chk.noChild, chk.missing], [3, 2, 1, 1]);
console.log('PASS: bug link check applies the one-Parent-per-Bug rule (Child on R1 / lowest Rack, Related elsewhere), suggestions and Parent outside the Phase');
