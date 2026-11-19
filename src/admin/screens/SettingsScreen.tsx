'use client';

import { useEffect, useState } from 'react';
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { Icon } from '@/components/Icon';
import { useAdmin } from '../store';
import type { Settings } from '../types';
import { Button, Card, Fields, NotLiveYet, PageTitle, type FieldDef } from '../ui';

const groups: { title: string; fields: FieldDef[] }[] = [
  {
    title: 'Contact',
    fields: [
      { name: 'email', label: 'Public email', half: true },
      { name: 'instagram', label: 'Instagram link', half: true },
    ],
  },
  {
    title: 'Tickets',
    fields: [
      { name: 'ticketUrl', label: 'Checkout link', placeholder: 'https://…', help: 'When set, every “Get tickets” button goes here.' },
      { name: 'communityPrice', label: 'Break Time Community price (GHC)', half: true, placeholder: 'TBC' },
    ],
  },
  {
    title: 'Shop, shuttle & vendors',
    fields: [
      { name: 'shopDeadline', label: 'Pre-order deadline', half: true, placeholder: 'e.g. Sunday 14 December' },
      { name: 'vendorDeadline', label: 'Vendor applications close', type: 'date', half: true },
      { name: 'shuttleDeparture', label: 'Shuttle leaves Accra Mall', half: true, placeholder: 'e.g. 11:00am' },
      { name: 'shuttleReturn', label: 'Shuttle returns', half: true, placeholder: 'e.g. 5:30am' },
    ],
  },
];

export function SettingsScreen() {
  const { db, saveSettings, mode } = useAdmin();
  const [draft, setDraft] = useState<Settings>(db.settings);
  const [saved, setSaved] = useState(false);
  useEffect(() => setDraft(db.settings), [db.settings]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(db.settings);
  if (mode === 'supabase') return <NotLiveYet title="Settings" what="Festival details" />;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await saveSettings(draft);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }}
    >
      <PageTitle
        title="Settings"
        intro="Festival details used across the site."
        actions={
          <Button type="submit" disabled={!dirty}>
            {saved ? (
              <>
                <Icon icon={CheckmarkCircle02Icon} size={16} /> Saved
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        }
      />
      <div className="mt-8 space-y-6">
        {groups.map((g) => (
          <Card key={g.title} className="p-6">
            <h2 className="display mb-5 text-3xl">{g.title}</h2>
            <Fields defs={g.fields} value={draft as unknown as Record<string, unknown>} onChange={(v) => setDraft(v as unknown as Settings)} />
          </Card>
        ))}
      </div>
    </form>
  );
}
