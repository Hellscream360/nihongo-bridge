// ─── Configuration ───
const API_BASE = 'https://api.openai.com/v1';

function getApiKey(): string {
  return (typeof window !== 'undefined' && (window as any).__OPENAI_KEY) || '';
}

const MODEL_TEXT = 'gpt-4.1-nano';
const MODEL_VISION = 'gpt-4.1-nano';
const MODEL_TRANSCRIBE = 'gpt-4o-mini-transcribe';

// ─── Types ───
export interface TranslationFrJp {
  french: string;
  romaji: string;
  hiragana: string;
  kanji: string;
  literal: string;
  notes?: string;
}

export interface TranslationJpFr {
  japanese_input: string;
  french: string;
  romaji: string;
  hiragana: string;
  kanji: string;
  literal: string;
  notes?: string;
}

export interface TranslationPhoto {
  detected_text: string;
  french: string;
  romaji: string;
  hiragana: string;
  kanji: string;
  literal: string;
  notes?: string;
}

// ─── Prompts ───
const SYSTEM_FR_JP = `Tu es un traducteur expert français → japonais pour un voyageur au Japon.
L'utilisateur te donne une phrase en français à traduire.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, avec cette structure exacte :
{
  "french": "la phrase originale en français",
  "romaji": "la traduction en romaji UNIQUEMENT en lettres latines (a-z), AUCUN caractère japonais (hiragana, katakana, kanji) n'est autorisé dans ce champ",
  "hiragana": "la traduction en hiragana/katakana uniquement, aucune lettre latine",
  "kanji": "la traduction avec kanji quand c'est approprié, aucune lettre latine",
  "literal": "traduction mot à mot pour comprendre la structure grammaticale japonaise",
  "notes": "note culturelle ou de politesse si pertinent (1 phrase max, sinon chaîne vide)"
}
Utilise un niveau de politesse standard (です/ます) adapté pour parler à des inconnus.`;

const SYSTEM_JP_FR = `Tu es un traducteur expert japonais → français.
L'utilisateur te donne du texte en japonais (romaji, hiragana, katakana, kanji ou un mélange).
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, avec cette structure exacte :
{
  "japanese_input": "le texte japonais tel que reçu",
  "french": "la traduction en français",
  "romaji": "le texte en romaji UNIQUEMENT en lettres latines (a-z), AUCUN caractère japonais autorisé",
  "hiragana": "le texte en hiragana/katakana uniquement, aucune lettre latine",
  "kanji": "le texte avec kanji appropriés",
  "literal": "traduction mot à mot pour comprendre la structure",
  "notes": "note culturelle ou grammaticale si pertinent (1 phrase max, sinon chaîne vide)"
}`;

const SYSTEM_PHOTO = `Tu es un expert en lecture et traduction de texte japonais sur des photos.
L'utilisateur t'envoie une photo d'un panneau, menu, affiche ou tout support contenant du texte japonais.
Détecte TOUT le texte japonais visible sur l'image et traduis-le en français.
Si plusieurs éléments de texte sont présents, regroupe-les de manière logique.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, avec cette structure exacte :
{
  "detected_text": "tout le texte japonais détecté sur l'image, tel quel",
  "french": "la traduction complète en français",
  "romaji": "le texte en romaji UNIQUEMENT en lettres latines (a-z), AUCUN caractère japonais autorisé",
  "hiragana": "le texte en hiragana/katakana uniquement, aucune lettre latine",
  "kanji": "le texte avec kanji tels que détectés sur l'image",
  "literal": "traduction mot à mot pour comprendre la structure",
  "notes": "contexte utile : type de panneau, niveau de politesse, info culturelle (1-2 phrases max, sinon chaîne vide)"
}`;

// ─── API Calls ───

async function callGPT(systemPrompt: string, userMessage: string): Promise<string> {
  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL_TEXT,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${res.status} — ${err?.error?.message || 'Unknown'}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

async function callGPTVision(systemPrompt: string, imageBase64: string): Promise<string> {
  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL_VISION,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageBase64 },
            },
            {
              type: 'text',
              text: 'Traduis tout le texte japonais visible sur cette image.',
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI Vision API error: ${res.status} — ${err?.error?.message || 'Unknown'}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

function parseJSON<T>(raw: string): T {
  // Nettoyer d'éventuels backticks markdown
  const cleaned = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

export async function translateFrToJp(frenchText: string): Promise<TranslationFrJp> {
  const raw = await callGPT(SYSTEM_FR_JP, frenchText);
  return parseJSON<TranslationFrJp>(raw);
}

export async function translateJpToFr(japaneseText: string): Promise<TranslationJpFr> {
  const raw = await callGPT(SYSTEM_JP_FR, japaneseText);
  return parseJSON<TranslationJpFr>(raw);
}

export async function translatePhoto(imageBase64: string): Promise<TranslationPhoto> {
  const raw = await callGPTVision(SYSTEM_PHOTO, imageBase64);
  return parseJSON<TranslationPhoto>(raw);
}

// ─── Speech-to-Text ───

export async function transcribeAudio(audioBlob: Blob, language: string = 'ja'): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', MODEL_TRANSCRIBE);
  formData.append('language', language);

  const res = await fetch(`${API_BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Transcription API error: ${res.status} — ${err?.error?.message || 'Unknown'}`);
  }

  const data = await res.json();
  return data.text;
}

// ─── Vérification clé API ───

export function isApiKeyConfigured(): boolean {
  const key = getApiKey();
  return key !== '' && key !== 'YOUR_OPENAI_KEY_HERE';
}
