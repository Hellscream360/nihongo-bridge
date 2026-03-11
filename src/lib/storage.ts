import type { TranslationFrJp, TranslationJpFr } from './openai';

const STORAGE_KEY = 'nihongo-bridge-history';
const MAX_HISTORY = 100;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  direction: 'fr-jp' | 'jp-fr';
  translation: TranslationFrJp | TranslationJpFr;
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(
  direction: 'fr-jp' | 'jp-fr',
  translation: TranslationFrJp | TranslationJpFr
): void {
  const history = getHistory();
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    direction,
    translation,
  };
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
