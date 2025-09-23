'use client';
import { useEffect, useState } from 'react';

type Toast = { id: number; title?: string; description?: string };
let listeners: ((t: Toast) => void)[] = [];
let id = 1;
export function toast(t: Omit<Toast, 'id'>): void {
  const withId = { id: id++, ...t };
  listeners.forEach(fn => fn(withId));
}
export function Toaster(): React.ReactElement {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    const fn = (t: Toast): void => {
      setItems(prev => [...prev, t]);
      function removeToast(): void {
        setItems(prev => prev.filter(x => x.id !== t.id));
      }
      setTimeout(removeToast, 3000);
    };
    listeners.push(fn);
    return (): void => {
      listeners = listeners.filter(l => l !== fn);
    };
  }, []);
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {items.map(t => (
        <div
          key={t.id}
          className="rounded-2xl shadow bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-3 min-w-[240px]"
        >
          {t.title && <div className="font-semibold">{t.title}</div>}
          {t.description && (
            <div className="text-sm text-gray-600 dark:text-gray-300">{t.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}
