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

/** Site-wide settings (jamza_settings row 'site'), with festival details editable in the admin. */
export type Settings = {
  id: 'site';
  title: string;
  email: string;
  instagram: string;
  linkedin: string;
  ticketUrl: string | null;
  communityPrice: number | null;
  shopDeadline: string | null;
  shuttleDeparture: string | null;
  shuttleReturn: string | null;
  vendorDeadline: string; // ISO date
};
