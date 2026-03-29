import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ReportData, ReportItem } from './types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#059669',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 0,
  },
  infoItem: {
    width: '50%',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 8,
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  resultBanner: {
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#f3f4f6',
    padding: 6,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  itemLabel: {
    fontSize: 9,
    color: '#374151',
    flex: 1,
  },
  itemRequired: {
    fontSize: 7,
    color: '#9ca3af',
    marginLeft: 4,
  },
  itemValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  itemObservation: {
    fontSize: 8,
    color: '#6b7280',
    fontStyle: 'italic',
    paddingHorizontal: 6,
    paddingBottom: 4,
  },
  observationsSection: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  observationsTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  observationsText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
});

function getServiceResultLabel(result: string): string {
  switch (result) {
    case 'ok':
      return 'SERVIÇO CONCLUÍDO — OK';
    case 'pending_issue':
      return 'PENDÊNCIA IDENTIFICADA';
    case 'return_needed':
      return 'RETORNO NECESSÁRIO';
    default:
      return result;
  }
}

function getResultBannerStyle(result: string) {
  switch (result) {
    case 'ok':
      return { backgroundColor: '#ecfdf5', color: '#059669' };
    case 'pending_issue':
      return { backgroundColor: '#fffbeb', color: '#d97706' };
    case 'return_needed':
      return { backgroundColor: '#fef2f2', color: '#dc2626' };
    default:
      return { backgroundColor: '#f3f4f6', color: '#374151' };
  }
}

function getItemValueColor(item: ReportItem): string {
  if (item.value === null || item.value === '') return '#9ca3af';
  const val = String(item.value).toLowerCase();
  if (val === 'ok' || val === 'substituído' || val === 'limpo' || val === 'recarga realizada') {
    return '#059669';
  }
  if (
    val.includes('necessita') || val === 'baixo' || val === 'descalibrado' ||
    val === 'folga' || val === 'desgaste' || val === 'obstruído' ||
    val === 'ruído anormal' || val === 'dano visível'
  ) {
    return '#d97706';
  }
  if (
    val === 'detectado' || val === 'danificado' || val === 'não funciona' ||
    val === 'vazamento' || val === 'vazamento detectado' || val === 'falha'
  ) {
    return '#dc2626';
  }
  return '#374151';
}

function formatServiceType(type: string): string {
  switch (type) {
    case 'preventive':
      return 'Preventiva';
    case 'corrective':
      return 'Corretiva';
    case 'installation':
      return 'Instalação';
    default:
      return type;
  }
}

export function ReportPDF({ data }: { data: ReportData }) {
  const bannerStyle = getResultBannerStyle(data.serviceResult);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Serviço — Vobi</Text>
          <Text style={styles.subtitle}>
            Checklist de Manutenção HVAC / PMOC
          </Text>
        </View>

        {/* Service info */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Loja</Text>
            <Text style={styles.infoValue}>{data.storeName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Shopping</Text>
            <Text style={styles.infoValue}>{data.shoppingName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Equipamento</Text>
            <Text style={styles.infoValue}>
              {data.equipmentModel} — {data.equipmentCapacity}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tipo de Serviço</Text>
            <Text style={styles.infoValue}>
              {formatServiceType(data.serviceType)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Técnico</Text>
            <Text style={styles.infoValue}>{data.technicianName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Data</Text>
            <Text style={styles.infoValue}>{data.completedAt}</Text>
          </View>
        </View>

        {/* Service result banner */}
        <View style={[styles.resultBanner, { backgroundColor: bannerStyle.backgroundColor }]}>
          <Text style={[styles.resultText, { color: bannerStyle.color }]}>
            {getServiceResultLabel(data.serviceResult)}
          </Text>
        </View>

        {/* Return justification */}
        {data.serviceResult === 'return_needed' && data.returnJustification && (
          <View style={[styles.observationsSection, { marginTop: 0, marginBottom: 12 }]}>
            <Text style={styles.observationsTitle}>Justificativa do Retorno</Text>
            <Text style={styles.observationsText}>{data.returnJustification}</Text>
          </View>
        )}

        {/* Sections */}
        {data.sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, iIdx) => (
              <React.Fragment key={iIdx}>
                <View style={styles.itemRow}>
                  <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    {item.required && (
                      <Text style={styles.itemRequired}>PMOC</Text>
                    )}
                  </View>
                  <Text style={[styles.itemValue, { color: getItemValueColor(item) }]}>
                    {item.value !== null && item.value !== ''
                      ? typeof item.value === 'number'
                        ? `${item.value}°C`
                        : String(item.value)
                      : '—'}
                  </Text>
                </View>
                {item.observation && (
                  <Text style={styles.itemObservation}>
                    Obs: {item.observation}
                  </Text>
                )}
              </React.Fragment>
            ))}
          </View>
        ))}

        {/* General observations */}
        {data.observations && (
          <View style={styles.observationsSection}>
            <Text style={styles.observationsTitle}>Observações Gerais</Text>
            <Text style={styles.observationsText}>{data.observations}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Vobi — Checklist de Execução de Serviço</Text>
          <Text>ID: {data.id}</Text>
        </View>
      </Page>
    </Document>
  );
}
