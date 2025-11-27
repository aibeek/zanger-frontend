'use client'

import React from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { useTranslations, useLocale } from 'next-intl'
import { ecpApi, counterpartiesApi, signingApi } from '@/shared/api'
import { API_URL } from '@/shared/config'
import { authService } from '@/features/auth'
import { useLoginStore } from '@/features/auth'
import { signChallengeBase64, isNcaLayerAvailable, signXmlFromBase64, detectSignatureMethod } from '@/shared/lib/ncalayer'
import { toast } from 'react-hot-toast'
import { Input, Button } from '@/shared/ui-kit'
import { ConfirmModal } from '@/shared/ui-kit'
import { Modal, useModal } from '@/shared/ui-kit'

type DocItem = {
  id: number
  title: string
  status: string
  created_at: string
  created_by: number
  signers_count: number
  files?: { file_name: string; file_type: string }[]
}

type CounterpartyItem = { id: number; name: string; iin_bin?: string; email?: string; phone?: string; user_id?: number | null }

const fetchDrafts = async (page: number, limit: number, q?: string) => {
  const res: any = await ecpApi.listDocuments({ status: 'DRAFT', outbox: true, inbox: false, page: 1, limit: 100, q })
  const items: DocItem[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
  const start = Math.max(0, (page - 1) * limit)
  const paged = items.slice(start, start + limit)
  const pagination = { page, limit, total: items.length }
  return { items: paged, pagination }
}

export default function EcpDraftsPage() {
  const t = useTranslations('ecp.create')
  const locale = useLocale()
  const { personalData, getPersonalDataByToken } = useLoginStore()

  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(5)
  const [query, setQuery] = React.useState('')
  const [queryDraft, setQueryDraft] = React.useState('')
  const { data, error, isLoading } = useSWR(['ecp-drafts', page, limit, query], ([, p, l, q]) => fetchDrafts(p as number, l as number, q as string))
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const { data: details, mutate: mutateDetails } = useSWR(selectedId ? ['ecp-doc-details', selectedId] : null, ([, id]) => ecpApi.getDocumentDetails(id as number))

  const [isEditing, setIsEditing] = React.useState(false)
  const [signatories, setSignatories] = React.useState<CounterpartyItem[]>([])
  const [selectedSignerId, setSelectedSignerId] = React.useState<number | ''>('')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<CounterpartyItem[]>([])
  const [selectedCounterpartyId, setSelectedCounterpartyId] = React.useState<number | null>(null)

  const selectedCounterparty = React.useMemo(() => {
    if (!selectedCounterpartyId) return null
    return [...signatories, ...searchResults].find((x) => x.id === selectedCounterpartyId) || null
  }, [selectedCounterpartyId, signatories, searchResults])

  React.useEffect(() => {
    if (!personalData) {
      getPersonalDataByToken().catch(() => {})
    }
  }, [personalData, getPersonalDataByToken])
  

  React.useEffect(() => {
    const userId = personalData?.id
    if (!userId) return
    let mounted = true
    counterpartiesApi.getByUserId(userId).then((res: any) => {
      if (!mounted) return
      const normalized: CounterpartyItem[] = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
        ? res.data
        : []
      setSignatories(normalized)
    }).catch(() => {}).finally(() => {})
    return () => { mounted = false }
  }, [personalData])

  React.useEffect(() => {
    const q = searchQuery.trim()
    if (!q) { setSearchResults([]); return }
    const tId = setTimeout(async () => {
      try {
        const res: any = await counterpartiesApi.search({ query: q })
        const normalized: CounterpartyItem[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.data)
          ? res.data
          : []
        setSearchResults(normalized)
      } catch (e: any) { toast.error(e?.message || 'Ошибка') }
    }, 350)
    return () => clearTimeout(tId)
  }, [searchQuery])

  const items: DocItem[] = (data?.items || []).filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
  const total: number = data?.pagination?.total ?? items.length
  const pages = Math.max(1, Math.ceil(total / ((data?.pagination?.limit as number) || limit)))
  const [confirmArchiveId, setConfirmArchiveId] = React.useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<number | null>(null)
  const [isConfirmLoading, setIsConfirmLoading] = React.useState(false)
  const { isOpen: isPreviewOpen, open: openPreview, close: closePreview } = useModal()
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false)
  const [previewError, setPreviewError] = React.useState<string | null>(null)
  const [previewName, setPreviewName] = React.useState<string | null>(null)

  const eventLabel = (code: string) => {
    if (code === 'DOCUMENT_CREATED') return 'Создан'
    if (code === 'DOCUMENT_UPDATED') return 'Обновлён'
    if (code === 'DOCUMENT_SENT_FOR_SIGNATURE') return 'Отправлен на подписание'
    if (code === 'DOCUMENT_ROUTED') return 'Отправлен на подписание'
    if (code === 'ROUTE_CHANGED') return 'Маршрут изменён'
    if (code === 'SIGNERS_ADDED') return 'Подписанты добавлены'
    if (code === 'COUNTERPARTY_INVITE_SENT') return 'Приглашение отправлено'
    if (code === 'SIGN_OPERATION_CREATED') return 'Операция подписи'
    if (code === 'SIGN_VERIFY_SUCCESS') return 'Проверка подписи'
    if (code === 'SIGN_VERIFY_FAILED') return 'Ошибка проверки подписи'
    if (code === 'SIGN_COMPLETED') return 'Подписан'
    if (code === 'SIGN_DECLINED' || code === 'DOCUMENT_DECLINED') return 'Отклонено'
    if (code === 'DOCUMENT_ARCHIVED') return 'Архивирован'
    if (code === 'DOCUMENT_RESTORED') return 'Разархивирован'
    if (code === 'DOCUMENT_DELETED') return 'Удалён'
    if (code === 'DOCUMENT_TRASHED') return 'Перемещён в корзину'
    if (code === 'DOCUMENT_VIEWED') return 'Просмотрен'
    if (code === 'COMMENT_ADDED') return 'Комментарий добавлен'
    if (code === 'FILE_ADDED') return 'Файл добавлен'
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
        timeZone: 'UTC',
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

  const findCounterpartyById = (id?: number | null): CounterpartyItem | undefined => {
    if (!id) return undefined
    return [...signatories, ...searchResults].find((x) => x.id === id)
  }

  const onSendWithoutSign = async () => {
    if (!selectedId) return
    try {
      const signersPayload: any[] = []
      const chosenCounterparty = findCounterpartyById(selectedCounterpartyId)
      if (selectedCounterpartyId && !chosenCounterparty?.user_id) {
        toast.error('Контрагент не привязан к пользователю — не появится во входящих')
      }
      if (selectedCounterpartyId && (!selectedSignerId || selectedCounterpartyId !== selectedSignerId)) {
        signersPayload.push({ counterparty_id: selectedCounterpartyId, role: 'SIGNER', stage_no: 1 })
      }
      if (selectedSignerId && typeof selectedSignerId === 'number') {
        signersPayload.push({ counterparty_id: selectedSignerId, role: 'SIGNER', stage_no: 2 })
      }
      if (signersPayload.length > 0) {
        await ecpApi.addSigners(selectedId, signersPayload)
      }
      await ecpApi.sendForSigning(selectedId)
      const latest = await ecpApi.getDocumentDetails(selectedId)
      await mutateDetails(latest, false)
      toast.success(latest?.status === 'PENDING_SIGNATURE' ? 'Отправлено на подпись' : 'Маршрутизировано')
      setIsEditing(false)
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка отправки')
    }
  }

  const onSignAndSend = async () => {
    if (!selectedId) return
    const ok = await isNcaLayerAvailable()
    if (!ok) { toast.error('Подключите NCALayer'); return }
    try {
      if (!selectedSignerId || typeof selectedSignerId !== 'number') {
        toast.error('Сначала выберите подписанта')
        return
      }

      const signer = findCounterpartyById(selectedSignerId)
      const taxId = signer?.iin_bin?.trim()
      if (!taxId) {
        toast.error('У выбранного подписанта отсутствует ИИН/БИН')
        return
      }

      const signersPayload: any[] = []
      if (selectedCounterpartyId) {
        const cp = findCounterpartyById(selectedCounterpartyId)
        if (!cp?.user_id) {
          toast.error('Контрагент не привязан к пользователю — не появится во входящих')
        }
        signersPayload.push({ counterparty_id: selectedCounterpartyId, role: 'SIGNER', stage_no: 1 })
      }

      const method = await detectSignatureMethod()
      const init = await ecpApi.signInitiate(selectedId, method, details?.status === 'DRAFT' ? { counterparty_id: selectedSignerId } : undefined)
      const { operation_id, challenge } = init
      const signature = method === 'SIGN_XML' ? await signXmlFromBase64(challenge) : await signChallengeBase64(challenge)

      let verifyOk = false
      try {
        const verify = await ecpApi.signVerify(selectedId, { operation_id, cms: signature, tax_id: taxId })
        verifyOk = !!verify?.valid
        if (!verifyOk) {
          toast.error('Ошибка проверки подписи')
        }
      } catch (err: any) {
        toast.error(err?.message || 'Ошибка проверки подписи')
        verifyOk = false
      }
      if (!verifyOk) {
        try { await signingApi.rollbackInitiate(selectedId, { counterparty_id: selectedSignerId, operation_id }) } catch {}
        return
      }

      


      if (signersPayload.length > 0) {
        await ecpApi.addSigners(selectedId, signersPayload)
      }
      await ecpApi.sendForSigning(selectedId)

      const d = await ecpApi.getDocumentDetails(selectedId)
      await mutateDetails(d, false)
      toast.success('Подписано и отправлено')
      setIsEditing(false)
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось подписать')
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Документы — Черновики <span style={{ color: '#888', fontWeight: 400 }}>Всего: {total}</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', margin: '12px 0 16px 0' }}>
          <div style={{ flex: 1 }}>
            <Input
              value={queryDraft}
              onChange={(e) => setQueryDraft(e.target.value)}
              placeholder={'Поиск'}
              onKeyDown={(e: any) => { if (e.key === 'Enter') setQuery(queryDraft) }}
            />
          </div>
          <Button onClick={() => setQuery(queryDraft)} title="Искать">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Button>
          {query && (
            <Button variant="secondary" onClick={() => { setQuery(''); setQueryDraft('') }} title="Очистить">Очистить</Button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isLoading && <div>Загрузка…</div>}
            {error && <div>Ошибка загрузки</div>}
            {items.map((doc) => (
              <div key={doc.id} onClick={() => setSelectedId(doc.id)} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ background: '#2563eb', color: '#fff', padding: '4px 10px', fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Черновик</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmArchiveId(doc.id) }}
                      title="Архивировать"
                      style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: 4, borderRadius: 6, cursor: 'pointer' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="4" />
                        <path d="M5 8h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8" />
                        <path d="M10 12h4v4h-4z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(doc.id) }}
                      title="В корзину"
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
                  </div>
                </div>
                <div style={{ padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{doc.title}</div>
                  </div>
                  <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Дата создания: {formatAt(doc.created_at)} · Подписанты: {doc.signers_count}</div>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 12 }}>
                      {(details.signers || []).map((s: any, idx: number) => {
                        const statusColor = s.status === 'SIGNED' ? '#22c55e' : s.status === 'REQUESTED' || s.status === 'PENDING' ? '#2563eb' : '#6b7280'
                        const statusLabel = s.status ? (s.status === 'SIGNED' ? 'Подписан' : s.status === 'REQUESTED' || s.status === 'PENDING' ? 'На рассмотрении' : s.status) : 'Не отправлен'
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
                    {/* Панель действий под подписантами — для черновиков */}
                  </div>
                  <div>
                    {/* История справа */}
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>История</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, maxHeight: 420, overflow: 'auto', paddingRight: 8 }}>
                        {((details.log || []).filter((l: any) => {
                          const codeExcluded = ['SIGN_OPERATION_CREATED', 'SIGN_VERIFY_SUCCESS', 'SIGN_VERIFY_FAILED', 'SIGN_INIT_ROLLBACK'].includes(l.event_code)
                          const labelStr = String(l.label || '')
                          const labelExcluded = /версия/i.test(labelStr) && /qr/i.test(labelStr)
                          return !(codeExcluded || labelExcluded)
                        })).map((l: any, i: number, arr: any[]) => (
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
                              const displayLabel = (new Set(['DOCUMENT_SENT_FOR_SIGNATURE', 'DOCUMENT_ROUTED']).has(String(l.event_code)))
                                ? eventLabel(l.event_code)
                                : ((l.label && !/^[A-Z_]+$/.test(String(l.label))) ? l.label : eventLabel(l.event_code))
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
                    {/* Файлы под историей */}
                    <div style={{ marginTop: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Файлы:</div>
                      {(details.files || []).length === 0 ? (
                        <div style={{ color: '#999', fontSize: 13 }}>Нет файлов</div>
                      ) : (
                        (details.files || []).map((f: any, i: number) => {
                          const rawId = f.storage_object_id ?? f.object_id ?? f.document_file_id
                          const fileId = typeof rawId === 'string' ? parseInt(rawId, 10) : rawId
                          const disabled = !(typeof fileId === 'number' && isFinite(fileId) && fileId > 0)
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                              <span style={{ fontSize: 14 }}>{f.file_name}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button
                                  onClick={async () => {
                                    try {
                                      if (disabled) { toast.error('Файл недоступен для просмотра'); return }
                                      setPreviewName(f.file_name || null)
                                      setPreviewError(null)
                                      setPreviewUrl(null)
                                      setIsPreviewLoading(true)
                                      const token = authService.ensureToken()
                                      const res = await fetch(`${API_URL}/storage/${fileId}/download`, { headers: { Authorization: `Bearer ${token}` } })
                                      if (!res.ok) throw new Error('Ошибка загрузки файла')
                                      const blob = await res.blob()
                                      const url = URL.createObjectURL(blob)
                                      setPreviewUrl(url)
                                      openPreview()
                                    } catch (e: any) {
                                      setPreviewError(e?.message || 'Не удалось открыть файл')
                                    } finally {
                                      setIsPreviewLoading(false)
                                    }
                                  }}
                                  style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 8, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: disabled ? 0.6 : 1 }}
                                  title="Посмотреть"
                                >
                                  <Image src="/assets/ecp/document-file/see.svg" alt="see" width={18} height={18} />
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      const token = authService.ensureToken()
                                      const res = await fetch(`${API_URL}/storage/${fileId}/download`, {
                                        headers: { Authorization: `Bearer ${token}` },
                                      })
                                      if (!res.ok) throw new Error('Ошибка запроса на скачивание')
                                      const blob = await res.blob()
                                      const url = URL.createObjectURL(blob)
                                      const a = document.createElement('a')
                                      a.href = url
                                      a.download = f.file_name || 'file'
                                      document.body.appendChild(a)
                                      a.click()
                                      a.remove()
                                      URL.revokeObjectURL(url)
                                    } catch (e: any) {
                                      toast.error(e?.message || 'Не удалось скачать файл')
                                    }
                                  }}
                                  style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 8, borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: disabled ? 0.6 : 1 }}
                                  title="Скачать"
                                >
                                  <Image src="/assets/ecp/document-file/download.svg" alt="download" width={18} height={18} />
                                </button>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>

                {!isEditing ? (
                  <div>
                    <button onClick={() => setIsEditing(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 10 }}>Продолжить редактирование</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div>
                      <div style={{ marginBottom: 6, fontWeight: 600 }}>Подписант</div>
                      <select value={selectedSignerId} onChange={(e) => setSelectedSignerId(e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                        <option value="">Не выбран</option>
                        {signatories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                      </select>
                    </div>
                    <div>
                      <div style={{ marginBottom: 6, fontWeight: 600 }}>Контрагент</div>
                      <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={'Поиск контрагента'} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                      {selectedCounterparty && (
                        <div style={{ marginTop: 8, marginBottom: 8 }}>
                          <span style={{ background: '#eef2ff', border: '1px solid #e5e7eb', borderRadius: 9999, padding: '6px 10px' }}>
                            Выбран: {`${selectedCounterparty.name} · ${selectedCounterparty.iin_bin || ''}`}
                          </span>
                          <button onClick={() => setSelectedCounterpartyId(null)} style={{ marginLeft: 8, background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '6px 10px', borderRadius: 8 }}>Сбросить</button>
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, marginTop: 8, maxHeight: 180, overflow: 'auto' }}>
                        {searchResults.map((c) => (
                          <button key={c.id} onClick={() => setSelectedCounterpartyId(c.id)} style={{ textAlign: 'left', background: selectedCounterpartyId === c.id ? '#eff6ff' : '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8 }}>
                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: '#666' }}>{c.iin_bin}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={onSendWithoutSign} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 10 }}>Отправить</button>
                      <button onClick={onSignAndSend} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 10 }}>Подписать и отправить</button>
                      <button onClick={() => setIsEditing(false)} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '10px 14px', borderRadius: 10 }}>Отмена</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#666' }}>Выберите документ слева</div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmArchiveId !== null}
        onClose={() => setConfirmArchiveId(null)}
        title={"Переместить документ в архив?"}
        message={"Вы уверены, что хотите переместить документ в архив?"}
        confirmText={"В архив"}
        confirmVariant={'primary'}
        loading={isConfirmLoading}
        onConfirm={async () => {
          if (confirmArchiveId == null) return
          try {
            setIsConfirmLoading(true)
            await ecpApi.archiveDocument(confirmArchiveId)
            toast.success('Перемещён в архив')
            setConfirmArchiveId(null)
            window.location.reload()
          } catch (e: any) {
            toast.error(e?.message || 'Не удалось переместить')
          } finally {
            setIsConfirmLoading(false)
          }
        }}
      />

      <Modal isOpen={isPreviewOpen} onClose={() => { if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) } closePreview() }} title={previewName || 'Просмотр файла'} closeButton>
        {isPreviewLoading ? (
          <div style={{ padding: 12 }}>Загрузка файла…</div>
        ) : previewError ? (
          <div style={{ padding: 12, color: '#ef4444' }}>{previewError}</div>
        ) : previewUrl ? (
          <iframe src={previewUrl} style={{ width: 820, height: 620, border: 'none', borderRadius: 8 }} />
        ) : (
          <div style={{ padding: 12, color: '#666' }}>Файл отсутствует</div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title={"Переместить документ в корзину?"}
        message={"Документ будет перемещён в корзину"}
        confirmText={"В корзину"}
        confirmVariant={'danger'}
        loading={isConfirmLoading}
        onConfirm={async () => {
          if (confirmDeleteId == null) return
          try {
            setIsConfirmLoading(true)
            await ecpApi.removeDocument(confirmDeleteId)
            toast.success('Перемещён в корзину')
            setConfirmDeleteId(null)
            window.location.reload()
          } catch (e: any) {
            toast.error(e?.message || 'Не удалось переместить')
          } finally {
            setIsConfirmLoading(false)
          }
        }}
      />
    </div>
  )
}
