'use client'

import React from 'react'
import useSWR from 'swr'
import { ecpApi } from '@/shared/api'
import { API_URL } from '@/shared/config'
import { authService } from '@/features/auth'
import { toast } from 'react-hot-toast'

type ListItem = { id: number; title: string; status: string; created_at: string; description?: string }

const ALLOWED = new Set(['ARCHIVED'])

const fetchArchived = async (page: number, limit: number) => {
  const res: any = await ecpApi.listDocuments({ page, limit, status: 'ARCHIVED' })
  const items: ListItem[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
  const filtered = items.filter((d) => ALLOWED.has(String(d.status)))
  const pagination = res?.pagination || { page, limit, total: filtered.length }
  return { items: filtered, pagination }
}

export default function EcpArchivePage() {
  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(5)
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [query, setQuery] = React.useState('')
  const { data, error, isLoading } = useSWR(['ecp-archive', page, limit], ([, p, l]) => fetchArchived(p as number, l as number))
  const { data: details } = useSWR(selectedId ? ['ecp-doc-details', selectedId] : null, ([, id]) => ecpApi.getDocumentDetails(id as number))

  const items: ListItem[] = (data?.items || []).filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
  const total = (data?.pagination?.total as number) || items.length
  const pages = Math.max(1, Math.ceil(total / ((data?.pagination?.limit as number) || limit)))

  const color = (s: string) => (s === 'ARCHIVED' ? '#6b7280' : '#6b7280')

  return (
    <div style={{ padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Документы — Архив <span style={{ color: '#888', fontWeight: 400 }}>Всего: {total}</span></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={'Поиск'} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', width: 260 }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isLoading && <div>Загрузка…</div>}
            {error && <div>Ошибка загрузки</div>}
            {items.map((doc) => (
              <div key={doc.id} onClick={() => setSelectedId(doc.id)} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ background: color(doc.status), color: '#fff', padding: '4px 10px', fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Архивирован</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); ecpApi.removeDocument(doc.id).then(() => window.location.reload()).catch(() => {}) }}
                      title="Удалить"
                      style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: 4, borderRadius: 6, cursor: 'pointer' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); ecpApi.unarchiveDocument(doc.id).then(() => window.location.reload()).catch(() => {}) }}
                      title="Разархивировать"
                      style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: 4, borderRadius: 6, cursor: 'pointer' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="M3 4h18v4H3z" />
                        <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
                        <polyline points="12 14 9 11 12 8" />
                        <polyline points="12 14 15 11 12 8" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div style={{ padding: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{doc.title}</div>
                  </div>
                  <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Дата: {String(doc.created_at).split(' ')[0]}{doc.description ? ` · № ${String(doc.description)}` : ''}</div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <div style={{ color: '#666', fontSize: 12 }}>Стр. {page} из {pages} · Всего: {total}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '6px 10px', borderRadius: 8, opacity: page <= 1 ? 0.6 : 1 }}>Назад</button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '6px 10px', borderRadius: 8, opacity: page >= pages ? 0.6 : 1 }}>Вперёд</button>
              </div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
            {selectedId && details ? (
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>{details.title}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16 }}>
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                      {(details.signers || []).map((s: any, idx: number) => {
                        const statusColor = s.status === 'SIGNED' ? '#22c55e' : s.status === 'REQUESTED' || s.status === 'PENDING' ? '#2563eb' : s.status === 'DECLINED' ? '#ef4444' : '#6b7280'
                        const statusLabel = s.status === 'SIGNED' ? 'Подписан' : s.status === 'REQUESTED' || s.status === 'PENDING' ? 'На рассмотрении' : s.status === 'DECLINED' ? 'Отклонён' : s.status || '—'
                        return (
                          <div key={idx} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 10 }}>
                            <div>
                              <div style={{ fontWeight: 700 }}>{(s.iin_bin ? `${s.iin_bin} · ` : '') + (s.fio || 'Подписант')}</div>
                              {s.email ? <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{s.email}</div> : null}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 9999, background: statusColor }}></span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: statusColor }}>{statusLabel}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>История</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                        {((details.log || []).filter((l: any) => !['SIGN_OPERATION_CREATED', 'SIGN_VERIFY_SUCCESS', 'SIGN_VERIFY_FAILED'].includes(l.event_code))).map((l: any, i: number, arr: any[]) => (
                          <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', alignItems: 'start', gap: 10 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ width: 34, height: 34, borderRadius: 9999, background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{i + 1}</div>
                              {i < arr.length - 1 ? (
                                <>
                                  <div style={{ width: 2, height: 18, background: '#2563eb', marginTop: 4 }}></div>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" style={{ marginTop: -2 }}>
                                    <polyline points="6 9 12 15 18 9" />
                                  </svg>
                                </>
                              ) : null}
                            </div>
                            <div>
                              <div style={{ fontSize: 12, color: '#666' }}>{String(l.created_at).split(' ')[0]} {String(l.created_at).split(' ')[1]?.slice(0,5)}</div>
                              {(() => {
                                const displayLabel = (l.label && !/^[A-Z_]+$/.test(String(l.label))) ? l.label : l.event_code
                                return <div style={{ fontWeight: 700, marginTop: 2 }}>{displayLabel}</div>
                              })()}
                              {(() => {
                                const name = l.subject_fio || l.actor?.fio || ''
                                return name ? <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, marginTop: 2 }}>{name}</div> : null
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{(details.files || [])[0]?.file_name || 'Файл отсутствует'}</span>
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
                          const f = (details.files || [])[0] || null
                          const rawId = f ? (f.storage_object_id ?? (f as any).object_id ?? f.document_file_id) : null
                          const fileId = typeof rawId === 'string' ? parseInt(rawId as any, 10) : rawId
                          if (!(typeof fileId === 'number' && isFinite(fileId as any) && (fileId as any) > 0)) { toast.error('Файл недоступен для скачивания'); return }
                          const token = authService.ensureToken()
                          const res = await fetch(`${API_URL}/storage/${fileId}/download`, { headers: { Authorization: `Bearer ${token}` } })
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
                      style={{ background: '#93c5fd', border: 'none', padding: 8, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Скачать"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
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
