import type { ReportData } from '@/lib/report/types';

const SERVICE_TYPE_PT: Record<ReportData['serviceType'], string> = {
  preventive: 'manutenção preventiva',
  corrective: 'manutenção corretiva',
  installation: 'instalação',
};

const SERVICE_RESULT_PT: Record<ReportData['serviceResult'], string> = {
  ok: 'Serviço concluído com sucesso',
  pending_issue: 'Pendência identificada',
  return_needed: 'Retorno necessário',
};

export function buildSummaryPrompt(data: ReportData): string {
  const itemLines = data.sections.flatMap((section) =>
    section.items.map((item) => {
      const val = item.value ?? 'Não preenchido';
      const obs = item.observation ? ` (obs: ${item.observation})` : '';
      return `- ${item.label}: ${val}${obs}`;
    })
  );

  return `Você é um assistente da Vobi, plataforma de gestão de manutenção predial.

Gere um resumo curto e claro (máximo 4 parágrafos) para o LOJISTA sobre a ${SERVICE_TYPE_PT[data.serviceType]} realizada no ar-condicionado da loja.

O lojista NÃO é técnico. Use linguagem simples, sem jargões. Seja objetivo e profissional.

## Dados do serviço

- Loja: ${data.storeName}
- Shopping: ${data.shoppingName}
- Técnico: ${data.technicianName}
- Tipo: ${SERVICE_TYPE_PT[data.serviceType]}
- Resultado: ${SERVICE_RESULT_PT[data.serviceResult]}
- Data de conclusão: ${data.completedAt}
${data.observations ? `- Observações do técnico: ${data.observations}` : ''}
${data.returnJustification ? `- Motivo do retorno: ${data.returnJustification}` : ''}

## Itens verificados

${itemLines.join('\n')}

## Instruções

1. Comece com uma frase dizendo que a manutenção foi concluída.
2. Resuma os principais pontos verificados e o estado geral do equipamento.
3. Se houver pendências ou retorno necessário, explique de forma clara o que isso significa para o lojista.
4. Finalize com uma nota positiva ou próximos passos, se aplicável.

Responda APENAS com o resumo, sem título, sem saudação, sem assinatura.`;
}
