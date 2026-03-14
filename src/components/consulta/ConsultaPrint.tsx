import React from 'react'
import { formatDate } from '@/lib/utils'

interface ConsultaPrintProps {
  record: any
  profile: any
}

const tdStyle: React.CSSProperties = {
  padding: '5px 8px',
  verticalAlign: 'top',
  borderBottom: '1px solid #F1F5F9',
  lineHeight: 1.3,
}

const sectionStyle: React.CSSProperties = {
  border: '1px solid #E2E8F0',
  borderRadius: 4,
  padding: '7px 10px',
  marginBottom: 0,
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 8.5, color: '#94A3B8', fontWeight: 'bold', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 1, lineHeight: 1.2 }}>
      {children}
    </div>
  )
}

function FieldValue({ children, bold, mono }: { children: React.ReactNode; bold?: boolean; mono?: boolean }) {
  return (
    <div style={{ fontSize: 11, fontWeight: bold ? 'bold' : 'normal', fontFamily: mono ? 'monospace' : 'Arial', color: '#1E293B', lineHeight: 1.3 }}>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 9.5, fontWeight: 'bold', color: '#1A56A0', marginBottom: 5, letterSpacing: 0.5, textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0', paddingBottom: 3, lineHeight: 1.2 }}>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
      <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 'bold', minWidth: 115, textTransform: 'uppercase', flexShrink: 0, lineHeight: 1.3 }}>
        {label}:
      </span>
      <span style={{ fontSize: 10.5, color: '#1E293B', flex: 1, lineHeight: 1.3 }}>
        {value || '—'}
      </span>
    </div>
  )
}

export const ConsultaPrint = React.forwardRef<HTMLDivElement, ConsultaPrintProps>(
  ({ record: r, profile }, ref) => {
    return (
      <div
        ref={ref}
        className="print-only"
        style={{
          width: '190mm',
          height: '272mm',
          margin: '-9mm auto 0',
          background: '#fff',
          padding: '4mm 8mm',
          boxSizing: 'border-box',
          color: '#1E293B',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {/* CABEÇALHO */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2.5px solid #1A56A0', paddingBottom: 8, marginBottom: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {r.institutions?.logo_url && (
              <img src={r.institutions.logo_url} alt="logo" style={{ height: 52, maxWidth: 96, objectFit: 'contain' }} />
            )}
            <div>
              <div style={{ fontSize: 22, fontWeight: 'bold', color: '#1A56A0', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1.1 }}>
                FICHA PRÉ ANESTÉSICA
                {r.vad_risk && <span style={{ fontSize: 10, background: '#EF4444', color: 'white', padding: '2px 6px', borderRadius: 3, fontWeight: 'bold' }}>VAD</span>}
                {r.allergies && <span style={{ fontSize: 10, background: '#F97316', color: 'white', padding: '2px 6px', borderRadius: 3, fontWeight: 'bold' }}>ALÉRGICO</span>}
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>{r.institutions?.name ?? ''}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 9.5, color: '#64748B' }}>
            IBAD — Sistema de Ficha Anestésica
          </div>
        </div>

        {/* MIOLO — flex cresce para ocupar o espaço */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6, minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

            {/* DADOS PESSOAIS */}
            <div style={sectionStyle}>
              <SectionTitle>Dados Pessoais</SectionTitle>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ ...tdStyle, width: '38%' }} colSpan={2}>
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
                    <td style={tdStyle}>
                      <FieldLabel>CPF</FieldLabel>
                      <FieldValue mono>{r.patient_cpf ?? '—'}</FieldValue>
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
                    <td style={tdStyle}>
                      <FieldLabel>Telefone</FieldLabel>
                      <FieldValue mono>{r.patient_phone ?? '—'}</FieldValue>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* DADOS DO PROCEDIMENTO */}
            <div style={sectionStyle}>
              <SectionTitle>Dados do Procedimento</SectionTitle>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ ...tdStyle, width: '38%' }} colSpan={2}>
                      <FieldLabel>Cirurgia Proposta</FieldLabel>
                      <FieldValue bold>{r.surgery_name ?? '—'}</FieldValue>
                    </td>
                    <td style={{ ...tdStyle, width: '28%' }}>
                      <FieldLabel>Cirurgião</FieldLabel>
                      <FieldValue>{r.surgeon ?? '—'}</FieldValue>
                    </td>
                    <td style={tdStyle}>
                      <FieldLabel>Data Procedimento</FieldLabel>
                      <FieldValue mono>{formatDate(r.procedure_date)}</FieldValue>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ ...tdStyle, width: '38%' }} colSpan={2}>
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
            </div>

            {/* HISTÓRICO CLÍNICO */}
            <div style={sectionStyle}>
              <SectionTitle>Histórico Clínico/Cirúrgico</SectionTitle>
              <Row label="Cirurgias Anteriores" value={r.previous_surgeries} />
              <Row label="Intercorrências" value={r.complications} />
              <Row label="Hemotransfusão" value={r.blood_transfusion} />
              <Row label="Hábitos" value={r.habits} />
              <Row label="Alergias" value={r.allergies ? (r.allergies_details || 'Sim') : 'Não'} />
              <Row label="Comorbidades" value={r.comorbidities} />
              <div style={{ display: 'flex', gap: 6, marginBottom: 0 }}>
                <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 'bold', minWidth: 115, textTransform: 'uppercase', flexShrink: 0 }}>Medicamentos em Uso:</span>
                <span style={{ fontSize: 10.5, color: '#1E293B', flex: 1 }}>{r.medications || '—'}</span>
              </div>
            </div>

            {/* EXAME FÍSICO */}
            <div style={sectionStyle}>
              <SectionTitle>Exame Físico</SectionTitle>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={tdStyle}>
                      <FieldLabel>Estado Físico ASA</FieldLabel>
                      <FieldValue bold>{r.asa_status ?? '—'}</FieldValue>
                    </td>
                    <td style={tdStyle}>
                      <FieldLabel>Urgência</FieldLabel>
                      <FieldValue>{r.urgency ? '☑' : '☐'}</FieldValue>
                    </td>
                    <td style={tdStyle}>
                      <FieldLabel>Peso (kg)</FieldLabel>
                      <FieldValue>{r.weight ?? '—'}</FieldValue>
                    </td>
                    <td style={tdStyle}>
                      <FieldLabel>IMC</FieldLabel>
                      <FieldValue>{r.imc ?? '—'}</FieldValue>
                    </td>
                    <td style={tdStyle}>
                      <FieldLabel>Mallampati</FieldLabel>
                      <FieldValue bold>{r.mallampati ?? '—'}</FieldValue>
                    </td>
                    <td style={tdStyle}>
                      <FieldLabel>Risco VAD</FieldLabel>
                      <FieldValue bold>{r.vad_risk ? '☑' : '☐'}</FieldValue>
                    </td>
                  </tr>
                  <tr>
                    <td style={tdStyle} colSpan={6}>
                      <FieldLabel>Exame Físico</FieldLabel>
                      <FieldValue>{r.physical_exam ?? '—'}</FieldValue>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* EXAMES */}
            <div style={sectionStyle}>
              <SectionTitle>Exames</SectionTitle>
              <Row label="Laboratório" value={r.lab_results} />
              <Row label="RX Tórax" value={r.xray} />
              <Row label="ECG" value={r.ecg} />
              <Row label="Outros Exames" value={r.other_exams} />
              <Row label="Especialista" value={r.specialist} />
            </div>

            {/* CONCLUSÃO */}
            <div style={sectionStyle}>
              <SectionTitle>Conclusão</SectionTitle>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 5 }}>
                <tbody>
                  <tr>
                    <td style={tdStyle}>
                      <FieldLabel>Apto ao Procedimento?</FieldLabel>
                      <FieldValue bold>{r.fit_for_procedure ? 'SIM' : 'NÃO'}</FieldValue>
                    </td>
                    <td style={tdStyle}>
                      <FieldLabel>Anestesia Proposta</FieldLabel>
                      <FieldValue bold>{r.proposed_anesthesia ?? '—'}</FieldValue>
                    </td>
                    <td style={tdStyle}>
                      <FieldLabel>Reserva UTI</FieldLabel>
                      <FieldValue>{r.uti_reservation ? 'SIM' : 'NÃO'}</FieldValue>
                    </td>
                    <td style={tdStyle}>
                      <FieldLabel>Reserva Hemocomp.</FieldLabel>
                      <FieldValue>{r.blood_components ? 'SIM' : 'NÃO'}</FieldValue>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 'bold', minWidth: 115, textTransform: 'uppercase', flexShrink: 0 }}>Jejum:</span>
                <span style={{ fontSize: 10.5, color: '#1E293B', flex: 1 }}>{r.fasting || '—'}</span>
              </div>
              {r.medication_instructions && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 'bold', minWidth: 115, textTransform: 'uppercase', flexShrink: 0 }}>Medicamentos:</span>
                  <span style={{ fontSize: 10.5, color: '#1E293B', flex: 1 }}>{r.medication_instructions}</span>
                </div>
              )}
              {r.observations && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 'bold', minWidth: 115, textTransform: 'uppercase', flexShrink: 0 }}>Observações:</span>
                  <span style={{ fontSize: 10.5, color: '#1E293B', flex: 1 }}>{r.observations}</span>
                </div>
              )}
            </div>
          </div>

          {/* RODAPÉ — empurrado para baixo pelo flex */}
          <div>
            <div style={{ fontSize: 9.5, color: '#64748B', marginBottom: 8 }}>
              Data da Consulta: {formatDate(r.consultation_date)}
            </div>
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 6, textAlign: 'right' }}>
              <div style={{ display: 'inline-block', textAlign: 'center', minWidth: 200 }}>
                {profile?.signature_url && (
                  <img src={profile.signature_url} alt="Assinatura" style={{ maxHeight: 40, maxWidth: 160, display: 'block', margin: '0 auto 3px' }} />
                )}
                <div style={{ borderTop: '1px solid #1E293B', paddingTop: 3, marginTop: 3 }}>
                  <div style={{ fontSize: 10, fontWeight: 'bold', color: '#1E293B', lineHeight: 1.2 }}>{profile?.full_name ?? '—'}</div>
                  <div style={{ fontSize: 8.5, color: '#64748B', lineHeight: 1.2 }}>Anestesiologista</div>
                  <div style={{ fontSize: 8.5, color: '#64748B', fontFamily: 'monospace', lineHeight: 1.2 }}>CRM: {profile?.crm ?? '—'}</div>
                  {profile?.rqe && <div style={{ fontSize: 8.5, color: '#64748B', fontFamily: 'monospace', lineHeight: 1.2 }}>RQE: {profile.rqe}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

ConsultaPrint.displayName = 'ConsultaPrint'
