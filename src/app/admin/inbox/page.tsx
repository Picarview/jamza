import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inbox } from '@/admin/screens/Inbox';

export const metadata: Metadata = { title: 'Inbox' };

export default function Page() {
  return <Suspense><Inbox /></Suspense>;
}
