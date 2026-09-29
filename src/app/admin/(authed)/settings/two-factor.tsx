'use client';

import { useState, useTransition } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button, Field, Input } from '@/components/admin/ui';
import { confirmTotpSetup, disableTotp, startTotpSetup } from '@/actions/security';

export function TwoFactor({ enabled }: { enabled: boolean }) {
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function begin() {
    setMessage(null);
    startTransition(async () => {
      setSetup(await startTotpSetup());
      setCode('');
    });
  }

  function confirm() {
    startTransition(async () => {
      const res = await confirmTotpSetup(code);
      setCode('');
      if (res.ok) {
        setSetup(null);
        setMessage('Double authentification activée.');
      } else {
        setMessage('Code invalide — vérifie l’heure du téléphone et réessaie.');
      }
    });
  }

  function disable() {
    startTransition(async () => {
      const res = await disableTotp(code);
      setCode('');
      setMessage(res.ok ? 'Double authentification désactivée.' : 'Code invalide.');
    });
  }

  const codeInput = (
    <Input
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={7}
      placeholder="123 456"
      value={code}
      onChange={(event) => setCode(event.target.value)}
    />
  );

  return (
    <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.015] px-5 py-5">
      <div className="flex items-center gap-3 text-[12px] text-white/45">
        <ShieldCheck size={14} />
        Double authentification (TOTP)
        <span className={enabled ? 'text-emerald-300/80' : 'text-white/30'}>
          · {enabled ? 'active' : 'inactive'}
        </span>
      </div>

      {!enabled && !setup && (
        <div className="mt-4">
          <p className="mb-4 text-[12px] leading-relaxed text-white/40">
            Un code à 6 chiffres, renouvelé toutes les 30 secondes par une app
            (Google Authenticator, Aegis, 2FAS, 1Password…), sera demandé à
            chaque connexion.
          </p>
          <Button type="button" onClick={begin} disabled={pending}>
            Activer
          </Button>
        </div>
      )}

      {!enabled && setup && (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-[12px] leading-relaxed text-white/40">
            Dans ton app d’authentification, choisis « Saisir une clé de
            configuration » et entre la clé ci-dessous (type : basé sur le temps).
            Puis tape le code affiché pour confirmer.
          </p>
          <code className="select-all break-all rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3 font-mono text-[14px] tracking-[0.12em] text-white/80">
            {setup.secret.match(/.{1,4}/g)?.join(' ')}
          </code>
          <p className="text-[11px] text-white/30">
            Sur le téléphone, tu peux aussi ouvrir ce lien :{' '}
            <a href={setup.uri} className="underline hover:text-white/60">
              ajouter à l’app
            </a>
          </p>
          <Field label="Code à 6 chiffres">{codeInput}</Field>
          <div className="flex gap-3">
            <Button type="button" variant="primary" onClick={confirm} disabled={pending}>
              Confirmer
            </Button>
            <Button type="button" variant="ghost" onClick={() => setSetup(null)} disabled={pending}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {enabled && (
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Code actuel pour désactiver">{codeInput}</Field>
          <div>
            <Button type="button" variant="danger" onClick={disable} disabled={pending}>
              Désactiver
            </Button>
          </div>
        </div>
      )}

      {message && <p className="mt-4 text-[12px] text-white/55">{message}</p>}
    </div>
  );
}
