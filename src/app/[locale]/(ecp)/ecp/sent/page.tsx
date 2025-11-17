'use client'

import React from 'react'
import useSWR from 'swr'
import { useTranslations } from 'next-intl'
import { ecpApi } from '@/shared/api'
import { API_URL } from '@/shared/config'
import { authService } from '@/features/auth'
import { toast } from 'react-hot-toast'

type ListItem = {
  id: number
  title: string
  status: string
  created_at: string
  signers_count: number
}

const ALLOWED = new Set(['ROUTED', 'PENDING_SIGNATURE', 'PARTIALLY_SIGNED', 'SIGNED'])

const fetchSent = async () => {
  const res: any = await ecpApi.listDocuments({ outbox: true, inbox: false, page: 1, limit: 100 })
  const items: ListItem[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
  const filtered = items.filter((d) => ALLOWED.has(String(d.status)))
  const pagination = res?.pagination || null
  return { items: filtered, pagination }
}

export default function EcpSentPage() {
  const t = useTranslations('ecp.sidebar')
  const { data, error, isLoading } = useSWR('ecp-sent', fetchSent)
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [query, setQuery] = React.useState('')
  const refresh = React.useCallback(() => {
    // simple trigger by mutate of SWR key
    // useSWR returns revalidate via mutate; to keep minimal, rely on key change below
  }, [])
  const { data: details } = useSWR(selectedId ? ['ecp-doc-details', selectedId] : null, ([, id]) => ecpApi.getDocumentDetails(id as number))

  const items: ListItem[] = data?.items || []
  const filtered = items.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
  const total = filtered.length

  const color = (s: string) => {
    if (s === 'SIGNED') return '#22c55e'
    if (s === 'ROUTED' || s === 'PENDING_SIGNATURE' || s === 'PARTIALLY_SIGNED') return '#2563eb'
    if (s === 'DECLINED' || s === 'CANCELLED') return '#ef4444'
    return '#6b7280'
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Документы — Отправленные <span style={{ color: '#888', fontWeight: 400 }}>Всего: {total}</span></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={'Поиск'} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', width: 260 }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isLoading && <div>Загрузка…</div>}
            {error && <div>Ошибка загрузки</div>}
            {filtered.map((doc) => (
              <div key={doc.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: color(doc.status), color: '#fff', padding: '4px 10px', fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{doc.status === 'SIGNED' ? 'Подписан' : doc.status === 'PARTIALLY_SIGNED' ? 'Частично подписан' : doc.status === 'PENDING_SIGNATURE' ? 'На подписи' : 'Направлен контрагенту'}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => {
                        // удаление доступно для черновиков, иначе игнор
                        if (String(doc.status) !== 'DRAFT') return
                        ecpApi.deleteDocument(doc.id).then(() => window.location.reload()).catch(() => {})
                      }}
                      title="Удалить"
                      style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: 4, borderRadius: 6, cursor: String(doc.status) === 'DRAFT' ? 'pointer' : 'not-allowed' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div style={{ padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{doc.title}</div>
                    <button onClick={() => setSelectedId(doc.id)} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '4px 8px', borderRadius: 8 }}>Открыть</button>
                  </div>
                  <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Дата создания: {new Date(doc.created_at).toLocaleDateString()} · Подписанты: {doc.signers_count}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
            {selectedId && details ? (
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>{details.title}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16 }}>
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                      {(details.signers || []).map((s: any, idx: number) => {
                        const statusColor = s.status === 'SIGNED' ? '#22c55e' : s.status === 'REQUESTED' || s.status === 'PENDING' ? '#2563eb' : '#6b7280'
                        const statusLabel = s.status === 'SIGNED' ? 'Подписан' : s.status === 'REQUESTED' || s.status === 'PENDING' ? 'На рассмотрении' : s.status || '—'
                        return (
                          <div key={idx} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 700 }}>{(s.iin_bin ? `${s.iin_bin} · ` : '') + (s.fio || 'Подписант')}</div>
                                {s.email ? <div style={{ fontSize: 12, color: '#666' }}>{s.email}</div> : null}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 9999, background: statusColor }}></span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: statusColor }}>{statusLabel}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {/* Панель действий под подписантами */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      {/* На отправленных чаще всего нет доступных действий; оставляем пусто или будущие кнопки */}
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>История</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                        {(details.log || []).map((l: any, i: number) => (
                          <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9999, background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{i + 1}</div>
                            <div>
                              <div style={{ fontWeight: 700 }}>{l.event_code}</div>
                              <div style={{ fontSize: 12, color: '#666' }}>{new Date(l.created_at).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Файл под историей */}
                    <div style={{ marginTop: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{(details.files || [])[0]?.file_name || 'Файл отсутствует'}</span>
                      {(() => {
                        const f = (details.files || [])[0] || null
                        const rawId = f ? (f.storage_object_id ?? f.object_id ?? f.document_file_id) : null
                        const fileId = typeof rawId === 'string' ? parseInt(rawId as any, 10) : rawId
                        const disabled = !(typeof fileId === 'number' && isFinite(fileId as any) && (fileId as any) > 0)
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button onClick={() => {}} style={{ background: '#e5e7eb', border: 'none', padding: 8, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Посмотреть">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8-11 8-11-8-11-8z" transform="translate(1)" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  if (disabled) { toast.error('Файл недоступен для скачивания'); return }
                                  const token = authService.ensureToken()
                                  const res = await fetch(`${API_URL}/storage/${fileId}/download`, {
                                    headers: { Authorization: `Bearer ${token}` },
                                  })
                                  if (!res.ok) throw new Error('Ошибка запроса на скачивание')
                                  const blob = await res.blob()
                                  const url = URL.createObjectURL(blob)
                                  const a = document.createElement('a')
                                  a.href = url
                                  a.download = f?.file_name || 'file'
                                  document.body.appendChild(a)
                                  a.click()
                                  a.remove()
                                  URL.revokeObjectURL(url)
                                } catch (e: any) {
                                  toast.error(e?.message || 'Не удалось скачать файл')
                                }
                              }}
                              style={{ background: '#93c5fd', border: 'none', padding: 8, borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: disabled ? 0.6 : 1 }}
                              title="Скачать"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </button>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#666' }}>Выберите документ слева</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
