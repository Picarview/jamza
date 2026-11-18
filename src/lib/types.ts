export type Artist = { id: string; name: string; role: string; image: string };
export type Post = {
  id: string;
  title: string;
  category: string;
  date: string;
  status: 'Draft' | 'Published';
  image: string;
  excerpt: string;
  body: string;
};
export type Partner = { id: string; name: string; url: string; image: string };
export type Settings = {
  id: 'site';
  title: string;
  email: string;
  instagram: string;
  linkedin: string;
};
export type SiteContent = {
  artists: Artist[];
  posts: Post[];
  partners: Partner[];
  settings: Settings;
};
