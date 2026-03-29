import { describe, it, expect } from 'vitest';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_RESULT_LABELS,
  SERVICE_RESULT_COLORS,
} from './types';

describe('email types', () => {
  describe('SERVICE_TYPE_LABELS', () => {
    it('has labels for all service types', () => {
      expect(SERVICE_TYPE_LABELS.preventive).toBe('Preventiva');
      expect(SERVICE_TYPE_LABELS.corrective).toBe('Corretiva');
      expect(SERVICE_TYPE_LABELS.installation).toBe('Instalação');
    });
  });

  describe('SERVICE_RESULT_LABELS', () => {
    it('has labels for all service results', () => {
      expect(SERVICE_RESULT_LABELS.ok).toBeDefined();
      expect(SERVICE_RESULT_LABELS.pending_issue).toBeDefined();
      expect(SERVICE_RESULT_LABELS.return_needed).toBeDefined();
    });
  });

  describe('SERVICE_RESULT_COLORS', () => {
    it('has colors for all service results', () => {
      expect(SERVICE_RESULT_COLORS.ok).toMatch(/^#[0-9a-f]{6}$/);
      expect(SERVICE_RESULT_COLORS.pending_issue).toMatch(/^#[0-9a-f]{6}$/);
      expect(SERVICE_RESULT_COLORS.return_needed).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('uses green for ok, yellow for pending, red for return', () => {
      expect(SERVICE_RESULT_COLORS.ok).toBe('#16a34a');
      expect(SERVICE_RESULT_COLORS.pending_issue).toBe('#ca8a04');
      expect(SERVICE_RESULT_COLORS.return_needed).toBe('#dc2626');
    });
  });
});
