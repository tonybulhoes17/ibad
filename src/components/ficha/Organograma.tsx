'use client'

import { useState, useCallback, useRef } from 'react'
import type { TimelineData, TimelinePoint, BPPoint, HRPoint } from '@/types/database.types'
import { FLUID_TYPES, ECG_VALUES, INHALATIONAL_AGENTS } from '@/constants/anesthesia'

const COL_W = 44
const LEFT_W = 100
const HOUR_W = COL_W * 4
const BP_TOP = 220
const BP_H = 200
const BP_MAX = 230
const BP_MIN = 0
const BOTTOM_TOP = BP_TOP + BP_H + 8

function yFromBP(val: number) {
  return BP_TOP + ((BP_MAX - val) / (BP_MAX - BP_MIN)) * BP_H
}

function bpFromY(y: number) {
  const val = BP_MAX - ((y - BP_TOP) / BP_H) * (BP_MAX - BP_MIN)
  return Math.round(Math.max(0, Math.min(230, val)) / 5) * 5
}

interface OrganogramProps {
  data: TimelineData
  onChange?: (d: TimelineData) => void
  mode?: 'edit' | 'print'
}

export function Organograma({ data, onChange, mode = 'edit' }: OrganogramProps) {
  const [editingCell, setEditingCell] = useState<{ field: string; idx: number } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [dragging, setDragging] = useState<{ type: 'systolic' | 'diastolic' | 'hr'; idx: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const cols = data.duration_minutes / 15
  const svgW = LEFT_W + cols * COL_W + 40
  const svgH = BOTTOM_TOP + 5 * 22 + 20
  const endX = LEFT_W + (data.end_marker_at / 15) * COL_W

  const update = useCallback((partial: Partial<TimelineData>) => {
    onChange?.({ ...data, ...partial })
  }, [data, onChange])

  function getSVGY(e: React.MouseEvent) {
    const svg = svgRef.current
    if (!svg) return 0
    const rect = svg.getBoundingClientRect()
    const scaleY = svgH / rect.height
    return (e.clientY - rect.top) * scaleY
  }

  function startDrag(type: 'systolic' | 'diastolic' | 'hr', idx: number) {
    if (mode !== 'edit') return
    setDragging({ type, idx })
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return
    e.preventDefault()
    const y = getSVGY(e)
    const newVal = bpFromY(y)

    if (dragging.type === 'systolic') {
      const newBP = [...data.bp]
      newBP[dragging.idx] = { ...newBP[dragging.idx], systolic: Math.max(newBP[dragging.idx].diastolic + 10, newVal) }
      update({ bp: newBP })
    } else if (dragging.type === 'diastolic') {
      const newBP = [...data.bp]
      newBP[dragging.idx] = { ...newBP[dragging.idx], diastolic: Math.min(newBP[dragging.idx].systolic - 10, newVal) }
      update({ bp: newBP })
    } else if (dragging.type === 'hr') {
      const newHR = [...data.hr]
      newHR[dragging.idx] = { ...newHR[dragging.idx], value: Math.max(20, Math.min(220, newVal)) }
      update({ hr: newHR })
    }
  }

  function stopDrag() {
    setDragging(null)
  }

  function startEdit(field: string, idx: number, current: string) {
    if (mode !== 'edit') return
    setEditingCell({ field, idx })
    setEditValue(current)
  }

  function commitEdit(field: keyof TimelineData) {
    if (!editingCell) return
    const arr = [...(data[field] as TimelinePoint[])]
    arr[editingCell.idx] = { ...arr[editingCell.idx], value: editValue }
    update({ [field]: arr })
    setEditingCell(null)
  }

  function generatePoints(field: keyof TimelineData, defaultVal: string, step = 15) {
    const points: TimelinePoint[] = []
    for (let m = 0; m <= data.end_marker_at; m += step) {
      points.push({ minute: m, value: defaultVal })
    }
    update({ [field]: points })
  }

  function EditableCell({ x, y, value, field, idx, selectOptions }: {
    x: number; y: number; value: string; field: string; idx: number; selectOptions?: string[]
  }) {
    const isEditing = editingCell?.field === field && editingCell.idx === idx
    if (isEditing && mode === 'edit') {
      return (
        <foreignObject x={x - 20} y={y - 12} width={44} height={22}>
          {selectOptions ? (
            <select value={editValue} onChange={e => setEditValue(e.target.value)}
              onBlur={() => commitEdit(field as keyof TimelineData)} autoFocus
              style={{ width: '100%', fontSize: 9, padding: '1px 2px', border: '1px solid #1A56A0', borderRadius: 3 }}>
              {selectOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input value={editValue} onChange={e => setEditValue(e.target.value)}
              onBlur={() => commitEdit(field as keyof TimelineData)}
              onKeyDown={e => e.key === 'Enter' && commitEdit(field as keyof TimelineData)}
              autoFocus
              style={{ width: '100%', fontSize: 9, padding: '1px 3px', border: '1px solid #1A56A0', borderRadius: 3 }} />
          )}
        </foreignObject>
      )
    }
    return (
      <text x={x} y={y} textAnchor="middle" fontSize={9} fill="#1E293B"
        onClick={() => startEdit(field, idx, value)}
        style={{ cursor: mode === 'edit' ? 'pointer' : 'default', userSelect: 'none' }}>
        {value}
      </text>
    )
  }

  return (
    <div className="w-full">
      {mode === 'edit' && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex gap-2">
            <ToggleBtn active={data.o2} label="O₂" onClick={() => update({ o2: !data.o2 })} />
            <ToggleBtn active={data.compressed_air} label="Ar" onClick={() => update({ compressed_air: !data.compressed_air })} />
          </div>
          <select value={data.inhalational ?? ''}
            onChange={e => update({ inhalational: e.target.value as TimelineData['inhalational'] || null })}
            className="text-xs px-2 py-1 border border-slate-300 rounded-md bg-white">
            <option value="">— Inalatório —</option>
            {INHALATIONAL_AGENTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
          <button onClick={() => generatePoints('saturation', '100%')}
            className="text-xs px-2 py-1 bg-white border border-slate-300 rounded-md hover:bg-slate-50">+ Saturação</button>
          <button onClick={() => generatePoints('ecg', 'RS')}
            className="text-xs px-2 py-1 bg-white border border-slate-300 rounded-md hover:bg-slate-50">+ ECG</button>
          <ToggleBtn active={data.etco2.length > 0} label="CO₂"
            onClick={() => data.etco2.length > 0
              ? update({ etco2: [] })
              : generatePoints('etco2', '40', 15)} />
          <ToggleBtn active={data.temperature.length > 0} label="Temp"
            onClick={() => data.temperature.length > 0
              ? update({ temperature: [] })
              : generatePoints('temperature', '36°C', 30)} />
          <button type="button"
            onClick={() => {
              const lastMinute = data.fluids.length > 0 ? data.fluids[data.fluids.length - 1].minute + 15 : 0
              const newMinute = Math.min(lastMinute, data.end_marker_at)
              update({ fluids: [...data.fluids, { minute: newMinute, value: 'SF' }] })
            }}
            className="text-xs px-2 py-1 bg-white border border-slate-300 rounded-md hover:bg-slate-50">+ Fluido</button>
          <button type="button"
            onClick={() => { if (data.fluids.length > 1) update({ fluids: data.fluids.slice(0, -1) }) }}
            className="text-xs px-2 py-1 bg-white border border-red-200 text-red-500 rounded-md hover:bg-red-50">- Fluido</button>
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-slate-500">Fim:</span>
            <select value={data.end_marker_at}
              onChange={e => update({ end_marker_at: Number(e.target.value) })}
              className="text-xs px-2 py-1 border border-slate-300 rounded-md bg-white font-mono">
              {Array.from({ length: cols + 1 }, (_, i) => i * 15).map(m => (
                <option key={m} value={m}>{m}min</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <svg ref={svgRef} width={svgW} height={svgH}
          style={{ fontFamily: 'Arial, sans-serif', display: 'block', cursor: dragging ? 'ns-resize' : 'default' }}
          onMouseMove={onMouseMove} onMouseUp={stopDrag} onMouseLeave={stopDrag}>

          <defs>
            <clipPath id="clip-end">
              <rect x={LEFT_W} y={0} width={endX - LEFT_W} height={svgH} />
            </clipPath>
          </defs>

          {/* Grid horizontal */}
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={`hg${i}`} x1={LEFT_W} y1={BP_TOP + (i / 13) * BP_H}
              x2={LEFT_W + cols * COL_W} y2={BP_TOP + (i / 13) * BP_H}
              stroke="#F1F5F9" strokeWidth={0.5} />
          ))}

          {/* Grid vertical */}
          {Array.from({ length: cols + 1 }).map((_, i) => (
            <line key={`vg${i}`} x1={LEFT_W + i * COL_W} y1={0} x2={LEFT_W + i * COL_W} y2={svgH}
              stroke={i % 4 === 0 ? '#CBD5E1' : '#F1F5F9'} strokeWidth={i % 4 === 0 ? 1 : 0.5} />
          ))}

          {/* Horas */}
          {Array.from({ length: Math.ceil(cols / 4) + 1 }).map((_, i) => (
            <text key={`h${i}`} x={LEFT_W + i * HOUR_W + HOUR_W / 2} y={12}
              textAnchor="middle" fontSize={10} fontWeight="bold" fill="#475569">{i}h</text>
          ))}

          {/* Minutos */}
          {Array.from({ length: cols }).map((_, i) => (
            <text key={`m${i}`} x={LEFT_W + i * COL_W + COL_W / 2} y={24}
              textAnchor="middle" fontSize={8} fill="#94A3B8">{(i * 15) % 60}</text>
          ))}

          <line x1={0} y1={30} x2={svgW} y2={30} stroke="#E2E8F0" strokeWidth={1} />

          {/* O2 */}
          <text x={LEFT_W - 4} y={48} textAnchor="end" fontSize={9} fill="#64748B">O₂</text>
          {data.o2 && <line x1={LEFT_W} y1={46} x2={endX} y2={46} stroke="#0EA5E9" strokeWidth={2.5} />}

          {/* Ar comprimido */}
          <text x={LEFT_W - 4} y={68} textAnchor="end" fontSize={9} fill="#64748B">Ar comp.</text>
          {data.compressed_air && <line x1={LEFT_W} y1={66} x2={endX} y2={66} stroke="#94A3B8" strokeWidth={2} strokeDasharray="4,2" />}

          {/* Inalatório */}
          <text x={LEFT_W - 4} y={88} textAnchor="end" fontSize={9} fill="#64748B">
            {data.inhalational ? INHALATIONAL_AGENTS.find(a => a.value === data.inhalational)?.label.slice(0, 8) : 'Inalat.'}
          </text>
          {data.inhalational && <line x1={LEFT_W} y1={86} x2={endX} y2={86} stroke="#8B5CF6" strokeWidth={2} />}

          {/* Saturação */}
          <text x={LEFT_W - 4} y={108} textAnchor="end" fontSize={9} fill="#64748B">Sat O₂</text>
          <g clipPath="url(#clip-end)">
            {data.saturation.map((pt, i) => (
              <EditableCell key={`sat${i}`} x={LEFT_W + (pt.minute / 15) * COL_W + COL_W / 2}
                y={108} value={pt.value} field="saturation" idx={i} />
            ))}
          </g>

          {/* ECG */}
          <text x={LEFT_W - 4} y={128} textAnchor="end" fontSize={9} fill="#64748B">ECG</text>
          <g clipPath="url(#clip-end)">
            {data.ecg.map((pt, i) => (
              <EditableCell key={`ecg${i}`} x={LEFT_W + (pt.minute / 15) * COL_W + COL_W / 2}
                y={128} value={pt.value} field="ecg" idx={i} selectOptions={[...ECG_VALUES]} />
            ))}
          </g>

          <line x1={0} y1={140} x2={svgW} y2={140} stroke="#E2E8F0" strokeWidth={1} />

          {/* Escala BP */}
          {[230, 200, 180, 160, 140, 120, 100, 80, 60, 40, 20, 0].map(val => (
            <text key={`scale${val}`} x={LEFT_W - 6} y={yFromBP(val) + 3}
              textAnchor="end" fontSize={8} fill="#94A3B8">{val}</text>
          ))}

          {/* PA e FC com drag */}
          <g clipPath="url(#clip-end)">
            {data.bp.map((pt, i) => {
              const x = LEFT_W + (pt.minute / 15) * COL_W + COL_W / 2
              const sy = yFromBP(pt.systolic)
              const dy = yFromBP(pt.diastolic)
              const half = 7
              const isDragSys = dragging?.type === 'systolic' && dragging.idx === i
              const isDragDia = dragging?.type === 'diastolic' && dragging.idx === i
              return (
                <g key={`bp${i}`}>
                  <line x1={x} y1={sy + half} x2={x} y2={dy - half} stroke="#CBD5E1" strokeWidth={1} strokeDasharray="2,2" />
                  {/* Sistólica ▽ */}
                  <polygon
                    points={`${x},${sy + half * 1.5} ${x - half},${sy} ${x + half},${sy}`}
                    fill={isDragSys ? '#1A56A0' : 'none'}
                    stroke={isDragSys ? '#1A56A0' : '#1E293B'} strokeWidth={1.5}
                    style={{ cursor: mode === 'edit' ? 'ns-resize' : 'default' }}
                    onMouseDown={() => startDrag('systolic', i)} />
                  <text x={x + half + 3} y={sy + 3} fontSize={7} fill="#475569">{pt.systolic}</text>
                  {/* Diastólica △ */}
                  <polygon
                    points={`${x},${dy - half * 1.5} ${x - half},${dy} ${x + half},${dy}`}
                    fill={isDragDia ? '#1A56A0' : 'none'}
                    stroke={isDragDia ? '#1A56A0' : '#1E293B'} strokeWidth={1.5}
                    style={{ cursor: mode === 'edit' ? 'ns-resize' : 'default' }}
                    onMouseDown={() => startDrag('diastolic', i)} />
                  <text x={x + half + 3} y={dy + 3} fontSize={7} fill="#475569">{pt.diastolic}</text>
                </g>
              )
            })}

            {/* FC */}
            {data.hr.map((pt, i) => {
              const x = LEFT_W + (pt.minute / 15) * COL_W + COL_W / 2
              const y = yFromBP(pt.value as number)
              const isDrag = dragging?.type === 'hr' && dragging.idx === i
              return (
                <g key={`hr${i}`}>
                  <circle cx={x} cy={y} r={isDrag ? 6 : 4}
                    fill={isDrag ? '#1A56A0' : '#1E293B'} stroke="white" strokeWidth={1.5}
                    style={{ cursor: mode === 'edit' ? 'ns-resize' : 'default' }}
                    onMouseDown={() => startDrag('hr', i)} />
                  <text x={x + 8} y={y + 3} fontSize={7} fill="#64748B">{pt.value}</text>
                </g>
              )
            })}
          </g>

          <line x1={0} y1={BP_TOP + BP_H + 4} x2={svgW} y2={BP_TOP + BP_H + 4} stroke="#E2E8F0" strokeWidth={1} />

          {/* CO2 */}
          {data.etco2.length > 0 && <>
            <text x={LEFT_W - 4} y={BOTTOM_TOP + 14} textAnchor="end" fontSize={9} fill="#64748B">CO₂ exp.</text>
            <g clipPath="url(#clip-end)">
              {data.etco2.map((pt, i) => (
                <EditableCell key={`co2${i}`} x={LEFT_W + (pt.minute / 15) * COL_W + COL_W / 2}
                  y={BOTTOM_TOP + 14} value={pt.value} field="etco2" idx={i} />
              ))}
            </g>
          </>}

          <line x1={0} y1={BOTTOM_TOP + 20} x2={svgW} y2={BOTTOM_TOP + 20} stroke="#F1F5F9" strokeWidth={1} />

          {/* Temperatura */}
          {data.temperature.length > 0 && <>
            <text x={LEFT_W - 4} y={BOTTOM_TOP + 36} textAnchor="end" fontSize={9} fill="#64748B">Temp.</text>
            <g clipPath="url(#clip-end)">
              {data.temperature.map((pt, i) => (
                <EditableCell key={`temp${i}`} x={LEFT_W + (pt.minute / 15) * COL_W + COL_W / 2}
                  y={BOTTOM_TOP + 36} value={pt.value} field="temperature" idx={i} />
              ))}
            </g>
          </>}

          <line x1={0} y1={BOTTOM_TOP + 42} x2={svgW} y2={BOTTOM_TOP + 42} stroke="#F1F5F9" strokeWidth={1} />

          {/* Fluidos */}
          <text x={LEFT_W - 4} y={BOTTOM_TOP + 58} textAnchor="end" fontSize={9} fill="#64748B">Fluidos</text>
          <g clipPath="url(#clip-end)">
            {data.fluids.map((pt, i) => (
              <EditableCell key={`fl${i}`} x={LEFT_W + (pt.minute / 15) * COL_W + COL_W / 2}
                y={BOTTOM_TOP + 58} value={pt.value} field="fluids" idx={i}
                selectOptions={FLUID_TYPES.map(f => f.value)} />
            ))}
          </g>

          {/* Linha de fim */}
          <line x1={endX} y1={0} x2={endX} y2={svgH} stroke="#1A56A0" strokeWidth={2} strokeDasharray="6,4" />
          <text x={endX + 3} y={15} fontSize={8} fill="#1A56A0" fontWeight="bold">FIM</text>

          {/* Bordas */}
          <rect x={0} y={0} width={svgW} height={svgH} fill="none" stroke="#E2E8F0" strokeWidth={1} rx={4} />
        </svg>
      </div>

      {mode === 'edit' && (
        <div className="flex gap-4 mt-2 text-xs text-slate-500">
          <span>▽ PA Sistólica — arraste ↕</span>
          <span>△ PA Diastólica — arraste ↕</span>
          <span>• FC — arraste ↕</span>
          <span className="text-primary-600 font-medium">┆ Fim da cirurgia</span>
        </div>
      )}
    </div>
  )
}

function ToggleBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
        active ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
      }`}>
      {label}
    </button>
  )
}