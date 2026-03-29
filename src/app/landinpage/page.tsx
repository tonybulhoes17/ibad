import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'AnestPrime — Plataforma do Anestesista',
  description: 'A plataforma completa para anestesistas. Fichas anestésicas digitais, gestão financeira, scores clínicos e muito mais. Feito por um anestesista.',
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          font-family: 'DM Sans', sans-serif;
          background: #0B1929;
          color: #F8F9FA;
          overflow-x: hidden;
          --navy: #0B1929;
          --navy-mid: #112236;
          --navy-light: #1A3350;
          --teal: #0D9488;
          --teal-light: #14B8A8;
          --gold: #D4A843;
          --gold-light: #F0C060;
          --white: #F8F9FA;
          --muted: #94A3B8;
          --card-bg: rgba(255,255,255,0.04);
          --card-border: rgba(255,255,255,0.08);
        }

        /* NAV */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 1.2rem 2rem;
          display: flex; align-items: center; justify-content: space-between;
          backdrop-filter: blur(16px);
          background: rgba(11,25,41,0.85);
          border-bottom: 1px solid var(--card-border);
        }
        .lp-nav-logo { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; }
        .lp-nav-logo-img { width: 36px; height: 36px; border-radius: 10px; object-fit: cover; }
        .lp-nav-logo-text { font-family: 'Instrument Serif', serif; font-size: 1.25rem; color: #F8F9FA; }
        .lp-nav-logo-text span { color: #14B8A8; }
        .lp-nav-cta {
          background: #0D9488; color: white; text-decoration: none;
          padding: 0.55rem 1.3rem; border-radius: 8px;
          font-size: 0.85rem; font-weight: 600; transition: background 0.2s;
        }
        .lp-nav-cta:hover { background: #14B8A8; }

        /* HERO */
        .lp-hero {
          position: relative; min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          text-align: center; padding: 8rem 2rem 5rem; overflow: hidden;
        }
        .lp-glow {
          position: absolute; width: 600px; height: 600px;
          background: radial-gradient(ellipse, rgba(13,148,136,0.18) 0%, transparent 70%);
          top: 10%; left: 50%; transform: translateX(-50%); pointer-events: none;
        }
        .lp-glow2 {
          position: absolute; width: 400px; height: 400px;
          background: radial-gradient(ellipse, rgba(212,168,67,0.08) 0%, transparent 70%);
          bottom: 20%; right: 10%; pointer-events: none;
        }
        .lp-hero-inner { position: relative; z-index: 1; max-width: 780px; }
        .lp-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(13,148,136,0.15); border: 1px solid rgba(13,148,136,0.3);
          color: #14B8A8; font-size: 0.75rem; font-weight: 600;
          padding: 0.35rem 0.9rem; border-radius: 999px; margin-bottom: 1.5rem;
          letter-spacing: 0.04em; text-transform: uppercase;
        }
        .lp-hero-logo {
          display: flex; align-items: center; justify-content: center;
          gap: 0.8rem; margin-bottom: 2rem;
        }
        .lp-hero-logo img { width: 64px; height: 64px; border-radius: 16px; }
        .lp-hero-logo-name {
          font-family: 'Instrument Serif', serif; font-size: 2.2rem;
          color: #F8F9FA; letter-spacing: -0.02em;
        }
        .lp-hero-logo-name span { color: #14B8A8; }
        .lp-hero-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(2.5rem, 6vw, 5rem);
          line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 1.5rem;
        }
        .lp-hero-title em { font-style: italic; color: #14B8A8; }
        .lp-hero-title .gold { color: #F0C060; }
        .lp-hero-sub {
          font-size: clamp(1rem, 2vw, 1.15rem); color: #94A3B8;
          max-width: 560px; margin: 0 auto 2.5rem; line-height: 1.7;
        }
        .lp-ctas { display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2.5rem; }
        .lp-btn-primary {
          background: #0D9488; color: white; text-decoration: none;
          padding: 0.85rem 2rem; border-radius: 10px; font-size: 0.95rem;
          font-weight: 600; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem;
        }
        .lp-btn-primary:hover { background: #14B8A8; transform: translateY(-1px); }
        .lp-btn-ghost {
          background: transparent; color: #F8F9FA; text-decoration: none;
          padding: 0.85rem 2rem; border-radius: 10px; font-size: 0.95rem;
          font-weight: 500; border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s;
        }
        .lp-btn-ghost:hover { background: rgba(255,255,255,0.05); }
        .lp-devices { display: flex; justify-content: center; align-items: center; gap: 0.8rem; flex-wrap: wrap; }
        .lp-device-tag {
          display: flex; align-items: center; gap: 0.4rem;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          padding: 0.4rem 0.8rem; border-radius: 999px; font-size: 0.78rem; color: #94A3B8;
        }
        .lp-dot { width: 6px; height: 6px; border-radius: 50%; background: #14B8A8; flex-shrink: 0; }

        /* CONTAINER */
        .lp-container { max-width: 1100px; margin: 0 auto; padding: 0 2rem; }
        .lp-divider { height: 1px; background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent); margin: 0 2rem; }

        /* STATS */
        .lp-stats { padding: 4rem 0; }
        .lp-stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1px; background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden;
        }
        .lp-stat { background: #0B1929; padding: 2.5rem 2rem; text-align: center; }
        .lp-stat-num {
          font-family: 'Instrument Serif', serif; font-size: 2.5rem;
          color: #14B8A8; line-height: 1; margin-bottom: 0.4rem;
        }
        .lp-stat-label { font-size: 0.82rem; color: #94A3B8; line-height: 1.4; }

        /* FEATURES */
        .lp-features { padding: 7rem 0; }
        .lp-section-label {
          display: inline-block; color: #14B8A8; font-size: 0.75rem;
          font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1rem;
        }
        .lp-section-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(2rem, 4vw, 3rem); line-height: 1.15;
          letter-spacing: -0.02em; margin-bottom: 1rem;
        }
        .lp-section-title em { font-style: italic; color: #14B8A8; }
        .lp-features-header { text-align: center; margin-bottom: 4rem; }
        .lp-features-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;
        }
        .lp-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 2rem; transition: all 0.3s; position: relative; overflow: hidden;
        }
        .lp-card:hover { border-color: rgba(13,148,136,0.35); transform: translateY(-3px); }
        .lp-card-icon {
          width: 48px; height: 48px; background: rgba(13,148,136,0.15);
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; margin-bottom: 1.2rem;
        }
        .lp-card h3 { font-size: 1.05rem; font-weight: 600; margin-bottom: 0.6rem; }
        .lp-card p { font-size: 0.88rem; color: #94A3B8; line-height: 1.7; }
        .lp-tag {
          display: inline-block; margin-top: 1rem; font-size: 0.7rem; font-weight: 600;
          color: #14B8A8; background: rgba(13,148,136,0.1);
          padding: 0.2rem 0.6rem; border-radius: 4px;
          letter-spacing: 0.04em; text-transform: uppercase;
        }

        /* HIGHLIGHT */
        .lp-highlight { padding: 5rem 0; }
        .lp-highlight-block {
          background: linear-gradient(135deg, #112236 0%, #1A3350 100%);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 4rem;
          display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start;
          position: relative; overflow: hidden;
        }
        .lp-highlight-block::after {
          content: ''; position: absolute; width: 300px; height: 300px;
          background: radial-gradient(ellipse, rgba(13,148,136,0.1) 0%, transparent 70%);
          top: -50px; right: -50px; pointer-events: none;
        }
        .lp-highlight-block h2 {
          font-family: 'Instrument Serif', serif; font-size: clamp(1.6rem, 2.5vw, 2.2rem);
          line-height: 1.2; letter-spacing: -0.02em; margin-bottom: 1rem;
        }
        .lp-highlight-block h2 em { font-style: italic; color: #F0C060; }
        .lp-highlight-block p { color: #94A3B8; line-height: 1.75; font-size: 0.92rem; margin-bottom: 0.6rem; }
        .lp-check-list { list-style: none; margin-top: 1.2rem; }
        .lp-check-list li {
          display: flex; align-items: flex-start; gap: 0.6rem;
          font-size: 0.88rem; color: #CBD5E1; margin-bottom: 0.6rem;
        }
        .lp-check {
          width: 18px; height: 18px; background: rgba(13,148,136,0.2);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px; font-size: 9px; color: #14B8A8;
        }

        /* GROUP */
        .lp-group { padding: 6rem 0; }
        .lp-group-block {
          background: linear-gradient(135deg, rgba(212,168,67,0.06) 0%, transparent 60%);
          border: 1px solid rgba(212,168,67,0.2); border-radius: 24px;
          padding: 4rem; text-align: center; position: relative; overflow: hidden;
        }
        .lp-group-block::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.07) 0%, transparent 60%);
        }
        .lp-group-block h2 {
          font-family: 'Instrument Serif', serif; font-size: clamp(2rem, 4vw, 3rem);
          letter-spacing: -0.02em; margin-bottom: 1.2rem; position: relative;
        }
        .lp-group-block h2 em { font-style: italic; color: #F0C060; }
        .lp-group-block p {
          color: #94A3B8; font-size: 1rem; line-height: 1.75;
          max-width: 600px; margin: 0 auto 1.5rem; position: relative;
        }
        .lp-chips { display: flex; justify-content: center; flex-wrap: wrap; gap: 0.8rem; position: relative; }
        .lp-chip {
          background: rgba(212,168,67,0.1); border: 1px solid rgba(212,168,67,0.2);
          color: #F0C060; font-size: 0.82rem; font-weight: 500;
          padding: 0.45rem 1rem; border-radius: 999px;
        }

        /* MADE BY */
        .lp-madeby { padding: 4rem 0; text-align: center; }
        .lp-madeby-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(212,168,67,0.1); border: 1px solid rgba(212,168,67,0.25);
          padding: 0.7rem 1.5rem; border-radius: 999px;
          font-size: 0.9rem; color: #F0C060; font-weight: 600;
        }
        .lp-madeby p {
          color: #94A3B8; font-size: 0.95rem; margin-top: 1.2rem;
          max-width: 560px; margin-left: auto; margin-right: auto; line-height: 1.75;
        }

        /* CTA */
        .lp-cta-section { padding: 6rem 0; }
        .lp-cta-inner {
          background: linear-gradient(135deg, #112236, #1A3350);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 24px;
          padding: 5rem 3rem; text-align: center; position: relative; overflow: hidden;
        }
        .lp-cta-inner::before {
          content: ''; position: absolute; width: 500px; height: 500px;
          background: radial-gradient(ellipse, rgba(13,148,136,0.12) 0%, transparent 70%);
          top: -150px; left: 50%; transform: translateX(-50%); pointer-events: none;
        }
        .lp-cta-inner h2 {
          font-family: 'Instrument Serif', serif; font-size: clamp(2rem, 5vw, 3.5rem);
          letter-spacing: -0.02em; margin-bottom: 1rem; position: relative;
        }
        .lp-cta-inner h2 em { font-style: italic; color: #14B8A8; }
        .lp-cta-inner p {
          color: #94A3B8; font-size: 1.05rem; margin-bottom: 2.5rem;
          max-width: 480px; margin-left: auto; margin-right: auto; position: relative;
        }
        .lp-cta-url {
          display: block; margin-top: 1.5rem;
          font-size: 1rem; font-weight: 700; color: #14B8A8; letter-spacing: 0.02em;
          position: relative;
        }

        /* FOOTER */
        .lp-footer { border-top: 1px solid rgba(255,255,255,0.08); padding: 2rem; text-align: center; }
        .lp-footer p { color: #94A3B8; font-size: 0.82rem; }
        .lp-footer a { color: #14B8A8; text-decoration: none; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .lp-nav { padding: 1rem; }
          .lp-highlight-block { grid-template-columns: 1fr; gap: 2.5rem; padding: 2.5rem 1.5rem; }
          .lp-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-group-block { padding: 2.5rem 1.5rem; }
          .lp-cta-inner { padding: 3rem 1.5rem; }
        }
      `}</style>

      <div className="lp-root">

        {/* NAV */}
        <nav className="lp-nav">
          <Link href="/landingpage" className="lp-nav-logo">
            <img src="/icons/icon-192.png" alt="AnestPrime" className="lp-nav-logo-img" />
            <span className="lp-nav-logo-text">Anest<span>Prime</span></span>
          </Link>
          <Link href="/auth/login" className="lp-nav-cta">Acessar plataforma →</Link>
        </nav>

        {/* HERO */}
        <section className="lp-hero">
          <div className="lp-glow" />
          <div className="lp-glow2" />
          <div className="lp-hero-inner">
            <div className="lp-badge">✦ Feito por um Anestesista</div>
            <div className="lp-hero-logo">
              <img src="/icons/icon-192.png" alt="AnestPrime" style={{width:64,height:64,borderRadius:16}} />
              <span className="lp-hero-logo-name">Anest<span>Prime</span></span>
            </div>
            <h1 className="lp-hero-title">
              A plataforma completa<br />do <em>anestesista</em><br />
              <span className="gold">moderno</span>
            </h1>
            <p className="lp-hero-sub">
              Fichas anestésicas digitais, gestão financeira, consultas pré-anestésicas, controle de plantões e scores clínicos — tudo na palma da mão.
            </p>
            <div className="lp-ctas">
              <Link href="/auth/login" className="lp-btn-primary">Começar agora →</Link>
              <a href="#funcionalidades" className="lp-btn-ghost">Ver funcionalidades</a>
            </div>
            <div className="lp-devices">
              <div className="lp-device-tag"><span className="lp-dot" /> Android</div>
              <div className="lp-device-tag"><span className="lp-dot" /> iPhone</div>
              <div className="lp-device-tag"><span className="lp-dot" /> Notebook</div>
              <div className="lp-device-tag"><span className="lp-dot" /> Acesso remoto 24/7</div>
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* STATS */}
        <section className="lp-stats">
          <div className="lp-container">
            <div className="lp-stats-grid">
              <div className="lp-stat">
                <div className="lp-stat-num">∞</div>
                <div className="lp-stat-label">Fichas sem<br />limite</div>
              </div>
              <div className="lp-stat">
                <div className="lp-stat-num">∞</div>
                <div className="lp-stat-label">Instituições<br />cadastradas</div>
              </div>
              <div className="lp-stat">
                <div className="lp-stat-num">100%</div>
                <div className="lp-stat-label">Web — sem app<br />para instalar</div>
              </div>
              <div className="lp-stat">
                <div className="lp-stat-num">24/7</div>
                <div className="lp-stat-label">Acesso de<br />qualquer lugar</div>
              </div>
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* FEATURES */}
        <section className="lp-features" id="funcionalidades">
          <div className="lp-container">
            <div className="lp-features-header">
              <span className="lp-section-label">Funcionalidades</span>
              <h2 className="lp-section-title">Tudo que você precisa,<br /><em>onde você precisar</em></h2>
              <p style={{color:'#94A3B8', fontSize:'1.05rem', lineHeight:1.7, maxWidth:520, margin:'0 auto'}}>
                Desenvolvido pensando na rotina real do anestesista — da indução ao fechamento financeiro.
              </p>
            </div>
            <div className="lp-features-grid">
              {[
                { icon: '📋', title: 'Ficha Anestésica Digital', desc: 'Gere fichas completas com monitorização, organograma hemodinâmico, descrição do ato anestésico e dados financeiros. Cada ficha sai com o logo da instituição e sua assinatura.', tag: 'Pronta para o prontuário' },
                { icon: '⚡', title: 'Modelos Personalizados', desc: 'Salve o modelo da sua técnica favorita. Na próxima ficha, os campos já chegam preenchidos — você só confirma e ajusta o que mudou. Agilidade máxima no bloco.', tag: 'Velocidade no preenchimento' },
                { icon: '🩺', title: 'Consulta Pré-Anestésica', desc: 'Ficha completa de avaliação com histórico clínico, exame físico, exames laboratoriais e orientações ao paciente — tudo impresso com logo e assinatura.', tag: 'Completa e impressa' },
                { icon: '🔗', title: 'Pré-Ficha do Paciente', desc: 'Compartilhe um link com o paciente antes da consulta. Ele preenche em casa e os dados chegam automaticamente na ficha — menos tempo de entrevista, mais qualidade.', tag: 'Automação inteligente' },
                { icon: '💰', title: 'Gestão Financeira Completa', desc: 'Dashboard com visão total da sua produção. Procedimentos, consultas e plantões unificados. Controle o que foi pago, o que está pendente e o que foi glosado — com gráficos por mês e instituição.', tag: 'Controle total' },
                { icon: '🌙', title: 'Controle de Plantões', desc: 'Lance plantões avulsos ou recorrentes (semanal, quinzenal, mensal). Visualize no calendário mensal, acompanhe pagamentos e tenha tudo organizado.', tag: 'Calendário integrado' },
                { icon: '📊', title: 'Scores Clínicos Rápidos', desc: 'ASA, Mallampati, Apfel, STOP-BANG, Caprini, RCRI, algoritmo de VAD interativo e muito mais. Calcule na palma da mão — na visita pré-anestésica ou no bloco.', tag: 'Consulta instantânea' },
                { icon: '🏥', title: 'Múltiplas Instituições', desc: 'Cadastre quantas instituições quiser — hospital, clínica, ambulatório. Cada ficha sai com o logo correto da instituição automaticamente. Sem limite de cadastros.', tag: 'Sem limite' },
              ].map(f => (
                <div key={f.title} className="lp-card">
                  <div className="lp-card-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <span className="lp-tag">{f.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* HIGHLIGHT */}
        <section className="lp-highlight">
          <div className="lp-container">
            <div className="lp-highlight-block">
              <div>
                <span className="lp-section-label">Profissionalismo</span>
                <h2>Fichas que saem <em>prontas para o prontuário</em></h2>
                <p>Cada ficha carrega automaticamente o logo da instituição e sua assinatura — sem carimbo, sem papel, sem rasura.</p>
                <ul className="lp-check-list">
                  {['Logotipo da instituição automático','Assinatura digital do anestesista','Layout profissional para impressão','Fichas anestésicas e pré-anestésicas padronizadas','Cadastre quantas instituições precisar — sem custo adicional'].map(i => (
                    <li key={i}><div className="lp-check">✓</div>{i}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="lp-section-label">Financeiro</span>
                <h2>Visão <em>global</em> da sua produção</h2>
                <p>Todos os registros unificados: fichas, pré-consultas e plantões em um único dashboard com gráficos e filtros avançados.</p>
                <ul className="lp-check-list">
                  {['Total previsto, recebido e pendente','Controle de glosas por procedimento','Gráficos dos últimos 6 meses','Filtros por instituição, plano e período','Imprima listas filtradas para conferência com convênio'].map(i => (
                    <li key={i}><div className="lp-check">✓</div>{i}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* GROUP */}
        <section className="lp-group">
          <div className="lp-container">
            <div className="lp-group-block">
              <span className="lp-section-label" style={{position:'relative'}}>Grupos de Anestesia</span>
              <h2>Trabalhe em grupo com <em>visão centralizada</em></h2>
              <p>Perfeito para grupos e cooperativas. Fichas e dados compartilhados entre os membros, gerenciados por um administrador — com privacidade individual preservada.</p>
              <div className="lp-chips">
                {['👨‍⚕️ Múltiplos anestesistas','🔑 Administrador do grupo','📁 Dados compartilhados','🏥 Instituições do grupo','💊 Planos de saúde do grupo','🔒 Privacidade individual'].map(c => (
                  <span key={c} className="lp-chip">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* MADE BY */}
        <section className="lp-madeby">
          <div className="lp-container">
            <div className="lp-madeby-badge">
              🩺 &nbsp;Desenvolvido por um anestesista — para anestesistas
            </div>
            <p>
              O AnestPrime nasceu da necessidade real de quem está no bloco todos os dias. Cada funcionalidade foi pensada para resolver problemas práticos da rotina — porque quem criou também vive essa rotina.
            </p>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="lp-cta-section">
          <div className="lp-container">
            <div className="lp-cta-inner">
              <h2>Pronto para <em>transformar</em><br />sua prática?</h2>
              <p>Acesse agora mesmo. Funciona em qualquer dispositivo, em qualquer lugar — sem instalar nada.</p>
              <Link href="/auth/login" className="lp-btn-primary" style={{fontSize:'1rem', padding:'1rem 2.5rem', display:'inline-flex'}}>
                Acessar o AnestPrime →
              </Link>
              <span className="lp-cta-url">anestprime.com.br</span>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          <p>© 2026 AnestPrime — Plataforma do Anestesista &nbsp;·&nbsp; <a href="https://anestprime.com.br">anestprime.com.br</a></p>
        </footer>

      </div>
    </>
  )
}
