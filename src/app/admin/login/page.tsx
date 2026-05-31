'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Field } from '@/components/admin/ui';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/admin',
    });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password.');
      return;
    }
    router.push(params?.get('callbackUrl') ?? '/admin');
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-[400px]">
        <div className="mb-10 text-center">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.20em] text-[var(--color-text-tertiary)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Auxance · Admin
          </p>
          <h1
            className="mt-3 text-[32px] font-medium text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}
          >
            Sign in
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="glass flex flex-col gap-5 p-7">
          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          {error && <p className="text-[12px] text-red-300">{error}</p>}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
