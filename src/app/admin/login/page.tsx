'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { Button, Field, Input } from '@/components/admin/ui';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [needsCode, setNeedsCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await signIn('credentials', {
      email,
      password,
      code,
      redirect: false,
      callbackUrl: '/admin',
    });
    setLoading(false);
    if (response?.error) {
      if (response.code === 'totp_required') {
        setNeedsCode(true);
      } else if (response.code === 'totp_invalid') {
        setCode('');
        setError('Code invalide ou expiré. Réessaie avec le code actuel.');
      } else {
        setNeedsCode(false);
        setCode('');
        setError('Email ou mot de passe incorrect.');
      }
      return;
    }
    router.push(params?.get('callbackUrl') ?? '/admin');
    router.refresh();
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-300px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-violet-300/[0.06] blur-[120px]"
      />
      <div className="relative w-full max-w-[400px]">
        <div className="mb-9 text-center">
          <span className="mx-auto mb-5 grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/55">
            <LockKeyhole size={17} />
          </span>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
            Auxance / Studio
          </p>
          <h1
            className="mt-3 text-[32px] font-medium text-white"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.03em',
            }}
          >
            Bon retour.
          </h1>
          <p className="mt-2 text-[12px] text-white/30">
            Connecte-toi pour écrire et mettre à jour le portfolio.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 shadow-2xl"
        >
          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
            />
          </Field>
          <Field label="Mot de passe">
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>
          {needsCode && (
            <Field label="Code de l’application (2FA)">
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9 ]*"
                maxLength={7}
                placeholder="123 456"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
                autoFocus
              />
            </Field>
          )}
          {error && <p className="text-[12px] text-red-300">{error}</p>}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>

        <Link
          href="/fr"
          className="mx-auto mt-7 flex w-fit items-center gap-2 text-[11px] text-white/30 hover:text-white/65"
        >
          <ArrowLeft size={12} />
          Retour au portfolio
        </Link>
      </div>
    </div>
  );
}
