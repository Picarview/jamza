const entities = ['artists', 'posts', 'partners', 'messages'];
const immutableColumns = new Set(['id', 'created_at', 'updated_at']);

function changedFields(before, after) {
  return Object.fromEntries(
    Object.entries(after).filter(
      ([key, value]) =>
        !immutableColumns.has(key) && JSON.stringify(value) !== JSON.stringify(before[key]),
    ),
  );
}

/** A UI action is deliberately limited to one record and one database statement. */
export function planChange(before, after) {
  const changes = [];
  for (const key of entities) {
    const oldRows = new Map(before[key].map((row) => [row.id, row]));
    const newRows = new Map(after[key].map((row) => [row.id, row]));
    for (const row of before[key]) {
      if (!newRows.has(row.id)) changes.push({ key, kind: 'delete', before: row });
    }
    for (const row of after[key]) {
      const previous = oldRows.get(row.id);
      if (!previous) {
        changes.push({ key, kind: 'insert', row });
      } else {
        const patch = changedFields(previous, row);
        if (Object.keys(patch).length) {
          changes.push({ key, kind: 'update', row: patch, before: previous });
        }
      }
    }
  }
  const settingsPatch = changedFields(before.settings, after.settings);
  if (Object.keys(settingsPatch).length) {
    changes.push({ key: 'settings', kind: 'update', row: settingsPatch, before: before.settings });
  }
  if (changes.length > 1) throw new Error('Please save one item at a time.');
  return changes[0] ?? null;
}

export async function persistChange(client, change) {
  const table = client.from(`jamza_${change.key}`);
  let query =
    change.kind === 'insert'
      ? table.insert(change.row)
      : change.kind === 'update'
        ? table.update(change.row)
        : table.delete();
  if (change.before) {
    query = query.eq('id', change.before.id).eq('updated_at', change.before.updated_at);
  }
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}

export function applyChange(snapshot, change, savedRow) {
  const result = structuredClone(snapshot);
  if (change.key === 'settings') result.settings = savedRow;
  else if (change.kind === 'delete') {
    result[change.key] = result[change.key].filter((row) => row.id !== change.before.id);
  } else if (change.kind === 'insert') result[change.key].unshift(savedRow);
  else {
    result[change.key] = result[change.key].map((row) => (row.id === savedRow.id ? savedRow : row));
  }
  return result;
}
