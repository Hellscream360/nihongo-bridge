import { useState, useRef, useCallback } from 'react';
import TranslationCard from './TranslationCard';
import VoiceRecorder from './VoiceRecorder';
import {
  translateFrToJp,
  translateJpToFr,
  isApiKeyConfigured,
  type TranslationFrJp,
  type TranslationJpFr,
} from '../lib/openai';
import { addToHistory } from '../lib/storage';

type Mode = 'fr-jp' | 'jp-fr';
type Translation = TranslationFrJp | TranslationJpFr;

interface ConversationEntry {
  id: string;
  direction: Mode;
  translation: Translation;
}

export default function TranslatorApp() {
  const [mode, setMode] = useState<Mode>('fr-jp');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('openai_api_key');
      if (saved) {
        (window as any).__OPENAI_KEY = saved;
        return saved;
      }
    }
    return '';
  });
  const [showKeyInput, setShowKeyInput] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('openai_api_key')) {
      return false;
    }
    return !isApiKeyConfigured();
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  }, []);

  // ─── Translation handler ───
  const handleTranslate = useCallback(async (text: string, direction: Mode) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const translation = direction === 'fr-jp'
        ? await translateFrToJp(text.trim())
        : await translateJpToFr(text.trim());

      const entry: ConversationEntry = {
        id: crypto.randomUUID(),
        direction,
        translation,
      };

      setConversation((prev) => [...prev, entry]);
      addToHistory(direction, translation);
      setInput('');
      scrollToBottom();
    } catch (err: any) {
      setError(err.message || 'Erreur de traduction');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, scrollToBottom]);

  // ─── Submit text ───
  const handleSubmit = useCallback(() => {
    handleTranslate(input, mode);
  }, [input, mode, handleTranslate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // ─── Whisper callbacks ───
  const handleFrTranscription = useCallback((text: string) => {
    setInput(text);
    handleTranslate(text, 'fr-jp');
  }, [handleTranslate]);

  const handleJpTranscription = useCallback((text: string) => {
    handleTranslate(text, 'jp-fr');
  }, [handleTranslate]);

  // ─── API Key setup screen ───
  if (showKeyInput) {
    return (
      <div className="min-h-screen bg-nihon-bg flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold text-nihon-text">
              日本語<span className="text-nihon-accent">Bridge</span>
            </h1>
            <p className="text-nihon-text-soft text-sm font-body">
              Entre ta clé API OpenAI pour commencer
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-3 rounded-xl bg-nihon-surface border border-nihon-border
                text-nihon-text font-mono text-sm placeholder:text-nihon-text-muted
                focus:outline-none focus:border-nihon-accent/50 focus:ring-1 focus:ring-nihon-accent/20
                transition-all"
            />
            <button
              onClick={() => {
                if (apiKey.startsWith('sk-')) {
                  (window as any).__OPENAI_KEY = apiKey;
                  localStorage.setItem('openai_api_key', apiKey);
                  setShowKeyInput(false);
                }
              }}
              disabled={!apiKey.startsWith('sk-')}
              className="w-full py-3 rounded-xl bg-nihon-accent text-white font-display font-medium
                hover:bg-nihon-accent/90 disabled:opacity-40 disabled:cursor-not-allowed
                transition-all active:scale-[0.98]"
            >
              Commencer
            </button>
          </div>

          <p className="text-nihon-text-muted text-[11px] font-mono text-center leading-relaxed">
            La clé reste sur ton téléphone, rien n'est envoyé à un serveur tiers.
          </p>
        </div>
      </div>
    );
  }

  // ─── Main App ───
  return (
    <div className="h-[100dvh] bg-nihon-bg flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-none px-4 pt-3 pb-2 border-b border-nihon-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-display font-bold text-nihon-text">
              日本語<span className="text-nihon-accent">Bridge</span>
            </h1>
            <button
              onClick={() => {
                setApiKey('');
                setShowKeyInput(true);
              }}
              className="p-1.5 rounded-lg text-nihon-text-muted hover:text-nihon-text hover:bg-nihon-surface transition-all"
              title="Modifier la clé API"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center bg-nihon-surface rounded-full p-0.5 border border-nihon-border">
            <button
              onClick={() => setMode('fr-jp')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                mode === 'fr-jp'
                  ? 'bg-nihon-accent text-white'
                  : 'text-nihon-text-soft hover:text-nihon-text'
              }`}
            >
              FR → JP
            </button>
            <button
              onClick={() => setMode('jp-fr')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                mode === 'jp-fr'
                  ? 'bg-nihon-accent text-white'
                  : 'text-nihon-text-soft hover:text-nihon-text'
              }`}
            >
              JP → FR
            </button>
          </div>
        </div>
      </header>

      {/* Conversation area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {conversation.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
            <span className="text-5xl">⛩️</span>
            <div className="space-y-1">
              <p className="text-nihon-text font-display text-base">
                {mode === 'fr-jp' ? 'Écris ou dicte en français' : 'Enregistre du japonais'}
              </p>
              <p className="text-nihon-text-muted text-xs font-mono">
                {mode === 'fr-jp'
                  ? 'La traduction apparaîtra en romaji, kana et kanji'
                  : 'Maintiens le micro pour enregistrer'}
              </p>
            </div>
          </div>
        )}

        {conversation.map((entry) => (
          <TranslationCard
            key={entry.id}
            translation={entry.translation}
            direction={entry.direction}
          />
        ))}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-nihon-surface border border-nihon-border animate-fade-in">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-nihon-accent rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-nihon-accent rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-nihon-accent rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
            <span className="text-nihon-text-soft text-sm font-body">Traduction en cours...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 animate-fade-in">
            <p className="text-red-400 text-sm font-body">{error}</p>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-none border-t border-nihon-border/50 bg-nihon-bg px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {mode === 'fr-jp' ? (
          /* FR → JP : text input + voice */
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écris en français..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl bg-nihon-surface border border-nihon-border
                text-nihon-text font-body text-base placeholder:text-nihon-text-muted
                focus:outline-none focus:border-nihon-accent/50 focus:ring-1 focus:ring-nihon-accent/20
                disabled:opacity-50 transition-all"
            />

            {/* FR Voice button (Whisper) */}
            <VoiceRecorder
              language="fr"
              onTranscription={handleFrTranscription}
              disabled={isLoading}
            />

            {/* Send button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-xl bg-nihon-accent text-white
                hover:bg-nihon-accent/90 disabled:opacity-40 disabled:cursor-not-allowed
                transition-all active:scale-95"
              title="Traduire"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        ) : (
          /* JP → FR : push-to-talk */
          <div className="flex flex-col items-center gap-2 py-2">
            <VoiceRecorder
              language="ja"
              onTranscription={handleJpTranscription}
              disabled={isLoading}
            />
            {/* Fallback text input for JP */}
            <div className="flex items-center gap-2 w-full mt-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ou tape en japonais / romaji..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-nihon-surface border border-nihon-border
                  text-nihon-text font-body text-sm placeholder:text-nihon-text-muted
                  focus:outline-none focus:border-nihon-accent/50 focus:ring-1 focus:ring-nihon-accent/20
                  disabled:opacity-50 transition-all"
              />
              <button
                onClick={() => handleTranslate(input, 'jp-fr')}
                disabled={isLoading || !input.trim()}
                className="p-2.5 rounded-xl bg-nihon-accent text-white
                  hover:bg-nihon-accent/90 disabled:opacity-40 transition-all active:scale-95"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
