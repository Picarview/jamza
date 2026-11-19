import type { Metadata } from 'next';
import { Lineup } from '@/admin/screens/Collections';

export const metadata: Metadata = { title: 'Lineup' };

export default function Page() {
  return <Lineup />;
}
