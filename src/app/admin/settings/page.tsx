import type { Metadata } from 'next';
import { SettingsScreen } from '@/admin/screens/SettingsScreen';

export const metadata: Metadata = { title: 'Settings' };

export default function Page() {
  return <SettingsScreen />;
}
