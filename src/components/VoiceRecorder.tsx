import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '../lib/openai';

interface Props {
  language: 'ja' | 'fr';
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ language, onTranscription, disabled }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    if (disabled || isProcessing) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      chunks.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
        if (audioBlob.size < 1000) return; // Too short

        setIsProcessing(true);
        try {
          const text = await transcribeAudio(audioBlob, language);
          if (text.trim()) {
            onTranscription(text.trim());
          }
        } catch (err) {
          console.error('Transcription error:', err);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access error:', err);
    }
  }, [disabled, isProcessing, language, onTranscription]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  }, []);

  const label = language === 'ja' ? '🇯🇵 Maintenir pour écouter' : '🇫🇷 Maintenir pour dicter';

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onPointerDown={startRecording}
        onPointerUp={stopRecording}
        onPointerLeave={stopRecording}
        disabled={disabled || isProcessing}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 select-none touch-none
          ${isRecording
            ? 'bg-nihon-accent scale-110 animate-glow shadow-lg shadow-nihon-accent/30'
            : isProcessing
              ? 'bg-nihon-surface border-2 border-nihon-border animate-pulse'
              : 'bg-nihon-surface border-2 border-nihon-border hover:border-nihon-accent/50 active:scale-95'
          }
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isProcessing ? (
          <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9A9AAF" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill={isRecording ? 'rgba(255,255,255,0.2)' : 'none'} stroke={isRecording ? '#fff' : '#F0EDE6'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}

        {/* Pulse ring when recording */}
        {isRecording && (
          <span className="absolute inset-0 rounded-full border-2 border-nihon-accent animate-ping opacity-30" />
        )}
      </button>

      <span className="text-xs font-mono text-nihon-text-muted text-center">
        {isProcessing ? 'Transcription...' : isRecording ? 'Enregistrement...' : label}
      </span>
    </div>
  );
}
