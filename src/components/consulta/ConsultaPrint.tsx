import React from 'react'
import { formatDate } from '@/lib/utils'

interface ConsultaPrintProps {
  record: any
  profile: any
}

const tdStyle: React.CSSProperties = {
  padding: '2.6px 5.5px',
  verticalAlign: 'top',
  borderBottom: '1px solid #F1F5F9',
  lineHeight: 1.14,
}

const sectionStyle: React.CSSProperties = {
  border: '1px solid #E2E8F0',
  borderRadius: 4,
  padding: '5px 7px',
  marginBottom: 5,
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 8.1,
        color: '#94A3B8',
        fontWeight: 'bold',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        marginBottom: 1,
        lineHeight: 1.12,
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
        fontSize: 10.35,
        fontWeight: bold ? 'bold' : 'normal',
        fontFamily: mono ? 'monospace' : 'Arial',
        color: '#1E293B',
        lineHeight: 1.22,
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
        fontSize: 8.95,
        fontWeight: 'bold',
        color: '#1A56A0',
        marginBottom: 3,
        letterSpacing: 0.42,
        textTransform: 'uppercase',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: 2,
        lineHeight: 1.12,
      }}
    >
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 1.6 }}>
      <span
        style={{
          fontSize: 8.3,
          color: '#94A3B8',
          fontWeight: 'bold',
          minWidth: 102,
          textTransform: 'uppercase',
          flexShrink: 0,
          lineHeight: 1.2,
        }}
      >
        {label}:
      </span>
      <span
        style={{
          fontSize: 9.65,
          color: '#1E293B',
          flex: 1,
          lineHeight: 1.2,
        }}
      >
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
          height: '266mm',
          margin: '-9.5mm auto 0',
          background: '#fff',
          padding: '2.5mm 7mm 2.5mm 7mm',
          boxSizing: 'border-box',
          color: '#1E293B',
          overflow: 'hidden',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* CABEÇALHO */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2.2px solid #1A56A0',
            paddingBottom: 5,
            marginBottom: 6,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            {r.institutions?.logo_url && (
              <img
                src={r.institutions.logo_url}
                alt="logo"
                style={{ height: 54, maxWidth: 96, objectFit: 'contain' }}
              />
            )}
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#1A56A0',
                  letterSpacing: 0.45,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  lineHeight: 1.04,
                }}
              >
                FICHA PRÉ ANESTÉSICA
                {r.vad_risk && (
                  <span
                    style={{
                      fontSize: 9.5,
                      background: '#EF4444',
                      color: 'white',
                      padding: '1px 5px',
                      borderRadius: 3,
                      fontWeight: 'bold',
                      lineHeight: 1.1,
                    }}
                  >
                    VAD
                  </span>
                )}
                {r.allergies && (
                  <span
                    style={{
                      fontSize: 9.5,
                      background: '#F97316',
                      color: 'white',
                      padding: '1px 5px',
                      borderRadius: 3,
                      fontWeight: 'bold',
                      lineHeight: 1.1,
                    }}
                  >
                    ALÉRGICO
                  </span>
                )}
              </div>
              <div style={{ fontSize: 10.7, color: '#64748B', lineHeight: 1.18, marginTop: 1 }}>
                {r.institutions?.name ?? ''}
              </div>
            </div>
          </div>

          <div
            style={{
              textAlign: 'right',
              fontSize: 9,
              color: '#64748B',
              lineHeight: 1.18,
            }}
          >
            <div>IBAD — Sistema de Ficha Anestésica</div>
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
          <div>
            {/* DADOS PESSOAIS */}
            <div style={sectionStyle}>
              <SectionTitle>Dados Pessoais</SectionTitle>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ ...tdStyle, width: '40%' }} colSpan={2}>
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
                    <td style={{ ...tdStyle, width: '40%' }} colSpan={2}>
                      <FieldLabel>Cirurgia Proposta</FieldLabel>
                      <FieldValue bold>{r.surgery_name ?? '—'}</FieldValue>
                    </td>
                    <td style={{ ...tdStyle, width: '30%' }}>
                      <FieldLabel>Cirurgião</FieldLabel>
                      <FieldValue>{r.surgeon ?? '—'}</FieldValue>
                    </td>
                    <td style={tdStyle}>
                      <FieldLabel>Data Procedimento</FieldLabel>
                      <FieldValue mono>{formatDate(r.procedure_date)}</FieldValue>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ ...tdStyle, width: '40%' }} colSpan={2}>
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
              <div style={{ marginTop: 1.5 }}>
                <span
                  style={{
                    fontSize: 8.3,
                    color: '#94A3B8',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  Medicamentos em Uso:{' '}
                </span>
                <span style={{ fontSize: 9.65, color: '#1E293B', lineHeight: 1.2 }}>
                  {r.medications || '—'}
                </span>
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
                      <FieldLabel>Altura (cm)</FieldLabel>
                      <FieldValue>{r.height ?? '—'}</FieldValue>
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
                    <td style={tdStyle} colSpan={7}>
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
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 2 }}>
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

              <div style={{ marginBottom: 1.5 }}>
                <span
                  style={{
                    fontSize: 8.3,
                    color: '#94A3B8',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  Jejum:{' '}
                </span>
                <span style={{ fontSize: 9.65, color: '#1E293B', lineHeight: 1.2 }}>
                  {r.fasting || '—'}
                </span>
              </div>

              {r.medication_instructions && (
                <div style={{ marginBottom: 1.5 }}>
                  <span
                    style={{
                      fontSize: 8.3,
                      color: '#94A3B8',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                    }}
                  >
                    Medicamentos em Uso:{' '}
                  </span>
                  <span style={{ fontSize: 9.65, color: '#1E293B', lineHeight: 1.2 }}>
                    {r.medication_instructions}
                  </span>
                </div>
              )}

              {r.observations && (
                <div>
                  <span
                    style={{
                      fontSize: 8.3,
                      color: '#94A3B8',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                    }}
                  >
                    Observações:{' '}
                  </span>
                  <span style={{ fontSize: 9.65, color: '#1E293B', lineHeight: 1.2 }}>
                    {r.observations}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 7 }}>
            {/* DATA CONSULTA */}
            <div
              style={{
                fontSize: 8.8,
                color: '#64748B',
                marginBottom: 5,
                lineHeight: 1.18,
              }}
            >
              Data da Consulta: {formatDate(r.consultation_date)}
            </div>

            {/* ASSINATURA */}
            <div
              style={{
                borderTop: '1px solid #E2E8F0',
                paddingTop: 4,
                textAlign: 'right',
              }}
            >
              <div style={{ display: 'inline-block', textAlign: 'center', minWidth: 195 }}>
                {profile?.signature_url && (
                  <img
                    src={profile.signature_url}
                    alt="Assinatura"
                    style={{
                      maxHeight: 34,
                      maxWidth: 152,
                      display: 'block',
                      margin: '0 auto 2px',
                    }}
                  />
                )}
                <div style={{ borderTop: '1px solid #1E293B', paddingTop: 2, marginTop: 2 }}>
                  <div
                    style={{
                      fontSize: 9.75,
                      fontWeight: 'bold',
                      color: '#1E293B',
                      lineHeight: 1.16,
                    }}
                  >
                    {profile?.full_name ?? '—'}
                  </div>
                  <div style={{ fontSize: 8.1, color: '#64748B', lineHeight: 1.16 }}>
                    Anestesiologista
                  </div>
                  <div
                    style={{
                      fontSize: 8.1,
                      color: '#64748B',
                      fontFamily: 'monospace',
                      lineHeight: 1.16,
                    }}
                  >
                    CRM: {profile?.crm ?? '—'}
                  </div>
                  {profile?.rqe && (
                    <div
                      style={{
                        fontSize: 8.1,
                        color: '#64748B',
                        fontFamily: 'monospace',
                        lineHeight: 1.16,
                      }}
                    >
                      RQE: {profile.rqe}
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

ConsultaPrint.displayName = 'ConsultaPrint'