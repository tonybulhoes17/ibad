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

export const FichaPrint = React.forwardRef<HTMLDivElement, FichaPrintProps>(
  ({ record }, ref) => {
    const anesthesiaLabel = ANESTHESIA_TYPES.find(t => t.value === record.anesthesia_type)?.label
      ?? record.anesthesia_type
    const modalityLabel = MODALITIES.find(m => m.value === record.modality)?.label ?? record.modality

    return (
      <div
        ref={ref}
        className="print-only"
        style={{
          fontFamily: 'Arial, sans-serif',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        }}
      >

        {/* ── CABEÇALHO */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '2px solid #1A56A0', paddingBottom: 8, marginBottom: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {record.institutions?.logo_url && (
              <img src={record.institutions.logo_url} alt="logo"
                style={{ height: 40, maxWidth: 80, objectFit: 'contain' }} />
            )}
            <div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1A56A0', letterSpacing: 1 }}>
                FICHA ANESTÉSICA
              </div>
              <div style={{ fontSize: 10, color: '#64748B' }}>
                {record.institutions?.name ?? ''}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 9, color: '#64748B' }}>
            <div>IBAD — Sistema de Ficha Anestésica</div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#1E293B', marginTop: 2 }}>
              {record.anesthesia_code && `Cód: ${record.anesthesia_code}`}
            </div>
          </div>
        </div>

        {/* ── IDENTIFICAÇÃO */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 6 }}>
          <tbody>
            <tr>
              <td style={tdStyle}>
                <FieldLabel>Data</FieldLabel>
                <FieldValue>{formatDate(record.procedure_date)}</FieldValue>
              </td>
              <td style={{ ...tdStyle, width: '40%' }}>
                <FieldLabel>Nome do Paciente</FieldLabel>
                <FieldValue bold>{record.patient_name}</FieldValue>
              </td>
              <td style={tdStyle}>
                <FieldLabel>Idade</FieldLabel>
                <FieldValue>{record.patient_age ?? '—'} anos</FieldValue>
              </td>
              <td style={tdStyle}>
                <FieldLabel>Sexo</FieldLabel>
                <FieldValue>{record.patient_sex ?? '—'}</FieldValue>
              </td>
            </tr>
            <tr>
              <td style={tdStyle} colSpan={2}>
                <FieldLabel>Cirurgia Realizada</FieldLabel>
                <FieldValue bold>{record.surgery_name}</FieldValue>
              </td>
              <td style={tdStyle} colSpan={2}>
                <FieldLabel>Cirurgião</FieldLabel>
                <FieldValue>{record.surgeon ?? '—'}</FieldValue>
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>
                <FieldLabel>Tipo de Anestesia</FieldLabel>
                <FieldValue bold>{anesthesiaLabel}</FieldValue>
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

        {/* ── ORGANOGRAMA */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, marginBottom: 6, padding: 4, overflow: 'hidden' }}>
          <div style={{ fontSize: 8, fontWeight: 'bold', color: '#64748B', marginBottom: 4, letterSpacing: 0.5 }}>
            ORGANOGRAMA ANESTÉSICO
          </div>
          {record.timeline_data && (
            <div style={{ position: 'relative', height: '560px' }}>
              <div style={{ transform: 'scale(0.95)', transformOrigin: 'top left', width: '115%', position: 'absolute', top: 0, left: 0 }}>
                <Organograma data={record.timeline_data} mode="print" />
              </div>
            </div>
          )}
        </div>
        {/* ── DESCRIÇÃO */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, padding: '6px 8px', marginBottom: 6 }}>
          <div style={{ fontSize: 8, fontWeight: 'bold', color: '#64748B', marginBottom: 4, letterSpacing: 0.5 }}>
            DESCRIÇÃO DA ANESTESIA
          </div>
          <div style={{
            fontSize: 9,
            lineHeight: 1.6,
            color: '#1E293B',
            minHeight: `${12 * 1.6 * 9}px`,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {record.description ?? '—'}
          </div>
        </div>

        {/* ── TOTAIS */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, padding: '6px 12px', flex: 1 }}>
            <FieldLabel>Total de Fluidos</FieldLabel>
            <FieldValue bold mono>{record.total_fluids_ml ? `${record.total_fluids_ml} mL` : '—'}</FieldValue>
          </div>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, padding: '6px 12px', flex: 1 }}>
            <FieldLabel>Destino Pós-Op</FieldLabel>
            <FieldValue bold>{record.destination ?? '—'}</FieldValue>
          </div>
        </div>

        {/* ── ASSINATURA */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 4, textAlign: 'right' }}>
          <div style={{ display: 'inline-block', textAlign: 'center', minWidth: 200 }}>
            {record.profiles?.signature_url && (
              <img
                src={record.profiles.signature_url}
                alt="Assinatura"
                style={{ maxHeight: 36, maxWidth: 160, display: 'block', margin: '0 auto 2px' }}
              />
            )}
            <div style={{ borderTop: '1px solid #1E293B', paddingTop: 2, marginTop: 2 }}>
              <div style={{ fontSize: 9.5, fontWeight: 'bold', color: '#1E293B', lineHeight: 1.2 }}>
                {record.profiles?.full_name ?? '—'}
              </div>
              <div style={{ fontSize: 8, color: '#64748B', lineHeight: 1.2 }}>Anestesiologista</div>
              <div style={{ fontSize: 8, color: '#64748B', fontFamily: 'monospace', lineHeight: 1.2 }}>
                CRM: {record.profiles?.crm ?? '—'}
              </div>
              {record.profiles?.rqe && (
                <div style={{ fontSize: 8, color: '#64748B', fontFamily: 'monospace', lineHeight: 1.2 }}>
                  RQE: {record.profiles.rqe}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    )
  }
)

FichaPrint.displayName = 'FichaPrint'

// Helpers de estilo
const tdStyle: React.CSSProperties = {
  padding: '3px 6px',
  verticalAlign: 'top',
  borderBottom: '1px solid #F1F5F9',
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 7.5, color: '#94A3B8', fontWeight: 'bold', letterSpacing: 0.5, textTransform: 'uppercase' }}>{children}</div>
}

function FieldValue({ children, bold, mono }: { children: React.ReactNode; bold?: boolean; mono?: boolean }) {
  return (
    <div style={{
      fontSize: 9.5,
      fontWeight: bold ? 'bold' : 'normal',
      fontFamily: mono ? 'monospace' : 'Arial',
      color: '#1E293B',
    }}>
      {children}
    </div>
  )
}
