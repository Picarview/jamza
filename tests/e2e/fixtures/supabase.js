// HTTP fixtures exercise the real Supabase SDK without touching the live project.
export const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jgV8AAAAASUVORK5CYII=',
  'base64',
);
const adminId = '11111111-1111-4111-8111-111111111111';
const memberId = '22222222-2222-4222-8222-222222222222';
const time = '2026-11-01T00:00:00.000Z';
const row = (value) => ({ ...value, created_at: time, updated_at: time });
const image = 'https://images.example.test/placeholder.png';

function user(id) {
  return {
    id,
    aud: 'authenticated',
    role: 'authenticated',
    email: id === adminId ? 'admin@example.test' : 'member@example.test',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {},
    created_at: time,
  };
}

function token(id) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600, iat: Math.floor(Date.now() / 1000) })}.fixture-signature`;
}

export async function mockSupabase(context) {
  const backend = {
    failNextWrite: false,
    missingSchema: false,
    uploads: [],
    tables: {
      artists: [row({ id: 'a1', name: 'Amara Sol', role: 'Soul / R&B', image })],
      posts: [
        row({
          id: 'p1',
          title: 'Published story',
          category: 'Culture',
          date: '2026-10-31',
          status: 'Published',
          image,
          excerpt: 'A public introduction.',
          body: 'The complete public article.',
        }),
        row({
          id: 'p2',
          title: 'Private draft',
          category: 'News',
          date: '2026-10-30',
          status: 'Draft',
          image,
          excerpt: 'Private summary',
          body: 'Private body',
        }),
      ],
      partners: [row({ id: 'r1', name: 'Studio One', url: '', image: '' })],
      messages: [],
      settings: [
        row({
          id: 'site',
          title: 'picarview',
          email: 'hello@picarview.com',
          instagram: '',
          linkedin: '',
        }),
      ],
    },
  };
  let revision = 0;
  await context.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  );
  await context.route('https://fonts.gstatic.com/**', (route) => route.abort());
  await context.route(/https:\/\/(?:images\.unsplash\.com|images\.example\.test)\//, (route) =>
    route.fulfill({ contentType: 'image/png', body: png }),
  );
  await context.route('https://picarview-test.supabase.co/**', async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      method = request.method();
    const reply = (data, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    let id = null;
    try {
      id = JSON.parse(
        Buffer.from(request.headers().authorization.split('.')[1], 'base64url').toString(),
      ).sub;
    } catch {
      /* Public publishable key. */
    }
    const admin = id === adminId;
    if (url.pathname === '/auth/v1/token') {
      const credentials = request.postDataJSON();
      if (credentials.password !== 'test-password')
        return reply({ msg: 'Invalid login credentials', code: 'invalid_credentials' }, 400);
      const userId = credentials.email.startsWith('admin@') ? adminId : memberId;
      return reply({
        access_token: token(userId),
        refresh_token: `refresh-${userId}`,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: user(userId),
      });
    }
    if (url.pathname === '/auth/v1/user')
      return id ? reply(user(id)) : reply({ msg: 'No session' }, 401);
    if (url.pathname === '/auth/v1/logout') return route.fulfill({ status: 204 });
    if (url.pathname.includes('/storage/v1/object/public/'))
      return route.fulfill({ contentType: 'image/png', body: png });
    if (url.pathname.includes('/storage/v1/object/')) {
      if (!admin) return reply({ message: 'Permission denied' }, 403);
      if (method === 'POST') {
        backend.uploads.push(url.pathname);
        return reply({ Key: url.pathname.split('/object/')[1], Id: 'logo-id' });
      }
      return reply([]);
    }
    if (url.pathname.endsWith('/rpc/picarview_submit_message')) {
      const input = request.postDataJSON();
      backend.tables.messages.unshift(
        row({
          id: `m-${++revision}`,
          name: input.p_name,
          email: input.p_email,
          subject: input.p_subject,
          message: input.p_message,
          date: time,
          read: false,
        }),
      );
      return route.fulfill({ status: 204 });
    }
    const tableName = url.pathname.split('/').at(-1);
    if (backend.missingSchema)
      return reply({ code: 'PGRST205', message: 'Table does not exist' }, 404);
    if (tableName === 'picarview_admins') return reply(admin ? [{ user_id: adminId }] : []);
    const key = tableName.replace('picarview_', ''),
      table = backend.tables[key];
    if (!table) return reply({ code: 'PGRST205', message: 'Table does not exist' }, 404);
    if ((!admin && method !== 'GET') || (!admin && key === 'messages'))
      return reply({ code: '42501', message: 'Permission denied' }, 403);
    if (method !== 'GET' && backend.failNextWrite) {
      backend.failNextWrite = false;
      return reply({ code: 'XX000', message: 'The server could not save this change.' }, 500);
    }
    let selected = table.filter(
      (record) =>
        (admin || key !== 'posts' || record.status === 'Published') &&
        [...url.searchParams].every(
          ([name, value]) => !value.startsWith('eq.') || String(record[name]) === value.slice(3),
        ),
    );
    if (method === 'POST') {
      const added = row(request.postDataJSON());
      table.unshift(added);
      selected = [added];
    }
    if (method === 'PATCH')
      selected.forEach((record) =>
        Object.assign(record, request.postDataJSON(), {
          updated_at: new Date(Date.parse(time) + ++revision * 1000).toISOString(),
        }),
      );
    if (method === 'DELETE')
      backend.tables[key] = table.filter((record) => !selected.includes(record));
    if (method === 'GET') {
      const start = Number(url.searchParams.get('offset') || 0),
        limit = Number(url.searchParams.get('limit') || 1000);
      selected = selected.slice(start, start + limit);
    }
    if (request.headers().accept?.includes('application/vnd.pgrst.object+json')) {
      return selected.length === 1
        ? reply(selected[0])
        : reply({ code: 'PGRST116', message: 'No matching row' }, 406);
    }
    return reply(selected);
  });
  return backend;
}

export async function signIn(page, email = 'admin@example.test', password = 'test-password') {
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in ↗', exact: true }).click();
}
