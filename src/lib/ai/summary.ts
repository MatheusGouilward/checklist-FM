import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import type { ReportData } from '@/lib/report/types';
import type { SummaryResult } from './types';
import { buildSummaryPrompt } from './prompt';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export async function generateSummary(
  data: ReportData
): Promise<SummaryResult> {
  const model = process.env.AI_SUMMARY_MODEL ?? DEFAULT_MODEL;
  const prompt = buildSummaryPrompt(data);

  const result = await generateText({
    model: anthropic(model),
    prompt,
    maxOutputTokens: 500,
    temperature: 0.3,
  });

  return {
    summary: result.text.trim(),
    model,
  };
}
