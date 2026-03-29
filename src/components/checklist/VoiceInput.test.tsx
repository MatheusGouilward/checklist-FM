import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceInput, isVoiceInputSupported } from './VoiceInput';

// Mock SpeechRecognition
class MockSpeechRecognition {
  lang = '';
  continuous = false;
  interimResults = false;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onend: (() => void) | null = null;

  start = vi.fn(() => {
    // Simulate immediate result
  });
  stop = vi.fn(() => {
    this.onend?.();
  });
}

describe('VoiceInput', () => {
  beforeEach(() => {
    // Clear any previous mock
    delete (window as unknown as Record<string, unknown>).SpeechRecognition;
    delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition;
    delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
  });

  it('renders textarea with placeholder', () => {
    render(
      <VoiceInput
        value=""
        onChange={() => {}}
        label="Observação"
        placeholder="Digite aqui..."
      />
    );

    expect(screen.getByPlaceholderText('Digite aqui...')).toBeInTheDocument();
  });

  it('renders textarea with current value', () => {
    render(
      <VoiceInput
        value="Texto existente"
        onChange={() => {}}
        label="Observação"
      />
    );

    expect(screen.getByDisplayValue('Texto existente')).toBeInTheDocument();
  });

  it('calls onChange when typing in textarea', () => {
    const onChange = vi.fn();
    render(
      <VoiceInput value="" onChange={onChange} label="Observação" />
    );

    fireEvent.change(screen.getByLabelText('Observação'), {
      target: { value: 'novo texto' },
    });
    expect(onChange).toHaveBeenCalledWith('novo texto');
  });

  it('does not show mic button when Speech API is unavailable', () => {
    render(
      <VoiceInput value="" onChange={() => {}} label="Observação" />
    );

    expect(screen.queryByLabelText('Gravar por voz')).not.toBeInTheDocument();
  });

  it('shows mic button when Speech API is available', () => {
    (window as unknown as Record<string, unknown>).SpeechRecognition =
      MockSpeechRecognition;

    render(
      <VoiceInput value="" onChange={() => {}} label="Observação" />
    );

    expect(screen.getByLabelText('Gravar por voz')).toBeInTheDocument();
  });

  it('starts listening when mic button is clicked', () => {
    (window as unknown as Record<string, unknown>).SpeechRecognition =
      MockSpeechRecognition;

    render(
      <VoiceInput value="" onChange={() => {}} label="Observação" />
    );

    fireEvent.click(screen.getByLabelText('Gravar por voz'));

    expect(screen.getByText('Ouvindo...')).toBeInTheDocument();
    expect(screen.getByLabelText('Parar gravação')).toBeInTheDocument();
  });

  it('stops listening when stop button is clicked', () => {
    (window as unknown as Record<string, unknown>).SpeechRecognition =
      MockSpeechRecognition;

    render(
      <VoiceInput value="" onChange={() => {}} label="Observação" />
    );

    fireEvent.click(screen.getByLabelText('Gravar por voz'));
    expect(screen.getByText('Ouvindo...')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Parar gravação'));
    expect(screen.queryByText('Ouvindo...')).not.toBeInTheDocument();
  });

  it('appends transcript to existing value on recognition result', () => {
    let capturedInstance: MockSpeechRecognition | null = null;

    class CapturingSpeechRecognition extends MockSpeechRecognition {
      constructor() {
        super();
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        capturedInstance = this;
      }
    }

    (window as unknown as Record<string, unknown>).SpeechRecognition =
      CapturingSpeechRecognition;

    const onChange = vi.fn();
    render(
      <VoiceInput
        value="Texto existente"
        onChange={onChange}
        label="Observação"
      />
    );

    fireEvent.click(screen.getByLabelText('Gravar por voz'));

    // Simulate speech result
    capturedInstance!.onresult!({
      results: [[{ transcript: 'filtro danificado' }]],
    });

    expect(onChange).toHaveBeenCalledWith(
      'Texto existente filtro danificado'
    );
  });

  it('mic button has defined dimensions for touch target', () => {
    (window as unknown as Record<string, unknown>).SpeechRecognition =
      MockSpeechRecognition;

    render(
      <VoiceInput value="" onChange={() => {}} label="Observação" />
    );

    const micButton = screen.getByLabelText('Gravar por voz');
    // Button uses h-10 w-10 for consistent sizing
    expect(micButton.className).toContain('h-10');
    expect(micButton.className).toContain('w-10');
  });

  it('uses webkitSpeechRecognition as fallback', () => {
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition =
      MockSpeechRecognition;

    expect(isVoiceInputSupported()).toBe(true);
  });

  it('textarea has text-sm styling', () => {
    render(
      <VoiceInput value="" onChange={() => {}} label="Observação" />
    );

    const textarea = screen.getByLabelText('Observação');
    expect(textarea.className).toContain('text-sm');
  });
});
