'use client';

import { createContext, useCallback, useContext, useState, ReactNode } from 'react';

type Status = 'idle' | 'saving' | 'saved' | 'error';

interface SaveStateContextValue {
  status: Status;
  lastSaved: Date | null;
  setSaving: () => void;
  setSaved: () => void;
  setError: () => void;
}

const SaveStateContext = createContext<SaveStateContextValue | null>(null);

export function SaveStateProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const setSaving = useCallback(() => setStatus('saving'), []);
  const setSaved = useCallback(() => {
    setStatus('saved');
    setLastSaved(new Date());
  }, []);
  const setError = useCallback(() => setStatus('error'), []);

  return (
    <SaveStateContext.Provider value={{ status, lastSaved, setSaving, setSaved, setError }}>
      {children}
    </SaveStateContext.Provider>
  );
}

export function useSaveState() {
  const ctx = useContext(SaveStateContext);
  if (!ctx) return { status: 'idle' as Status, lastSaved: null as Date | null, setSaving: () => {}, setSaved: () => {}, setError: () => {} };
  return ctx;
}
