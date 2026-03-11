# 日本語Bridge — Traducteur FR ↔ JP

PWA mobile-first pour communiquer au Japon. Tape ou dicte en français, obtiens la traduction en **romaji**, **hiragana/katakana** et **kanji**.

## Setup

```bash
# Installer les dépendances
npm install

# La clé API OpenAI se saisit directement dans l'app au lancement

# Lancer en dev
npm run dev

# Build pour déploiement
npm run build
```

## Fonctionnalités

### Sprint 1 — ✅ Texte FR → JP
- Input texte avec traduction automatique
- Affichage triple : romaji (bleu), kana (violet), kanji (doré)
- Traduction mot-à-mot pour comprendre la grammaire
- Notes culturelles quand pertinent
- Bouton play pour écouter la prononciation (Web Speech API)

### Sprint 2 — ✅ Voix FR → JP
- Dictée vocale en français (Web Speech API, gratuit)
- Traduction automatique après dictée

### Sprint 3 — ✅ Voix JP → FR (push-to-talk)
- Bouton maintenir pour enregistrer du japonais
- Transcription via Whisper API
- Traduction JP → FR avec affichage structuré

### Sprint 4 — ✅ PWA + Déploiement
- Service Worker pour cache offline
- Manifest + icônes 192/512
- Déploiement Netlify

## Stack

- **Astro** (static)
- **React** (îlots interactifs)
- **Tailwind CSS** v3
- **OpenAI GPT-4o-mini** (traduction)
- **OpenAI Whisper** (transcription JP)
- **Web Speech API** (dictée FR + prononciation)

## Coût estimé

GPT-4o-mini : ~0.15$/1M tokens → quelques centimes/jour en usage voyage.
Whisper : ~0.006$/minute d'audio.

## Déploiement

Déployé sur Netlify. Push sur `main` déclenche un déploiement automatique.
