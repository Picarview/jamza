import test from 'node:test';
import assert from 'node:assert/strict';
import { getPublicContent } from '../../src/services/content.js';
import { defaults } from '../../src/config/defaults.js';

test('large public collections are not truncated and private tables are never requested', async () => {
  const requested = [];
  const data = {
    artists: Array.from({ length: 1001 }, (_, index) => ({
      id: String(index),
      name: `Artist ${index}`,
    })),
    posts: [
      { id: 'published', status: 'Published' },
      { id: 'private', status: 'Draft' },
    ],
    partners: [],
  };
  const client = {
    from(table) {
      requested.push(table);
      const entity = table.replace('picarview_', '');
      let start = 0,
        end = Infinity,
        publishedOnly = false;
      const query = {
        select() {
          return this;
        },
        order() {
          return this;
        },
        range(first, last) {
          start = first;
          end = last;
          return this;
        },
        eq(key, value) {
          if (key === 'status' && value === 'Published') publishedOnly = true;
          return this;
        },
        async single() {
          return { data: defaults.settings, error: null };
        },
        then(resolve, reject) {
          const rows = data[entity].filter(
            (record) => !publishedOnly || record.status === 'Published',
          );
          return Promise.resolve({ data: rows.slice(start, end + 1), error: null }).then(
            resolve,
            reject,
          );
        },
      };
      return query;
    },
  };
  const content = await getPublicContent(client);
  assert.equal(content.artists.length, 1001);
  assert.deepEqual(
    content.posts.map((record) => record.id),
    ['published'],
  );
  assert.equal(requested.includes('picarview_messages'), false);
  assert.equal(requested.includes('picarview_admins'), false);
  assert.deepEqual(content.messages, []);
});
