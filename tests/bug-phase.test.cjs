const fs = require('fs');
const assert = require('assert');
const source = fs.readFileSync('C4143-DVScale-Dashboard.user.js', 'utf8');
const D = { S: {} };
const grab = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
eval(grab('  D.tagTokens = ', '\n'));
eval(grab('  D.BUG_PHASE2_TAG = ', '  D.bugListOverview = '));
const bugs = [
  { id: 1, tags: 'C4143_Scale_Phase2; Rack01' },
  { id: 2, tags: 'c4143 scale phase2' },
  { id: 3, tags: 'C4143_ScaleTest_Phase1; Rack02' },
  { id: 4, tags: '' },
  { id: 5, tags: 'C4143_Scale_Phase2x' }
];
assert.deepStrictEqual(bugs.map(D.bugPhase), ['phase2', 'phase2', 'phase1', 'phase1', 'phase1']);
const split = D.bugPhaseSummary(bugs);
assert.deepStrictEqual([split.phase1.map(b => b.id), split.phase2.map(b => b.id)], [[3, 4, 5], [1, 2]]);
console.log('PASS: Bugs tagged C4143_Scale_Phase2 are Phase 2, all others Phase 1');
