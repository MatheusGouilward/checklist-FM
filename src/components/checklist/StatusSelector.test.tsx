import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusSelector } from './StatusSelector';

describe('StatusSelector', () => {
  describe('with 2 options (button mode)', () => {
    const twoOptions = ['OK', 'Detectado'];

    it('renders all options as radio buttons for 2-option sets', () => {
      render(
        <StatusSelector options={twoOptions} value={null} onChange={() => {}} />
      );

      for (const option of twoOptions) {
        expect(screen.getByRole('radio', { name: option })).toBeInTheDocument();
      }
    });

    it('marks the selected option as checked', () => {
      render(
        <StatusSelector options={twoOptions} value="OK" onChange={() => {}} />
      );

      expect(screen.getByRole('radio', { name: 'OK' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
      expect(
        screen.getByRole('radio', { name: 'Detectado' })
      ).toHaveAttribute('aria-checked', 'false');
    });

    it('calls onChange when an option is clicked', () => {
      const onChange = vi.fn();
      render(
        <StatusSelector options={twoOptions} value={null} onChange={onChange} />
      );

      fireEvent.click(screen.getByRole('radio', { name: 'Detectado' }));
      expect(onChange).toHaveBeenCalledWith('Detectado');
    });

    it('applies emerald style to OK when selected', () => {
      render(
        <StatusSelector options={twoOptions} value="OK" onChange={() => {}} />
      );

      const okButton = screen.getByRole('radio', { name: 'OK' });
      expect(okButton.className).toContain('emerald');
    });

    it('renders buttons with h-11 for touch target', () => {
      render(
        <StatusSelector options={twoOptions} value={null} onChange={() => {}} />
      );

      const buttons = screen.getAllByRole('radio');
      for (const button of buttons) {
        expect(button.className).toContain('h-11');
      }
    });
  });

  describe('with 3+ options (select mode)', () => {
    const threeOptions = ['OK', 'Necessita Troca', 'Substituído'];

    it('renders a select element for 3+ options', () => {
      render(
        <StatusSelector options={threeOptions} value={null} onChange={() => {}} />
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('shows all options in the select', () => {
      render(
        <StatusSelector options={threeOptions} value={null} onChange={() => {}} />
      );

      for (const option of threeOptions) {
        expect(screen.getByRole('option', { name: option })).toBeInTheDocument();
      }
    });

    it('shows selected value in the select', () => {
      render(
        <StatusSelector options={threeOptions} value="OK" onChange={() => {}} />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('OK');
    });

    it('calls onChange when select value changes', () => {
      const onChange = vi.fn();
      render(
        <StatusSelector options={threeOptions} value={null} onChange={onChange} />
      );

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'Substituído' },
      });
      expect(onChange).toHaveBeenCalledWith('Substituído');
    });

    it('calls onChange with null when empty option selected', () => {
      const onChange = vi.fn();
      render(
        <StatusSelector options={threeOptions} value="OK" onChange={onChange} />
      );

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: '' },
      });
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('applies warning style to warning options when selected', () => {
      render(
        <StatusSelector
          options={threeOptions}
          value="Necessita Troca"
          onChange={() => {}}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select.className).toContain('amber');
    });
  });
});
