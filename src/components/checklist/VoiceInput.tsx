'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Mic } from 'lucide-react';

interface VoiceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
}

function getSpeechRecognition(): typeof SpeechRecognition | null {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function isVoiceInputSupported(): boolean {
  return getSpeechRecognition() !== null;
}

export function VoiceInput({
  value,
  onChange,
  placeholder = 'Observação...',
  label,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported] = useState(isVoiceInputSupported);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      if (transcript) {
        const separator = value.trim() ? ' ' : '';
        onChange(value + separator + transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [value, onChange]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, stopListening, startListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div>
      <div className="flex gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[72px] flex-1 resize-none rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label={label}
        />
        {supported && (
          <button
            type="button"
            onClick={toggleListening}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-lg border transition-colors',
              isListening
                ? 'border-red-300 bg-red-500 text-white'
                : 'border-border text-muted-foreground hover:bg-muted'
            )}
            aria-label={isListening ? 'Parar gravação' : 'Gravar por voz'}
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
      </div>
      {isListening && (
        <div className="mt-1.5 flex items-center gap-1.5 animate-fadeIn" role="status">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          <span className="text-xs text-red-500">Ouvindo...</span>
        </div>
      )}
    </div>
  );
}
