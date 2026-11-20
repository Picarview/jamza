import type { Metadata } from 'next';
import { Merch } from '@/admin/screens/Collections';

export const metadata: Metadata = { title: 'Merch' };

export default function Page() {
  return <Merch />;
}
