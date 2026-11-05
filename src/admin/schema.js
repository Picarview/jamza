export const views = {
  overview: [
    'Overview',
    'Welcome to the studio.',
    'A little structure. A lot of creative possibility.',
  ],
  artists: [
    'Artists',
    'The people behind the possibility.',
    'Introduce the voices shaping your collective.',
  ],
  posts: [
    'Announcements & blogs',
    'Stories worth sharing.',
    'Draft ideas, publish updates, and keep your community in the loop.',
  ],
  partners: [
    'Partners',
    'Good things take good company.',
    'Manage the organizations you create alongside.',
  ],
  messages: [
    'Messages',
    'A conversation starts here.',
    'Read and manage messages from your community.',
  ],
  settings: [
    'General settings',
    'Make it your own.',
    'The essentials that keep your world connected.',
  ],
};

export const schemas = {
  artists: [
    ['name', 'Artist name', 'text', true],
    ['role', 'Genre / role', 'text', true],
    ['image', 'Profile image URL', 'url', true],
    ['description', 'Artist description / Bio', 'textarea', false],
  ],
  posts: [
    ['title', 'Post title', 'text', true],
    ['category', 'Category', 'text', true],
    ['date', 'Date', 'date', true],
    ['status', 'Visibility', 'select', true],
    ['image', 'Cover image URL', 'url', true],
    ['excerpt', 'Short introduction', 'textarea', true],
    ['body', 'Full article', 'textarea', true],
  ],
  partners: [
    ['name', 'Organization name', 'text', true],
    ['url', 'Website URL', 'url', false],
    ['image', 'Logo URL (or upload below)', 'text', false],
  ],
};