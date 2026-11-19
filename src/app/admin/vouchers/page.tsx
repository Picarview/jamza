import type { Metadata } from 'next';
import { Vouchers } from '@/admin/screens/Collections';

export const metadata: Metadata = { title: 'Vouchers' };

export default function Page() {
  return <Vouchers />;
}
