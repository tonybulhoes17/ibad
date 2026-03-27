'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ScrollText, CheckCircle2 } from 'lucide-react'

const TERMO_TEXTO = `
TERMOS DE USO — AnestPrime
Versão 1.0 | Vigência a partir de abril de 2025

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ACEITAÇÃO DOS TERMOS

Ao acessar e utilizar a plataforma AnestPrime ("Plataforma"), você ("Usuário") declara ter lido, compreendido e concordado com os presentes Termos de Uso, bem como com a Política de Privacidade da AnestPrime. Caso não concorde com qualquer disposição deste instrumento, não utilize a Plataforma.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. DESCRIÇÃO DO SERVIÇO

A AnestPrime é uma plataforma digital destinada exclusivamente a médicos anestesiologistas devidamente habilitados pelo Conselho Federal de Medicina (CFM) e pelo Conselho Regional de Medicina (CRM) competente. A Plataforma oferece recursos para:

• Elaboração e armazenamento de fichas anestésicas digitais;
• Registro de consultas pré-anestésicas;
• Cálculo de scores e índices de risco perioperatório;
• Gestão financeira e controle de produção médica;
• Colaboração em grupos de anestesiologistas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. ELEGIBILIDADE E CADASTRO

3.1. O uso da Plataforma é restrito a médicos anestesiologistas com registro ativo no CRM.

3.2. O Usuário é responsável pela veracidade, exatidão e atualização das informações fornecidas no cadastro, incluindo nome completo, CRM e demais dados profissionais.

3.3. O Usuário é o único responsável pela guarda e confidencialidade de suas credenciais de acesso (e-mail e senha). A AnestPrime não se responsabiliza por acessos não autorizados decorrentes de negligência do Usuário na proteção de suas credenciais.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. RESPONSABILIDADES DO USUÁRIO

4.1. O Usuário declara e garante que:

a) Possui habilitação legal para exercer a medicina e a especialidade de anestesiologia no território brasileiro;

b) As informações lançadas nas fichas anestésicas e demais registros são fidedignas e foram obtidas no exercício regular da sua atividade profissional;

c) O uso da Plataforma não substitui o julgamento clínico do profissional médico. Os scores e calculadoras de risco disponíveis são ferramentas de apoio à decisão e não devem ser utilizados como único critério de conduta clínica;

d) É responsável pela correta identificação dos pacientes e pela privacidade dos dados inseridos na Plataforma;

e) Não utilizará a Plataforma para fins ilícitos, antiéticos ou contrários ao Código de Ética Médica.

4.2. A AnestPrime não se responsabiliza por decisões clínicas tomadas com base nas informações geradas pela Plataforma.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. PROTEÇÃO DE DADOS E PRIVACIDADE (LGPD)

5.1. A AnestPrime trata dados pessoais e dados sensíveis de saúde em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).

5.2. Os dados dos pacientes inseridos pelo Usuário são tratados sob a base legal de execução de contrato e legítimo interesse, exclusivamente para as finalidades descritas nestes Termos.

5.3. O Usuário, na qualidade de responsável pelo tratamento dos dados de seus pacientes, compromete-se a:

a) Obter o consentimento adequado dos pacientes para o registro e tratamento de seus dados de saúde, quando aplicável;

b) Informar aos pacientes sobre o uso de sistemas digitais no armazenamento de suas informações de saúde;

c) Atender às solicitações de titulares de dados (acesso, correção, eliminação) encaminhando-as à AnestPrime quando necessário.

5.4. A AnestPrime adota medidas técnicas e organizacionais adequadas para proteger os dados contra acesso não autorizado, perda acidental ou destruição, incluindo criptografia, controle de acesso e backups regulares.

5.5. Os dados não serão compartilhados com terceiros sem o consentimento do Usuário, exceto quando exigido por lei ou por determinação judicial.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. PROPRIEDADE INTELECTUAL

6.1. Todo o conteúdo da Plataforma — incluindo design, código-fonte, textos, logotipos, funcionalidades e interfaces — é de propriedade exclusiva da AnestPrime e está protegido pela legislação de propriedade intelectual aplicável.

6.2. O Usuário não pode reproduzir, modificar, distribuir ou criar obras derivadas com base no conteúdo da Plataforma sem autorização prévia e expressa da AnestPrime.

6.3. Os dados inseridos pelo Usuário permanecem de sua propriedade. A AnestPrime não reivindica direitos sobre o conteúdo das fichas anestésicas e registros clínicos do Usuário.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. LIMITAÇÃO DE RESPONSABILIDADE

7.1. A AnestPrime não garante que a Plataforma estará disponível de forma ininterrupta ou isenta de erros.

7.2. A AnestPrime não se responsabiliza por:

a) Decisões clínicas tomadas com base nas funcionalidades da Plataforma;
b) Perda de dados decorrente de falhas de conectividade do lado do Usuário;
c) Uso indevido das credenciais de acesso pelo próprio Usuário ou por terceiros;
d) Danos indiretos, lucros cessantes ou danos morais decorrentes do uso ou impossibilidade de uso da Plataforma.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8. SUSPENSÃO E ENCERRAMENTO

8.1. A AnestPrime reserva-se o direito de suspender ou encerrar o acesso do Usuário à Plataforma, a qualquer momento e sem aviso prévio, em caso de:

a) Violação destes Termos de Uso;
b) Uso da Plataforma de forma fraudulenta ou ilícita;
c) Fornecimento de informações falsas no cadastro;
d) Inadimplência, quando aplicável.

8.2. O Usuário pode encerrar sua conta a qualquer momento mediante solicitação formal à AnestPrime, com consequente exclusão dos dados pessoais nos termos da LGPD.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. ALTERAÇÕES NOS TERMOS

9.1. A AnestPrime pode atualizar estes Termos de Uso periodicamente. Quando isso ocorrer, o Usuário será notificado no próximo acesso à Plataforma e deverá aceitar os novos termos para continuar utilizando o serviço.

9.2. O uso continuado da Plataforma após a notificação e aceite dos novos termos implica concordância com as alterações realizadas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

10. DISPOSIÇÕES GERAIS

10.1. Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de domicílio do Usuário para dirimir quaisquer controvérsias decorrentes deste instrumento, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

10.2. Caso qualquer disposição destes Termos seja considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor.

10.3. A tolerância da AnestPrime em relação a qualquer descumprimento destes Termos não constituirá renúncia ao direito de exigir o cumprimento futuro.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dúvidas ou solicitações relacionadas a estes Termos ou à privacidade de dados podem ser encaminhadas para: contato@anestprime.com.br

AnestPrime — Plataforma do Anestesista
`

export default function TermosPage() {
  const router = useRouter()
  const supabase = createClient()
  const [accepted, setAccepted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentVersion, setCurrentVersion] = useState('1.0')
  const [scrolledToBottom, setScrolledToBottom] = useState(false)

  useEffect(() => {
    async function loadVersion() {
      const { data } = await supabase
        .from('terms_of_use')
        .select('version')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data) setCurrentVersion(data.version)
      setLoading(false)
    }
    loadVersion()
  }, [])

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50
    if (atBottom) setScrolledToBottom(true)
  }

  async function handleAccept() {
    if (!accepted) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({
        terms_accepted_version: currentVersion,
        terms_accepted_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setSaving(false)
    router.push('/app/dashboard')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 shadow-lg overflow-hidden">
            <img src="/icons/icon-192.png" alt="AnestPrime" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Termos de Uso</h1>
          <p className="text-sm text-slate-500 mt-1">AnestPrime — Versão {currentVersion}</p>
        </div>

        <div className="card overflow-hidden">
          {/* Instrução */}
          <div className="flex items-center gap-3 px-6 py-4 bg-primary-50 border-b border-primary-100">
            <ScrollText className="w-5 h-5 text-primary-600 flex-shrink-0" />
            <p className="text-sm text-primary-700">
              Leia os termos abaixo até o final para poder aceitar e continuar.
            </p>
          </div>

          {/* Conteúdo do termo */}
          <div
            onScroll={handleScroll}
            className="h-96 overflow-y-auto px-6 py-5"
          >
            <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
              {TERMO_TEXTO}
            </pre>
          </div>

          {/* Aceite */}
          <div className="border-t border-slate-100 px-6 py-5 space-y-4">
            {!scrolledToBottom && (
              <p className="text-xs text-slate-400 text-center">
                ↓ Role até o final do documento para habilitar o aceite
              </p>
            )}

            <label className={`flex items-start gap-3 cursor-pointer ${!scrolledToBottom ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  accepted ? 'bg-primary-700 border-primary-700' : 'border-slate-300 bg-white'
                }`}>
                  {accepted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <span className="text-sm text-slate-700 leading-relaxed">
                Li e concordo com os <strong>Termos de Uso</strong> da AnestPrime, incluindo as disposições sobre proteção de dados (LGPD) e responsabilidades do usuário.
              </span>
            </label>

            <button
              onClick={handleAccept}
              disabled={!accepted || saving}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                : 'Aceitar e Continuar'
              }
            </button>

            <p className="text-xs text-slate-400 text-center">
              Ao aceitar, você confirma que é médico anestesiologista habilitado pelo CRM.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
