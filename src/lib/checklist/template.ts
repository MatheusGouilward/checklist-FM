import type { ChecklistSectionTemplate } from './types';

export const CHECKLIST_TEMPLATE: ChecklistSectionTemplate[] = [
  {
    id: 'filters-air-quality',
    title: 'Filtros e Qualidade do Ar',
    items: [
      {
        id: 'filter-condition',
        label: 'Estado dos filtros de ar',
        required: true,
        responseType: 'options',
        options: ['OK', 'Necessita Troca', 'Substituído'],
      },
      {
        id: 'condensation-trays',
        label: 'Limpeza das bandejas de condensação',
        required: true,
        responseType: 'options',
        options: ['OK', 'Necessita Limpeza', 'Limpo'],
      },
      {
        id: 'odor-contamination',
        label: 'Verificação de odores ou contaminação',
        required: true,
        responseType: 'options',
        options: ['OK', 'Detectado'],
      },
    ],
  },
  {
    id: 'mechanical-components',
    title: 'Componentes Mecânicos',
    items: [
      {
        id: 'coils-condition',
        label: 'Estado das serpentinas (evaporador/condensador)',
        required: true,
        responseType: 'options',
        options: ['OK', 'Necessita Limpeza', 'Danificado'],
      },
      {
        id: 'fan-operation',
        label: 'Funcionamento dos ventiladores',
        required: true,
        responseType: 'options',
        options: ['OK', 'Ruído Anormal', 'Não Funciona'],
      },
      {
        id: 'drains-piping',
        label: 'Verificação de drenos e tubulação',
        required: true,
        responseType: 'options',
        options: ['OK', 'Obstruído', 'Vazamento'],
      },
    ],
  },
  {
    id: 'refrigeration-system',
    title: 'Sistema de Refrigeração',
    items: [
      {
        id: 'refrigerant-level',
        label: 'Nível e pressão do fluido refrigerante',
        required: true,
        responseType: 'options',
        options: ['OK', 'Baixo', 'Recarga Realizada'],
      },
      {
        id: 'gas-leak',
        label: 'Verificação de vazamento de gás',
        required: true,
        responseType: 'options',
        options: ['OK', 'Vazamento Detectado'],
      },
    ],
  },
  {
    id: 'electrical-components',
    title: 'Componentes Elétricos',
    items: [
      {
        id: 'electrical-connections',
        label: 'Conexões elétricas e fiação',
        required: true,
        responseType: 'options',
        options: ['OK', 'Folga', 'Desgaste'],
      },
      {
        id: 'thermostat-control',
        label: 'Funcionamento do termostato/controle',
        required: true,
        responseType: 'options',
        options: ['OK', 'Descalibrado', 'Não Funciona'],
      },
      {
        id: 'startup-shutdown',
        label: 'Teste de startup/shutdown do sistema',
        required: true,
        responseType: 'options',
        options: ['OK', 'Falha'],
      },
    ],
  },
  {
    id: 'structure-general',
    title: 'Estrutura e Geral',
    items: [
      {
        id: 'cabinet-condition',
        label: 'Estado da estrutura/gabinete externo',
        required: false,
        responseType: 'options',
        options: ['OK', 'Dano Visível'],
      },
      {
        id: 'air-output-temperature',
        label: 'Temperatura de saída do ar (°C)',
        required: false,
        responseType: 'numeric',
      },
    ],
  },
];

export const TOTAL_ITEMS = CHECKLIST_TEMPLATE.reduce(
  (sum, section) => sum + section.items.length,
  0
);

export const REQUIRED_ITEMS = CHECKLIST_TEMPLATE.reduce(
  (sum, section) => sum + section.items.filter((item) => item.required).length,
  0
);
