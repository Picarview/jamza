import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults } from '../../src/config/defaults.js';
import { planChange, applyChange, persistChange } from '../../src/services/records.js';

function snapshot() {
  const data = structuredClone(defaults);
  data.artists.push({ id: 'a1', name: 'Original', role: 'Soul', updated_at: 'version-1' });
  return data;
}
test('an edit writes only changed fields and leaves the original snapshot intact', () => {
  const before = snapshot(),
    next = structuredClone(before);
  next.artists[0].name = 'Edited';
  const change = planChange(before, next);
  assert.deepEqual(change.row, { name: 'Edited' });
  assert.equal(change.before.updated_at, 'version-1');
  const result = applyChange(before, change, { ...next.artists[0], updated_at: 'version-2' });
  assert.equal(result.artists[0].name, 'Edited');
  assert.equal(before.artists[0].name, 'Original');
  assert.equal(planChange(before, structuredClone(before)), null);
});
test('multi-record mutations cannot partially commit through a single UI action', () => {
  const before = snapshot(),
    next = structuredClone(before);
  next.artists[0].name = 'Edited';
  next.settings.title = 'Another change';
  assert.throws(() => planChange(before, next), /one item at a time/);
});
test('deleting and inserting records update the snapshot only after server confirmation', () => {
  const before = snapshot(),
    next = structuredClone(before);
  next.artists = [];
  const deletion = planChange(before, next);
  assert.equal(deletion.kind, 'delete');
  assert.equal(applyChange(before, deletion, before.artists[0]).artists.length, 0);
  const empty = structuredClone(defaults),
    inserted = structuredClone(empty);
  inserted.partners.push({ id: 'partner', name: 'Studio', image: '', url: '' });
  const addition = planChange(empty, inserted);
  assert.equal(addition.kind, 'insert');
  assert.equal(applyChange(empty, addition, inserted.partners[0]).partners[0].name, 'Studio');
});
test('a stale update includes its version condition and propagates server rejection', async () => {
  const filters = [],
    failure = { code: 'PGRST116', message: 'No matching row' };
  const query = {
    update() {
      return this;
    },
    eq(...args) {
      filters.push(args);
      return this;
    },
    select() {
      return this;
    },
    async single() {
      return { data: null, error: failure };
    },
  };
  const before = snapshot(),
    next = structuredClone(before);
  next.artists[0].name = 'Edited';
  await assert.rejects(
    persistChange({ from: () => query }, planChange(before, next)),
    (error) => error === failure,
  );
  assert.deepEqual(filters, [
    ['id', 'a1'],
    ['updated_at', 'version-1'],
  ]);
});
