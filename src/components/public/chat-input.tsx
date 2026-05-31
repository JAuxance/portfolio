'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowButton } from './arrow-button';
import { HeatherLogo } from './heather-logo';
import { cn } from '@/lib/cn';

interface ChatInputProps {
  placeholder: string;
  /** Optional initial chip-style suggestions; clicking sends them as a question. */
  className?: string;
}

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function ChatInput({ placeholder, className }: ChatInputProps) {
  const locale = useLocale() as 'en' | 'fr';
  const t = useTranslations('hero');
  const reduced = useReducedMotion();

  const [value, setValue] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [pendingAssistant, setPendingAssistant] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, pendingAssistant]);

  async function send(message: string) {
    const trimmed = message.trim();
    if (!trimmed || streaming) return;

    setValue('');
    setError(null);
    const next: ChatMessage[] = [...history, { role: 'user', content: trimmed }];
    setHistory(next);
    setStreaming(true);
    setPendingAssistant('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          locale,
          history: history.slice(-8), // cap history sent server-side
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Network error');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantSoFar = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';
        for (const part of parts) {
          const line = part.replace(/^data:\s?/, '').trim();
          if (!line) continue;
          try {
            const evt = JSON.parse(line);
            if (evt.type === 'delta' && typeof evt.text === 'string') {
              assistantSoFar += evt.text;
              setPendingAssistant(assistantSoFar);
            } else if (evt.type === 'error') {
              throw new Error(evt.error || 'stream_error');
            }
          } catch {
            // ignore malformed events
          }
        }
      }
      setHistory([...next, { role: 'assistant', content: assistantSoFar }]);
      setPendingAssistant('');
    } catch (err) {
      const msg = locale === 'fr' ? 'Heather a buggué une seconde. Réessaie.' : 'Heather glitched for a sec. Try again.';
      setError(msg);
    } finally {
      setStreaming(false);
    }
  }

  const hasConversation = history.length > 0 || streaming;

  return (
    <div className={cn('w-full', className)}>
      <AnimatePresence initial={false}>
        {hasConversation && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mb-3 overflow-hidden"
          >
            <div className="glass-thin rounded-2xl px-5 py-4 md:px-6 md:py-5">
              <div className="mb-3 flex items-center gap-2">
                <HeatherLogo size={18} animated={streaming} />
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {t('heatherLabel')}
                </span>
              </div>
              <div
                ref={scrollRef}
                className="flex max-h-[360px] flex-col gap-4 overflow-y-auto scrollbar-hide pr-1"
              >
                {history.map((m, i) => <ChatBubble key={i} role={m.role} content={m.content} />)}
                {streaming && pendingAssistant && (
                  <ChatBubble role="assistant" content={pendingAssistant} streaming />
                )}
                {streaming && !pendingAssistant && (
                  <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-tertiary)]">
                    <span className="inline-flex gap-1">
                      <Dot delay={0} />
                      <Dot delay={0.15} />
                      <Dot delay={0.3} />
                    </span>
                    <span>{t('heatherThinking')}</span>
                  </div>
                )}
                {error && <p className="text-[12px] text-red-300">{error}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(value);
        }}
        className="glass glass-hover flex w-full items-center gap-3 rounded-2xl pl-5 pr-2 py-2 transition-colors"
        style={{ borderRadius: 16 }}
      >
        <HeatherLogo size={22} animated={streaming} className="shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={streaming}
          className="flex-1 bg-transparent py-3 text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none disabled:opacity-60"
        />
        <ArrowButton size={36} ariaLabel="Send" />
      </form>
    </div>
  );
}

function ChatBubble({ role, content, streaming }: { role: 'user' | 'assistant'; content: string; streaming?: boolean }) {
  if (role === 'user') {
    return (
      <div className="self-end max-w-[85%] rounded-2xl rounded-tr-md bg-[var(--color-glass-fill-hover)] border border-[var(--color-glass-border)] px-4 py-2.5 text-[14px] text-[var(--color-text-primary)]">
        {content}
      </div>
    );
  }
  return (
    <div className="self-start max-w-[92%] text-[14px] leading-[1.6] text-[var(--color-text-primary)]">
      {content}
      {streaming && <span className="ml-1 inline-block h-3 w-1.5 translate-y-[2px] animate-pulse bg-[var(--color-text-primary)] opacity-70" />}
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="block h-1.5 w-1.5 rounded-full bg-[var(--color-text-primary)] opacity-70"
      animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
      transition={{ duration: 1.1, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}
