'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Users, FileText, TrendingUp, Activity, LogOut, Eye, EyeOff } from 'lucide-react'

const ADMIN_PASSWORD = 'crm28551'

interface UserStats {
  id: string
  full_name: string
  email: string
  crm: string
  created_at: string
  anesthesia_count: number
  consultation_count: number
  shift_count: number
  total_count: number
  last_activity: string | null
  is_active: boolean
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<UserStats[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthed(true)
      setError('')
    } else {
      setError('Senha incorreta.')
    }
  }

  const fetchData = useCallback(async () => {
    setDataLoading(true)
    try {
      const res = await fetch('/api/admin')
      const data = await res.json()
      if (data.users) setUsers(data.users)
    } catch (err) {
      console.error(err)
    }
    setDataLoading(false)
  }, [])

  useEffect(() => {
    if (authed) fetchData()
  }, [authed, fetchData])

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.is_active).length
  const inactiveUsers = totalUsers - activeUsers
  const totalRecords = users.reduce((s, u) => s + u.total_count, 0)

  const growthData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i)
    const start = startOfMonth(d)
    const end = endOfMonth(d)
    const count = users.filter(u => {
      try { return isWithinInterval(parseISO(u.created_at), { start, end }) } catch { return false }
    }).length
    return { mes: format(d, 'MMM/yy', { locale: ptBR }), novos: count }
  })

  const card = (icon: React.ReactNode, label: string, value: string | number, sub?: string, color = '#14B8A8') => (
    <div style={{ background: '#112236', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem', color }}>
        {icon}
        <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      <p style={{ fontSize: '2rem', fontWeight: 700, color: '#F8F9FA', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.3rem' }}>{sub}</p>}
    </div>
  )

  // ── LOGIN ──
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B1929', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
        <div style={{ background: '#112236', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '3rem', width: '100%', maxWidth: 380, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: '1rem' }}>🔐</div>
          <h1 style={{ color: '#F8F9FA', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>AnestPrime Admin</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '2rem' }}>Painel administrativo restrito</p>
          <form onSubmit={handleLogin}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha de acesso"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#F8F9FA', fontSize: '0.95rem', outline: 'none' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p style={{ color: '#F87171', fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</p>}
            <button type="submit" style={{ width: '100%', padding: '0.85rem', background: '#0D9488', color: 'white', border: 'none', borderRadius: 10, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── DASHBOARD ──
  return (
    <div style={{ minHeight: '100vh', background: '#0B1929', color: '#F8F9FA', fontFamily: 'system-ui, sans-serif' }}>

      <div style={{ padding: '1.2rem 2rem', background: '#0B1929', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <img src="/icons/icon-192.png" alt="AnestPrime" style={{ width: 32, height: 32, borderRadius: 8 }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>AnestPrime Admin</p>
            <p style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Painel de crescimento</p>
          </div>
        </div>
        <button onClick={() => { setAuthed(false); setPasswordInput('') }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', padding: '0.4rem 0.8rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem' }}>
          <LogOut size={14} /> Sair
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>

        {dataLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94A3B8' }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</p>
            Carregando dados da plataforma...
          </div>
        ) : (
          <>
            {/* Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {card(<Users size={16} />, 'Total de Usuários', totalUsers, 'Meta: 20 usuários regulares')}
              {card(<Activity size={16} />, 'Usuários Ativos', activeUsers, 'Ativos nos últimos 30 dias', '#10B981')}
              {card(<Users size={16} />, 'Usuários Inativos', inactiveUsers, 'Sem atividade há +30 dias', '#F59E0B')}
              {card(<FileText size={16} />, 'Total de Registros', totalRecords, 'Fichas + consultas + plantões', '#818CF8')}
            </div>

            {/* Barra de progresso */}
            <div style={{ background: '#112236', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Progresso até monetização</span>
                <span style={{ color: '#14B8A8', fontWeight: 700 }}>{activeUsers}/20 usuários ativos</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, height: 12, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  width: `${Math.min((activeUsers / 20) * 100, 100)}%`,
                  background: 'linear-gradient(to right, #0D9488, #14B8A8)',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>
                {activeUsers >= 20
                  ? '🎉 Meta atingida! Hora de monetizar.'
                  : `Faltam ${20 - activeUsers} usuários ativos para iniciar cobrança`}
              </p>
            </div>

            {/* Gráfico */}
            <div style={{ background: '#112236', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem', marginBottom: '2rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={16} color="#14B8A8" /> Novos usuários — Últimos 6 meses
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={growthData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1A3350', border: 'none', borderRadius: 8, fontSize: 12, color: '#F8F9FA' }} />
                  <Bar dataKey="novos" name="Novos usuários" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela */}
            <div style={{ background: '#112236', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Usuários cadastrados ({totalUsers})</p>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Por cadastro mais recente</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {['Nome', 'E-mail', 'CRM', 'Cadastro', 'Status', 'Anest.', 'Pré', 'Plant.', 'Total', 'Última atividade'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#94A3B8', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 500, color: '#F8F9FA', whiteSpace: 'nowrap' }}>{u.full_name}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#94A3B8', fontSize: '0.78rem' }}>{u.email}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#94A3B8', fontFamily: 'monospace' }}>{u.crm}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                          {new Date(u.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
                            background: u.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.12)',
                            color: u.is_active ? '#10B981' : '#F59E0B'
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                            {u.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#818CF8', fontWeight: 600 }}>{u.anesthesia_count}</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#34D399', fontWeight: 600 }}>{u.consultation_count}</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#A5B4FC', fontWeight: 600 }}>{u.shift_count}</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: '#F8F9FA' }}>{u.total_count}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#94A3B8', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                          {u.last_activity ? new Date(u.last_activity).toLocaleDateString('pt-BR') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
