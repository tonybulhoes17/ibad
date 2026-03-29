import React from 'react'
import type { AnesthesiaRecordWithRelations } from '@/types/database.types'
import { Organograma } from './Organograma'
import { ANESTHESIA_TYPES, MODALITIES } from '@/constants/anesthesia'
import { formatDate, formatTime } from '@/lib/utils'

interface FichaPrintProps {
  record: AnesthesiaRecordWithRelations & {
    profiles?: {
      full_name: string
      crm: string
      rqe: string | null
      signature_url: string | null
    } | null
    institutions?: {
      name: string
      logo_url: string | null
    } | null
  }
}

const tdStyle: React.CSSProperties = {
  padding: '3px 8px',
  verticalAlign: 'top',
  borderBottom: '1px solid #F1F5F9',
  lineHeight: 1.3,
}

const sectionStyle: React.CSSProperties = {
  border: '1px solid #E2E8F0',
  borderRadius: 4,
  padding: '5px 10px',
  marginBottom: 0,
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 8.5,
        color: '#94A3B8',
        fontWeight: 'bold',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        marginBottom: 1,
        lineHeight: 1.2,
      }}
    >
      {children}
    </div>
  )
}

function FieldValue({
  children,
  bold,
  mono,
}: {
  children: React.ReactNode
  bold?: boolean
  mono?: boolean
}) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: bold ? 'bold' : 'normal',
        fontFamily: mono ? 'monospace' : 'Arial',
        color: '#1E293B',
        lineHeight: 1.3,
      }}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 9.5,
        fontWeight: 'bold',
        color: '#1A56A0',
        marginBottom: 5,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: 3,
        lineHeight: 1.2,
      }}
    >
      {children}
    </div>
  )
}

export const FichaPrint = React.forwardRef<HTMLDivElement, FichaPrintProps>(
  ({ record }, ref) => {
    const anesthesiaLabel =
      ANESTHESIA_TYPES.find(t => t.value === record.anesthesia_type)?.label ??
      record.anesthesia_type

    const modalityLabel =
      MODALITIES.find(m => m.value === record.modality)?.label ?? record.modality

    return (
      <div
        ref={ref}
        className="print-only"
        style={{
          width: '210mm',
          height: '279mm',
          margin: '0 auto',
          background: '#fff',
          padding: '8mm 10mm',
          boxSizing: 'border-box',
          color: '#1E293B',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {/* CABEÇALHO */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2.5px solid #1A56A0',
            paddingBottom: 8,
            marginBottom: 8,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {record.institutions?.logo_url && (
              <img
                src={record.institutions.logo_url}
                alt="logo"
                style={{ height: 60, maxWidth: 96, objectFit: 'contain' }}
              />
            )}
            <div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 'bold',
                  color: '#1A56A0',
                  letterSpacing: 0.5,
                  lineHeight: 1.1,
                }}
              >
                FICHA ANESTÉSICA
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>
                {record.institutions?.name ?? ''}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: 10, color: '#64748B' }}>
            <div>AnestPrime — A Plataforma do Anestesista</div>
            {record.anesthesia_code && (
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 10.5,
                  color: '#1E293B',
                  marginTop: 3,
                }}
              >
                Cód: {record.anesthesia_code}
              </div>
            )}
          </div>
        </div>

        {/* MIOLO */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* IDENTIFICAÇÃO */}
            <div style={sectionStyle}>
              <SectionTitle>Identificação e Procedimento</SectionTitle>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ ...tdStyle, width: '16%' }}>
                      <FieldLabel>Data</FieldLabel>
                      <FieldValue mono>{formatDate(record.procedure_date)}</FieldValue>
                    </td>
                    <td style={{ ...tdStyle, width: '42%' }}>
                      <FieldLabel>Nome do Paciente</FieldLabel>
                      <FieldValue bold>{record.patient_name ?? '—'}</FieldValue>
                    </td>
                    <td style={{ ...tdStyle, width: '14%' }}>
                      <FieldLabel>Idade</FieldLabel>
                      <FieldValue>
                        {record.patient_age ? `${record.patient_age} anos` : '—'}
                      </FieldValue>
                    </td>
                    <td style={{ ...tdStyle, width: '10%' }}>
                      <FieldLabel>Sexo</FieldLabel>
                      <FieldValue>{record.patient_sex ?? '—'}</FieldValue>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ ...tdStyle, width: '42%' }} colSpan={2}>
                      <FieldLabel>Cirurgia Realizada</FieldLabel>
                      <FieldValue bold>{record.surgery_name ?? '—'}</FieldValue>
                    </td>
                    <td style={tdStyle} colSpan={2}>
                      <FieldLabel>Cirurgião</FieldLabel>
                      <FieldValue>{record.surgeon ?? '—'}</FieldValue>
                    </td>
                  </tr>
                  <tr>
                    <td style={tdStyle}>
                      <FieldLabel>Tipo de Anestesia</FieldLabel>
                      <FieldValue bold>{anesthesiaLabel ?? '—'}</FieldValue>
                    </td>
                    <td style={tdStyle}>
                      <FieldLabel>Modalidade</FieldLabel>
                      <FieldValue>{modalityLabel ?? '—'}</FieldValue>
                    </td>
                    <td style={tdStyle}>
                      <FieldLabel>Hora Início</FieldLabel>
                      <FieldValue mono>{formatTime(record.start_time)}</FieldValue>
                    </td>
                    <td style={tdStyle}>
                      <FieldLabel>Hora Fim</FieldLabel>
                      <FieldValue mono>{formatTime(record.end_time)}</FieldValue>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ORGANOGRAMA */}
            <div style={sectionStyle}>
              <SectionTitle>Organograma Anestésico</SectionTitle>
              <div
                style={{
                  width: '100%',
                  height: '118mm',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {record.timeline_data ? (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        transform: 'scale(0.91)',
                        transformOrigin: 'top left',
                        width: '109.9%',
                      }}
                    >
                      <Organograma data={record.timeline_data} mode="print" />
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94A3B8',
                      fontSize: 11,
                    }}
                  >
                    Sem dados do organograma
                  </div>
                )}
              </div>
            </div>

            {/* DESCRIÇÃO E DADOS FINAIS */}
            <div style={sectionStyle}>
              <SectionTitle>Descrição da Anestesia</SectionTitle>
              <div
                style={{
                  fontSize: 10.5,
                  color: '#1E293B',
                  lineHeight: 1.4,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  minHeight: '42px',
                  marginBottom: 6,
                }}
              >
                {record.description ?? '—'}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ ...tdStyle, width: '50%', borderBottom: 'none' }}>
                      <FieldLabel>Total de Fluidos</FieldLabel>
                      <FieldValue bold mono>
                        {record.total_fluids_ml ? `${record.total_fluids_ml} mL` : '—'}
                      </FieldValue>
                    </td>
                    <td style={{ ...tdStyle, width: '50%', borderBottom: 'none' }}>
                      <FieldLabel>Destino Pós-Op</FieldLabel>
                      <FieldValue bold>{record.destination ?? '—'}</FieldValue>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* RODAPÉ */}
          <div style={{ marginTop: 'auto', paddingTop: 8 }}>
            <div
              style={{
                borderTop: '1px solid #E2E8F0',
                paddingTop: 6,
                textAlign: 'right',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  textAlign: 'center',
                  minWidth: 200,
                }}
              >
                {record.profiles?.signature_url && (
                  <img
                    src={record.profiles.signature_url}
                    alt="Assinatura"
                    style={{
                      maxHeight: 40,
                      maxWidth: 160,
                      display: 'block',
                      margin: '0 auto 3px',
                    }}
                  />
                )}
                <div
                  style={{
                    borderTop: '1px solid #1E293B',
                    paddingTop: 3,
                    marginTop: 3,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 'bold',
                      color: '#1E293B',
                      lineHeight: 1.2,
                    }}
                  >
                    {record.profiles?.full_name ?? '—'}
                  </div>
                  <div
                    style={{
                      fontSize: 8.5,
                      color: '#64748B',
                      lineHeight: 1.2,
                    }}
                  >
                    Anestesiologista
                  </div>
                  <div
                    style={{
                      fontSize: 8.5,
                      color: '#64748B',
                      fontFamily: 'monospace',
                      lineHeight: 1.2,
                    }}
                  >
                    CRM: {record.profiles?.crm ?? '—'}
                  </div>
                  {record.profiles?.rqe && (
                    <div
                      style={{
                        fontSize: 8.5,
                        color: '#64748B',
                        fontFamily: 'monospace',
                        lineHeight: 1.2,
                      }}
                    >
                      RQE: {record.profiles.rqe}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

FichaPrint.displayName = 'FichaPrint'