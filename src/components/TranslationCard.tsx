import type { TranslationFrJp, TranslationJpFr, TranslationPhoto } from '../lib/openai';

interface Props {
  translation: TranslationFrJp | TranslationJpFr | TranslationPhoto;
  direction: 'fr-jp' | 'jp-fr' | 'photo';
}

function speakJapanese(text: string) {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.85;
  speechSynthesis.speak(utterance);
}

function speakFrench(text: string) {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}

export default function TranslationCard({ translation, direction }: Props) {
  const t = translation;

  return (
    <div className="animate-slide-up space-y-3">
      {/* Source */}
      <div className="px-4 py-3 rounded-2xl bg-nihon-surface border border-nihon-border">
        <span className="text-[11px] font-mono uppercase tracking-widest text-nihon-text-muted block mb-1">
          {direction === 'fr-jp' ? '🇫🇷 Français' : direction === 'photo' ? '📷 Texte détecté' : '🇯🇵 Japonais (input)'}
        </span>
        <p className="text-nihon-text text-base font-body">
          {direction === 'fr-jp'
            ? (t as TranslationFrJp).french
            : direction === 'photo'
              ? (t as TranslationPhoto).detected_text
              : (t as TranslationJpFr).japanese_input}
        </p>
      </div>

      {/* Romaji */}
      <div className="px-4 py-3 rounded-2xl bg-nihon-surface border border-nihon-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-nihon-romaji">
            Romaji
          </span>
          <button
            onClick={() => speakJapanese(t.kanji || t.hiragana)}
            className="text-nihon-text-muted hover:text-nihon-romaji transition-colors p-1"
            title="Écouter la prononciation"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </button>
        </div>
        <p className="text-nihon-romaji text-xl font-display font-medium">
          {t.romaji}
        </p>
      </div>

      {/* Hiragana / Katakana */}
      <div className="px-4 py-3 rounded-2xl bg-nihon-surface border border-nihon-border">
        <span className="text-[11px] font-mono uppercase tracking-widest text-nihon-kana block mb-1">
          Hiragana / Katakana
        </span>
        <p className="text-nihon-kana text-2xl font-jp">
          {t.hiragana}
        </p>
      </div>

      {/* Kanji */}
      <div className="px-4 py-3 rounded-2xl bg-nihon-surface border border-nihon-border">
        <span className="text-[11px] font-mono uppercase tracking-widest text-nihon-kanji block mb-1">
          Kanji
        </span>
        <p className="text-nihon-kanji text-2xl font-jp">
          {t.kanji}
        </p>
      </div>

      {/* French translation (for JP→FR and photo) */}
      {(direction === 'jp-fr' || direction === 'photo') && (
        <div className="px-4 py-3 rounded-2xl bg-nihon-accent-soft border border-nihon-accent/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-nihon-french">
              🇫🇷 Traduction
            </span>
            <button
              onClick={() => speakFrench(direction === 'photo' ? (t as TranslationPhoto).french : (t as TranslationJpFr).french)}
              className="text-nihon-text-muted hover:text-nihon-french transition-colors p-1"
              title="Écouter en français"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </button>
          </div>
          <p className="text-nihon-french text-lg font-body font-medium">
            {direction === 'photo' ? (t as TranslationPhoto).french : (t as TranslationJpFr).french}
          </p>
        </div>
      )}

      {/* Mot à mot */}
      <div className="px-4 py-3 rounded-2xl bg-nihon-bg border border-nihon-border/50">
        <span className="text-[11px] font-mono uppercase tracking-widest text-nihon-text-muted block mb-1">
          Mot à mot
        </span>
        <p className="text-nihon-text-soft text-sm font-body italic">
          {t.literal}
        </p>
      </div>

      {/* Notes */}
      {t.notes && t.notes.length > 0 && (
        <div className="px-4 py-2 rounded-xl bg-nihon-accent-soft/50 border border-nihon-accent/10">
          <p className="text-nihon-text-soft text-xs font-body">
            💡 {t.notes}
          </p>
        </div>
      )}
    </div>
  );
}
