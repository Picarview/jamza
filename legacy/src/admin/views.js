import { $, el, safeUrl } from '../lib/dom.js';
import { state } from './state.js';
import { views } from './schema.js';
export function createDashboardViews({
  read,
  save,
  go,
  openEditor,
  openMessage,
  askDelete,
  toast,
}) {
  function button(text, fn, cls = 'button outline') {
    const b = el('button', cls, text);
    b.type = 'button';
    b.onclick = fn;
    return b;
  }
  function panel(title, subtitle) {
    const p = el('section', 'panel'),
      h = el('div', 'panel-head'),
      copy = el('div');
    copy.append(el('h2', '', title));
    if (subtitle) copy.append(el('p', '', subtitle));
    h.append(copy);
    p.append(h);
    return p;
  }
  function render() {
    const d = read(),
      root = $('#content');
    root.replaceChildren();
    if (state.current === 'overview') {
      const stats = el('div', 'stats');
      [
        ['Artists', d.artists.length, 'Independent voices'],
        [
          'Published stories',
          d.posts.filter((p) => p.status === 'Published').length,
          'Ideas out in the world',
        ],
        ['Partners', d.partners.length, 'Creative collaborators'],
        ['Unread messages', d.messages.filter((m) => !m.read).length, 'Conversations to start'],
      ].forEach(([label, count, note]) => {
        const a = el('article', 'stat');
        a.append(el('p', '', label), el('strong', '', String(count)), el('small', '', note));
        stats.append(a);
      });
      root.append(stats);
      const grid = el('div', 'overview-grid'),
        recent = panel('From the journal', 'Your latest posts, including drafts'),
        quick = panel('Make something happen', 'A few places to start');
      d.posts
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 4)
        .forEach((p) => {
          const row = el('div', 'list-row');
          row.append(
            el('strong', '', p.title),
            el('p', '', p.category + ' · ' + p.status + ' · ' + p.date),
          );
          recent.append(row);
        });
      if (!d.posts.length) recent.append(el('p', 'empty', 'Your first story starts here.'));
      const q = el('div', 'quick');
      q.append(
        button('Introduce an artist ↗', () => {
          go('artists');
          openEditor();
        }),
        button('Write a new story ↗', () => {
          go('posts');
          openEditor();
        }),
        button('Open your inbox ↗', () => go('messages')),
      );
      quick.append(q);
      grid.append(recent, quick);
      root.append(grid);
      return;
    }
    if (state.current === 'settings') {
      renderSettings(d);
      return;
    }
    const p = panel(
        views[state.current][0],
        d[state.current].length +
          ' ' +
          (state.current === 'messages' ? 'messages' : 'items') +
          ' in your workspace',
      ),
      toolbar = el('div', 'toolbar'),
      search = el('input', 'search');
    search.type = 'search';
    search.placeholder = 'Search ' + views[state.current][0].toLowerCase() + '…';
    search.setAttribute('aria-label', 'Search ' + views[state.current][0]);
    toolbar.append(search);
    p.querySelector('.panel-head').append(toolbar);
    const area = el('div', 'table-wrap');
    p.append(area);
    root.append(p);
    const draw = () =>
      drawTable(
        area,
        d[state.current].filter((r) =>
          Object.entries(r).some(
            ([k, v]) =>
              !['image', 'body', 'id'].includes(k) &&
              String(v).toLowerCase().includes(search.value.toLowerCase()),
          ),
        ),
      );
    search.oninput = draw;
    draw();
  }
  function drawTable(area, rows) {
    area.replaceChildren();
    if (!rows.length) {
      area.append(el('p', 'empty', 'Nothing here yet. Add an item or try a different search.'));
      return;
    }
    const table = el('table'),
      thead = el('thead'),
      tr = el('tr');
    const headings =
      state.current === 'artists'
        ? ['Artist', 'Genre / role', 'Actions']
        : state.current === 'posts'
          ? ['Story', 'Status', 'Date', 'Actions']
          : state.current === 'partners'
            ? ['Organization', 'Website', 'Actions']
            : ['From', 'Subject', 'Received', 'Actions'];
    headings.forEach((t) => {
      const th = el('th', '', t);
      th.scope = 'col';
      tr.append(th);
    });
    thead.append(tr);
    table.append(thead);
    const body = el('tbody');
    rows.forEach((r) => {
      const row = el('tr', state.current === 'messages' && !r.read ? 'unread' : '');
      const cell = el('td'),
        entity = el('div', 'entity');
      if (r.image && safeUrl(r.image, true)) {
        const img = el('img', 'thumb');
        img.src = r.image;
        img.alt = '';
        img.loading = 'lazy';
        img.onerror = () => (img.hidden = true);
        entity.append(img);
      }
      const copy = el('div');
      copy.append(el('strong', '', r.name || r.title));
      if (state.current === 'messages') copy.append(el('small', '', r.email));
      entity.append(copy);
      cell.append(entity);
      row.append(cell);
      if (state.current === 'artists') row.append(el('td', '', r.role));
      if (state.current === 'partners') row.append(el('td', '', r.url || '—'));
      if (state.current === 'posts') {
        const s = el('td');
        s.append(el('span', 'status ' + (r.status === 'Draft' ? 'draft' : ''), r.status));
        row.append(s, el('td', '', r.date));
      }
      if (state.current === 'messages')
        row.append(el('td', '', r.subject), el('td', '', new Date(r.date).toLocaleDateString()));
      const actions = el('div', 'actions');
      actions.append(
        button(
          state.current === 'messages' ? 'Read' : 'Edit',
          () => (state.current === 'messages' ? openMessage(r.id) : openEditor(r.id)),
          '',
        ),
      );
      if (state.current === 'posts')
        actions.append(
          button(
            r.status === 'Draft' ? 'Publish' : 'Unpublish',
            async () => {
              const d = read(),
                post = d.posts.find((p) => p.id === r.id);
              if (!post) return toast('This item was removed in another tab.');
              post.status = post.status === 'Draft' ? 'Published' : 'Draft';
              if (await save(d)) {
                render();
                toast('Post updated.');
              }
            },
            '',
          ),
        );
      actions.append(button('Delete', () => askDelete(r.id), 'delete'));
      actions
        .querySelectorAll('button')
        .forEach((b) =>
          b.setAttribute('aria-label', b.textContent + ' ' + (r.name || r.title || r.subject)),
        );
      const actionCell = el('td');
      actionCell.append(actions);
      row.append(actionCell);
      body.append(row);
    });
    table.append(body);
    area.append(table);
  }
  function renderSettings(d) {
    const p = panel('General settings', 'Your public identity and contact details'),
      form = el('form', 'settings'),
      grid = el('div', 'form-grid');
    [
      ['title', 'Site title', 'text'],
      ['email', 'Contact email', 'email'],
      ['instagram', 'Instagram URL', 'url'],
      ['linkedin', 'LinkedIn URL', 'url'],
    ].forEach(([key, label, type]) => {
      const l = el('label', '', label),
        input = el('input');
      input.type = type;
      input.name = key;
      input.maxLength = key === 'title' ? 60 : 300;
      input.value = d.settings[key] || '';
      input.required = ['title', 'email'].includes(key);
      if (type === 'url') input.placeholder = 'https://';
      l.append(input);
      grid.append(l);
    });
    const error = el('p', 'error');
    error.setAttribute('role', 'alert');
    const b = el('button', 'button', 'Save settings ↗');
    b.type = 'submit';
    form.append(
      grid,
      el('p', 'help', 'Leave social URLs empty to hide them from the website.'),
      error,
      b,
    );
    form.onsubmit = async (e) => {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(form));
      Object.keys(v).forEach((k) => (v[k] = v[k].trim()));
      if (!v.title || !v.email) {
        error.textContent = 'Enter a title and email address.';
        return;
      }
      if (['instagram', 'linkedin'].some((k) => v[k] && !safeUrl(v[k]))) {
        error.textContent = 'Social links must use HTTP or HTTPS.';
        return;
      }
      const latest = read();
      latest.settings = v;
      if (await save(latest)) {
        error.textContent = '';
        toast('Settings saved.');
      }
    };
    p.append(form);
    $('#content').append(p);
  }

  return { render };
}
