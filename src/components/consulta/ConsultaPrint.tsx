import React from 'react'
import { formatDate } from '@/lib/utils'

interface ConsultaPrintProps {
  record: any
  profile: any
}

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
    <div style={{ fontSize: 9.5, fontWeight: bold ? 'bold' : 'normal', fontFamily: mono ? 'monospace' : 'Arial', color: '#1E293B' }}>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 8, fontWeight: 'bold', color: '#64748B', marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0', paddingBottom: 2 }}>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
      <span style={{ fontSize: 8, color: '#94A3B8', fontWeight: 'bold', minWidth: 110, textTransform: 'uppercase' }}>{label}:</span>
      <span style={{ fontSize: 9, color: '#1E293B', flex: 1 }}>{value || '—'}</span>
    </div>
  )
}

export const ConsultaPrint = React.forwardRef<HTMLDivElement, ConsultaPrintProps>(
  ({ record: r, profile }, ref) => {
    return (
      <div ref={ref} className="a4-preview print-only" style={{ fontFamily: 'Arial, sans-serif', width: '105%' }}>

        {/* CABEÇALHO */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #1A56A0', paddingBottom: 8, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {r.institutions?.logo_url && (
              <img src={r.institutions.logo_url} alt="logo" style={{ height: 40, maxWidth: 80, objectFit: 'contain' }} />
            )}
            <div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1A56A0', letterSpacing: 1 }}>
                FICHA PRÉ ANESTÉSICA
                {r.vad_risk && <span style={{ marginLeft: 8, fontSize: 11, background: '#EF4444', color: 'white', padding: '1px 6px', borderRadius: 4 }}>VAD</span>}
                {r.allergies && <span style={{ marginLeft: 6, fontSize: 11, background: '#F97316', color: 'white', padding: '1px 6px', borderRadius: 4 }}>ALÉRGICO</span>}
              </div>
              <div style={{ fontSize: 10, color: '#64748B' }}>{r.institutions?.name ?? ''}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 9, color: '#64748B' }}>
            <div>IBAD — Sistema de Ficha Anestésica</div>
          </div>
        </div>

        {/* DADOS PESSOAIS */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 5 }}>
          <tbody>
            <tr>
              <td style={{ ...tdStyle, background: '#F8FAFC' }} colSpan={4}>
                <div style={{ fontSize: 8, fontWeight: 'bold', color: '#1A56A0', letterSpacing: 0.5 }}>DADOS PESSOAIS</div>
              </td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, width: '35%' }} colSpan={2}>
                <FieldLabel>Nome do Paciente</FieldLabel>
                <FieldValue bold>{r.patient_name}</FieldValue>
              </td>
              <td style={tdStyle}>
                <FieldLabel>Sexo</FieldLabel>
                <FieldValue>{r.patient_sex ?? '—'}</FieldValue>
              </td>
              <td style={tdStyle}>
                <FieldLabel>Idade</FieldLabel>
                <FieldValue>{r.patient_age ? `${r.patient_age} anos` : '—'}</FieldValue>
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>
                <FieldLabel>Profissão</FieldLabel>
                <FieldValue>{r.patient_profession ?? '—'}</FieldValue>
              </td>
              <td style={tdStyle}>
                <FieldLabel>Cor</FieldLabel>
                <FieldValue>{r.patient_color ?? '—'}</FieldValue>
              </td>
              <td style={tdStyle} colSpan={2}>
                <FieldLabel>Cidade</FieldLabel>
                <FieldValue>{r.patient_city ?? '—'}</FieldValue>
              </td>
            </tr>
            <tr>
              <td style={tdStyle} colSpan={4}>
                <FieldLabel>Telefone</FieldLabel>
                <FieldValue mono>{r.patient_phone ?? '—'}</FieldValue>
              </td>
            </tr>
          </tbody>
        </table>

        {/* DADOS DO PROCEDIMENTO */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 5 }}>
          <tbody>
            <tr>
              <td style={{ ...tdStyle, background: '#F8FAFC' }} colSpan={4}>
                <div style={{ fontSize: 8, fontWeight: 'bold', color: '#1A56A0', letterSpacing: 0.5 }}>DADOS DO PROCEDIMENTO</div>
              </td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, width: '45%' }} colSpan={2}>
                <FieldLabel>Cirurgia Proposta</FieldLabel>
                <FieldValue bold>{r.surgery_name ?? '—'}</FieldValue>
              </td>
              <td style={{ ...tdStyle, width: '35%' }}>
                <FieldLabel>Cirurgião</FieldLabel>
                <FieldValue>{r.surgeon ?? '—'}</FieldValue>
              </td>
              <td style={tdStyle}>
                <FieldLabel>Data Procedimento</FieldLabel>
                <FieldValue mono>{formatDate(r.procedure_date)}</FieldValue>
              </td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, width: '45%' }} colSpan={2}>
                <FieldLabel>Hospital da Cirurgia</FieldLabel>
                <FieldValue>{r.surgery_hospital ?? '—'}</FieldValue>
              </td>
              <td style={tdStyle}>
                <FieldLabel>Instituição da Consulta</FieldLabel>
                <FieldValue>{r.institutions?.name ?? '—'}</FieldValue>
              </td>
              <td style={tdStyle}>
                <FieldLabel>Data da Consulta</FieldLabel>
                <FieldValue mono>{formatDate(r.consultation_date)}</FieldValue>
              </td>
            </tr>
          </tbody>
        </table>

        {/* HISTÓRICO CLÍNICO */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, padding: '5px 8px', marginBottom: 5 }}>
          <SectionTitle>Histórico Clínico/Cirúrgico</SectionTitle>
          <Row label="Cirurgias Anteriores" value={r.previous_surgeries} />
          <Row label="Intercorrências" value={r.complications} />
          <Row label="Hemotransfusão" value={r.blood_transfusion} />
          <Row label="Hábitos" value={r.habits} />
          <Row label="Alergias" value={r.allergies ? (r.allergies_details || 'Sim') : 'Não'} />
          <Row label="Comorbidades" value={r.comorbidities} />
          <div style={{ marginTop: 3 }}>
            <span style={{ fontSize: 8, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' }}>Medicamentos em Uso: </span>
            <span style={{ fontSize: 9, color: '#1E293B' }}>{r.medications || '—'}</span>
          </div>
        </div>

        {/* EXAME FÍSICO */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, padding: '5px 8px', marginBottom: 5 }}>
          <SectionTitle>Exame Físico</SectionTitle>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 auto' }}>
              <FieldLabel>Estado Físico ASA</FieldLabel>
              <FieldValue bold>{r.asa_status ?? '—'}</FieldValue>
            </div>
            <div style={{ flex: '0 0 auto' }}>
              <FieldLabel>Urgência</FieldLabel>
              <FieldValue>{r.urgency ? '☑' : '☐'}</FieldValue>
            </div>
            <div style={{ flex: '0 0 auto' }}>
              <FieldLabel>Peso (kg)</FieldLabel>
              <FieldValue>{r.weight ?? '—'}</FieldValue>
            </div>
            <div style={{ flex: '0 0 auto' }}>
              <FieldLabel>IMC</FieldLabel>
              <FieldValue>{r.imc ?? '—'}</FieldValue>
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel>Exame Físico</FieldLabel>
              <FieldValue>{r.physical_exam ?? '—'}</FieldValue>
            </div>
            <div style={{ flex: '0 0 auto' }}>
              <FieldLabel>Mallampati</FieldLabel>
              <FieldValue bold>{r.mallampati ?? '—'}</FieldValue>
            </div>
            <div style={{ flex: '0 0 auto' }}>
              <FieldLabel>Risco VAD</FieldLabel>
              <FieldValue bold>{r.vad_risk ? '☑' : '☐'}</FieldValue>
            </div>
          </div>
        </div>

        {/* EXAMES */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, padding: '5px 8px', marginBottom: 5 }}>
          <SectionTitle>Exames</SectionTitle>
          <Row label="Laboratório" value={r.lab_results} />
          <Row label="RX Tórax" value={r.xray} />
          <Row label="ECG" value={r.ecg} />
          <Row label="Outros Exames" value={r.other_exams} />
          <Row label="Especialista" value={r.specialist} />
        </div>

        {/* CONCLUSÃO */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, padding: '5px 8px', marginBottom: 5 }}>
          <SectionTitle>Conclusão</SectionTitle>
          <Row label="Apto ao Procedimento?" value={r.fit_for_procedure ? 'SIM' : 'NÃO'} />
          <Row label="Anestesia Proposta" value={r.proposed_anesthesia} />
          <Row label="Reserva de Vaga UTI" value={r.uti_reservation ? 'SIM' : 'NÃO'} />
          <Row label="Reserva de Hemocomp." value={r.blood_components ? 'SIM' : 'NÃO'} />
          {r.specialist && <Row label="Especialista" value={r.specialist} />}
          <div style={{ marginTop: 3 }}>
            <span style={{ fontSize: 8, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' }}>Jejum: </span>
            <span style={{ fontSize: 9, color: '#1E293B' }}>{r.fasting || '—'}</span>
          </div>
          {r.medication_instructions && (
            <div style={{ marginTop: 3 }}>
              <span style={{ fontSize: 8, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' }}>Medicamentos em Uso: </span>
              <span style={{ fontSize: 9, color: '#1E293B' }}>{r.medication_instructions}</span>
            </div>
          )}
          {r.observations && (
            <div style={{ marginTop: 3 }}>
              <span style={{ fontSize: 8, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' }}>Observações: </span>
              <span style={{ fontSize: 9, color: '#1E293B' }}>{r.observations}</span>
            </div>
          )}
        </div>

        {/* DATA CONSULTA */}
        <div style={{ fontSize: 9, color: '#64748B', marginBottom: 8 }}>
          Data da Consulta: {formatDate(r.consultation_date)}
        </div>

        {/* ASSINATURA */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 4, textAlign: 'right' }}>
          <div style={{ display: 'inline-block', textAlign: 'center', minWidth: 200 }}>
            {profile?.signature_url && (
              <img src={profile.signature_url} alt="Assinatura"
                style={{ maxHeight: 36, maxWidth: 160, display: 'block', margin: '0 auto 2px' }} />
            )}
            <div style={{ borderTop: '1px solid #1E293B', paddingTop: 2, marginTop: 2 }}>
              <div style={{ fontSize: 9.5, fontWeight: 'bold', color: '#1E293B', lineHeight: 1.2 }}>{profile?.full_name ?? '—'}</div>
              <div style={{ fontSize: 8, color: '#64748B', lineHeight: 1.2 }}>Anestesiologista</div>
              <div style={{ fontSize: 8, color: '#64748B', fontFamily: 'monospace', lineHeight: 1.2 }}>CRM: {profile?.crm ?? '—'}</div>
              {profile?.rqe && <div style={{ fontSize: 8, color: '#64748B', fontFamily: 'monospace', lineHeight: 1.2 }}>RQE: {profile.rqe}</div>}
            </div>
          </div>
        </div>

      </div>
    )
  }
)

ConsultaPrint.displayName = 'ConsultaPrint'
