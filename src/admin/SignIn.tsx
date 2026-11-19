'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useAdmin } from './store';

const input =
  'mt-1.5 w-full rounded-2xl border-2 border-plum/15 bg-white px-4 py-3 text-plum placeholder:text-plum/35 focus:border-plum focus:outline-none';

/** Sign-in gate. Access is decided by the jamza_admins allowlist in Supabase. */
export function SignIn() {
  const { auth, signIn, signOut } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <div className="grid min-h-svh place-items-center bg-[radial-gradient(60%_50%_at_50%_0%,#580e79_0%,#12031c_65%)] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3">
          <Image src="/images/logo-main.png" alt="JAMZA!" width={994} height={780} priority className="h-16 w-auto" />
          <span className="display text-4xl text-cream">Admin</span>
        </div>

        <div className="mt-8 rounded-[2rem] bg-cream p-7 text-plum shadow-[12px_14px_0_rgb(0_0_0/0.35)] sm:p-9">
          {auth.status === 'loading' ? (
            <p className="py-10 text-center text-plum/60">Checking your session…</p>
          ) : auth.status === 'not-admin' ? (
            <div className="text-center">
              <p className="display text-3xl">Not on the list yet</p>
              <p className="mt-3 text-plum/70">
                <strong>{auth.email}</strong> is signed in but isn’t an approved admin. Ask an existing admin to add this
                account with <code className="rounded bg-plum/10 px-1.5 py-0.5 text-sm">supabase/scripts/approve-admin.sql</code>.
              </p>
              <button type="button" onClick={signOut} className="mt-6 rounded-full border-2 border-plum/20 px-5 py-2.5 font-bold hover:border-plum/50">
                Sign out
              </button>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                await signIn(email, password);
                setBusy(false);
              }}
            >
              <h1 className="display text-4xl">Sign in</h1>
              <label className="mt-6 block">
                <span className="text-sm font-bold">Email</span>
                <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-bold">Password</span>
                <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
              </label>
              <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm font-semibold text-tomato">
                {auth.status === 'signed-out' ? auth.error : ''}
              </p>
              <button type="submit" disabled={busy} className="btn mt-2 w-full justify-center bg-plum text-cream shadow-[4px_5px_0_var(--color-tomato)] disabled:opacity-60">
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
