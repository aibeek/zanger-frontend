'use client'

import React from 'react'
import useSWR from 'swr'
import { useTranslations } from 'next-intl'
import { ecpApi } from '@/shared/api'
import { API_URL } from '@/shared/config'
import { authService } from '@/features/auth'
import { signChallengeBase64 } from '@/shared/lib/ncalayer'
import { toast } from 'react-hot-toast'

type ListItem = {
  id: number
  title: string
  status: string
  created_at: string
  signers_count: number
  description?: string
}

const ALLOWED = new Set(['ROUTED', 'PENDING_SIGNATURE', 'PARTIALLY_SIGNED', 'SIGNED', 'DECLINED', 'CANCELLED'])

const fetchIncoming = async (page: number, limit: number) => {
  const res: any = await ecpApi.listDocuments({ inbox: true, outbox: false, page: 1, limit: 100 })
  const items: ListItem[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
  const filtered = items.filter((d) => ALLOWED.has(String(d.status)))
  const start = Math.max(0, (page - 1) * limit)
  const paged = filtered.slice(start, start + limit)
  const pagination = { page, limit, total: filtered.length }
  return { items: paged, pagination }
}

export default function EcpIncomingPage() {
  const t = useTranslations('ecp.sidebar')
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(5)
  const { data, error, isLoading } = useSWR(['ecp-incoming', page, limit], ([, p, l]) => fetchIncoming(p as number, l as number))
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [query, setQuery] = React.useState('')
  const { data: details, mutate: mutateDetails } = useSWR(selectedId ? ['ecp-doc-details', selectedId] : null, ([, id]) => ecpApi.getDocumentDetails(id as number))
  const [declineOpen, setDeclineOpen] = React.useState(false)
  const [declineReason, setDeclineReason] = React.useState('')
  const [isSigning, setIsSigning] = React.useState(false)

  const items: ListItem[] = data?.items || []
  const filtered = items.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
  const total = (data?.pagination?.total as number) || filtered.length
  const pages = Math.max(1, Math.ceil(total / ((data?.pagination?.limit as number) || limit)))

  const color = (s: string) => {
    if (s === 'SIGNED') return '#22c55e'
    if (s === 'PARTIALLY_SIGNED') return '#f59e0b'
    if (s === 'ROUTED' || s === 'PENDING_SIGNATURE') return '#2563eb'
    if (s === 'DECLINED') return '#ef4444'
    if (s === 'CANCELLED') return '#6b7280'
    return '#6b7280'
  }

  const canSign = !!(details && Array.isArray(details.signers) && details.signers.some((s: any) => s.can_sign))

  const eventLabel = (code: string) => {
    if (code === 'DOCUMENT_SENT_FOR_SIGNATURE') return 'Отправлен'
    if (code === 'DOCUMENT_ROUTED') return 'Маршрутизирован'
    if (code === 'SIGNERS_ADDED') return 'Подписанты добавлены'
    if (code === 'SIGN_OPERATION_CREATED') return 'Операция подписи'
    if (code === 'SIGN_VERIFY_SUCCESS') return 'Проверка подписи'
    if (code === 'SIGN_COMPLETED') return 'Подписан'
    if (code === 'SIGN_DECLINED' || code === 'DOCUMENT_DECLINED') return 'Отклонено'
    return code
  }

  const formatAt = (s?: string) => {
    if (!s) return ''
    try {
      let iso = String(s).trim()
      if (!iso.includes('T')) iso = iso.replace(' ', 'T')
      iso = iso.replace(/\s\+(\d{2}:\d{2})$/, '+$1').replace(/\sZ$/, 'Z')
      if (iso.endsWith('+00:00')) iso = iso.replace('+00:00', 'Z')
      const d = new Date(iso)
      return new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'Asia/Almaty',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d)
    } catch {
      return String(s)
    }
  }

  const truncate = (str: string, max = 28) => {
    const s = String(str)
    return s.length > max ? s.slice(0, max - 1) + '…' : s
  }

  const onSign = async () => {
    if (!selectedId) return
    try {
      setIsSigning(true)
      const init = await ecpApi.signInitiate(selectedId, 'SIGN_CMS')
      const cms = await signChallengeBase64(init.challenge)
      const verifyRes = await ecpApi.signVerify(selectedId, { operation_id: init.operation_id, cms })
      if (!verifyRes?.valid || verifyRes?.status !== 'VERIFIED') {
        toast.error('Ошибка проверки подписи')
        setIsSigning(false)
        return
      }
      await ecpApi.signComplete(selectedId, { operation_id: init.operation_id, cms })
      const d = await ecpApi.getDocumentDetails(selectedId)
      await mutateDetails(d, false)
      toast.success('Подписано')
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось подписать')
    } finally {
      setIsSigning(false)
    }
  }

  const onDecline = async () => {
    if (!selectedId || !declineReason.trim()) {
      toast.error('Укажите причину')
      return
    }
    try {
      const res = await ecpApi.decline(selectedId, declineReason.trim())
      if (res?.success) {
        const d = await ecpApi.getDocumentDetails(selectedId)
        await mutateDetails(d, false)
        toast.success('Отклонено')
        setDeclineOpen(false)
        setDeclineReason('')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось отклонить')
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Документы — Входящие <span style={{ color: '#888', fontWeight: 400 }}>Всего: {total}</span></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={'Поиск'} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', width: 260 }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isLoading && <div>Загрузка…</div>}
            {error && <div>Ошибка загрузки</div>}
            {filtered.map((doc) => (
              <div key={doc.id} onClick={() => setSelectedId(doc.id)} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ background: color(doc.status), color: '#fff', padding: '4px 10px', fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{
                    doc.status === 'SIGNED' ? 'Подписан' :
                    doc.status === 'PARTIALLY_SIGNED' ? 'Частично подписан' :
                    doc.status === 'PENDING_SIGNATURE' ? 'На подписи' :
                    doc.status === 'DECLINED' ? 'Отклонён' :
                    doc.status === 'CANCELLED' ? 'Отменён' :
                    'Получен'
                  }</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        ecpApi.archiveDocument(doc.id).then(() => window.location.reload()).catch(() => {})
                      }}
                      title="Архивировать"
                      style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: 4, borderRadius: 6, cursor: 'pointer' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="4" />
                        <path d="M5 8h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8" />
                        <path d="M10 12h4v4h-4z" />
                      </svg>
                    </button>
                    <button title="Удалить" onClick={(e) => { e.stopPropagation(); ecpApi.removeDocument(doc.id).then(() => window.location.reload()).catch(() => {}) }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: 4, borderRadius: 6, cursor: 'pointer' }}>
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
                <div style={{ padding: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{truncate(doc.title)}</div>
                  </div>
                  <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Дата получения: {String(doc.created_at).split(' ')[0]}{doc.description ? ` · № ${String(doc.description)}` : ''}</div>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, maxWidth: 520, alignSelf: 'start' }}>
                    {(details.signers || []).map((s: any, idx: number) => {
                      const statusColor =
                        s.status === 'SIGNED' ? '#22c55e' :
                        s.status === 'REQUESTED' || s.status === 'PENDING' ? '#2563eb' :
                        s.status === 'DECLINED' ? '#ef4444' :
                        '#6b7280'
                      const statusLabel =
                        s.status === 'SIGNED' ? 'Подписан' :
                        s.status === 'REQUESTED' || s.status === 'PENDING' ? 'На рассмотрении' :
                        s.status === 'DECLINED' ? 'Отклонён' :
                        s.status === 'EXPIRED' ? 'Истёк' :
                        s.status || '—'
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
                              <div style={{ fontSize: 12, color: '#666' }}>{formatAt(l.created_at)}</div>
                              {(() => {
                                const displayLabel = (l.label && !/^[A-Z_]+$/.test(String(l.label))) ? l.label : eventLabel(l.event_code)
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
                {canSign && (
                  !declineOpen ? (
                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      <button onClick={onSign} disabled={isSigning} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: 12, fontWeight: 700 }}>{isSigning ? 'Подписание…' : 'Подписать'}</button>
                      <button onClick={() => setDeclineOpen(true)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: 12, fontWeight: 700 }}>Отклонить</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
                      <input value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} placeholder={'Причина отказа'} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', width: 300 }} />
                      <button onClick={onDecline} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: 12, fontWeight: 700 }}>Отправить</button>
                      <button onClick={() => { setDeclineOpen(false); setDeclineReason('') }} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '12px 18px', borderRadius: 12 }}>Отмена</button>
                    </div>
                  )
                )}
                
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
