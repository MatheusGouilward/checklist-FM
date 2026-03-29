import type { ReportData } from '@/lib/report/types';

export interface SummaryRequest {
  checklist: ReportData;
}

export interface SummaryResult {
  summary: string;
  model: string;
}
