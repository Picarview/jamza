import type { Metadata } from 'next';
import { Partners } from '@/admin/screens/Collections';

export const metadata: Metadata = { title: 'Partners' };

export default function Page() {
  return <Partners />;
}
