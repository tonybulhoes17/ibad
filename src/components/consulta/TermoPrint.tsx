import React from 'react'

interface TermoPrintProps {
  record: any
  profile: any
}

export const TermoPrint = React.forwardRef<HTMLDivElement, TermoPrintProps>(
  ({ record: r, profile }, ref) => {
    return (
      <div ref={ref} className="a4-preview print-only">

        {/* CABEÇALHO */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #1A56A0', paddingBottom: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1A56A0', letterSpacing: 1 }}>
            TERMO DE CIÊNCIA
          </div>
          <div style={{ textAlign: 'right', fontSize: 8, color: '#64748B' }}>
            IBAD — Sistema de Ficha Anestésica
          </div>
        </div>

        {/* TÍTULO */}
        <div style={{ fontSize: 10.5, fontWeight: 'bold', textAlign: 'center', marginBottom: 12, color: '#1E293B' }}>
          TERMO DE CIÊNCIA E CONSENTIMENTO PARA REALIZAÇÃO DE PROCEDIMENTO ANESTÉSICO
        </div>

        {/* TEXTO */}
        <div style={{ fontSize: 9.5, lineHeight: 1.65, color: '#1E293B', textAlign: 'justify' }}>
          <p style={{ marginBottom: 7 }}>
            O presente termo tem o dever ético de comprovar as informações prestadas ao paciente e/ou responsável pelo médico anestesiologista dos principais aspectos relacionados ao procedimento anestésico ao(s) qual(is) será submetido.
          </p>

          <div style={{ background: '#F1F5F9', padding: '3px 8px', marginBottom: 7, fontWeight: 'bold', fontSize: 8.5 }}>
            DEVE SER PREENCHIDO PELO PACIENTE:
          </div>

          <p style={{ marginBottom: 7 }}>
            Autorizo aos anestesiologistas da instituição <strong>{r.surgery_hospital || r.institutions?.name || '___________________'}</strong> ou outro anestesiologista por ele indicado a realizar o procedimento anestésico ou outros que considere necessários frente a situações imprevistas que possam ocorrer e necessitem de cuidados diferentes daqueles inicialmente propostos, inclusive transfusão de sangue.
          </p>
          <p style={{ marginBottom: 7 }}>
            A proposta do procedimento anestésico a que serei submetido (a), seus benefícios, riscos inerentes, complicações potenciais e alternativas me foram explicados claramente.
          </p>
          <p style={{ marginBottom: 7 }}>
            Tive a oportunidade de fazer perguntas, que foram respondidas satisfatoriamente e de receber esclarecimentos necessários à minha compreensão dos aspectos ligados ao ato anestésico ao qual serei submetido.
          </p>
          <p style={{ marginBottom: 7 }}>
            Declaro que nada omiti em relação à minha saúde e hábitos nas informações que forneci e que foram transcritas para a ficha de avaliação pré-anestésica.
          </p>
          <p style={{ marginBottom: 7 }}>
            Entendo que não existe garantia absoluta sobre os resultados a serem obtidos, que o anestesiologista exerce atividade de meio, mas, que o mesmo obriga-se a prestar seus serviços com zelo e diligência, utilizando todos os recursos, medicamentos e equipamentos disponíveis no hospital, em busca dos melhores objetivos possíveis.
          </p>
          <p style={{ marginBottom: 7 }}>
            De acordo com as recomendações da Sociedade Brasileira de Anestesiologia (SBA), é indispensável a retirada de adornos e utensílios estéticos, como unhas em gel, esmaltes, apliques de cabelo, piercings e outros acessórios similares, antes do procedimento anestésico. A não retirada desses itens pode comprometer a segurança do paciente e a precisão dos cuidados médicos.
          </p>
          <p style={{ marginBottom: 14 }}>
            Confirmo que recebi explicações, li, compreendi e concordo com tudo que me foi esclarecido e que me foi dada a oportunidade de anular, questionar ou alterar qualquer espaço em branco, parágrafos ou palavras com as quais não concordasse. A presente declaração foi lida e compreendida em todos os seus termos.
          </p>
        </div>

        {/* CAMPOS PACIENTE */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 10, color: '#1E293B' }}>PACIENTE/RESPONSÁVEL:</div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 8.5, fontWeight: 'bold', color: '#1E293B', marginBottom: 2 }}>NOME:</div>
            <div style={{ borderBottom: '1px solid #1E293B', height: 16 }}></div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8.5, fontWeight: 'bold', color: '#1E293B', marginBottom: 2 }}>GRAU DE PARENTESCO:</div>
              <div style={{ borderBottom: '1px solid #1E293B', height: 16 }}></div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8.5, fontWeight: 'bold', color: '#1E293B', marginBottom: 2 }}>DOCUMENTO:</div>
              <div style={{ borderBottom: '1px solid #1E293B', height: 16 }}></div>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 8.5, fontWeight: 'bold', color: '#1E293B', marginBottom: 2 }}>ASSINATURA:</div>
            <div style={{ borderBottom: '1px solid #1E293B', height: 40 }}></div>
          </div>
        </div>

        {/* TEXTO MÉDICO */}
        <div style={{ fontSize: 9.5, lineHeight: 1.65, color: '#1E293B', marginBottom: 16, textAlign: 'justify' }}>
          Expliquei o procedimento anestésico ao paciente acima identificado e/ou seu responsável, sobre os benefícios, riscos e alternativas, tendo respondido às perguntas formuladas pelo(s) mesmo(s). De acordo com o meu entendimento, o paciente e/ou seu responsável está em condições de compreender o que lhe foi informado.
        </div>

        {/* ASSINATURA MÉDICO */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-block', textAlign: 'center', minWidth: 200 }}>
            {profile?.signature_url && (
              <img src={profile.signature_url} alt="Assinatura"
                style={{ maxHeight: 40, maxWidth: 160, display: 'block', margin: '0 auto 2px' }} />
            )}
            <div style={{ borderTop: '1px solid #1E293B', paddingTop: 3, marginTop: 2 }}>
              <div style={{ fontSize: 10, fontWeight: 'bold', color: '#1E293B', lineHeight: 1.3 }}>{profile?.full_name ?? '—'}</div>
              <div style={{ fontSize: 8.5, color: '#64748B', lineHeight: 1.3 }}>Anestesiologista</div>
              <div style={{ fontSize: 8.5, color: '#64748B', fontFamily: 'monospace', lineHeight: 1.3 }}>CRM: {profile?.crm ?? '—'}</div>
              {profile?.rqe && <div style={{ fontSize: 8.5, color: '#64748B', fontFamily: 'monospace', lineHeight: 1.3 }}>RQE: {profile.rqe}</div>}
            </div>
          </div>
        </div>

      </div>
    )
  }
)

TermoPrint.displayName = 'TermoPrint'
