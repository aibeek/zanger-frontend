'use client'

import React from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { useTranslations } from 'next-intl'
import { ecpApi } from '@/shared/api'
import { API_URL } from '@/shared/config'
import { authService } from '@/features/auth'
import { useLoginStore } from '@/features/auth'
import { signChallengeBase64, isNcaLayerAvailable, signXmlFromBase64, detectSignatureMethod } from '@/shared/lib/ncalayer'
import { toast } from 'react-hot-toast'
import { Input, Button } from '@/shared/ui-kit'
import { ConfirmModal } from '@/shared/ui-kit'
import { Modal, useModal } from '@/shared/ui-kit'

type ListItem = {
  id: number
  title: string
  status: string
  created_at: string
  signers_count: number
  description?: string
  created_by?: number
  is_new?: boolean
  can_sign?: boolean
  is_author?: boolean
}

const ALLOWED = new Set(['ROUTED', 'PENDING_SIGNATURE', 'PARTIALLY_SIGNED', 'WAITING_CREATOR_SIGNATURE'])

const fetchIncoming = async (page: number, limit: number, q?: string, userId?: number | null) => {
  const [inboxRes, ownerRes] = await Promise.all([
    ecpApi.listDocuments({ inbox: true, outbox: false, page: 1, limit: 100, q }),
    ecpApi.listDocuments({ inbox: false, outbox: true, status: 'WAITING_CREATOR_SIGNATURE', page: 1, limit: 100, q }),
  ])
  const inboxItems: ListItem[] = Array.isArray(inboxRes?.data) ? inboxRes.data : Array.isArray(inboxRes) ? inboxRes : []
  const ownerItems: ListItem[] = Array.isArray(ownerRes?.data) ? ownerRes.data : Array.isArray(ownerRes) ? ownerRes : []
  const map = new Map<number, ListItem>()
  for (const it of [...inboxItems, ...ownerItems]) { map.set(it.id, it) }
  let merged: ListItem[] = Array.from(map.values())
  const statusSet = new Set(['ROUTED', 'PENDING_SIGNATURE', 'PARTIALLY_SIGNED', 'WAITING_CREATOR_SIGNATURE', 'SIGNED'])
  merged = merged.filter((d) => statusSet.has(String(d.status)))
  const start = Math.max(0, (page - 1) * limit)
  const paged = merged.slice(start, start + limit)
  const pagination = { page, limit, total: merged.length }
  return { items: paged, pagination }
}

export default function EcpIncomingPage() {
  const t = useTranslations('ecp.sidebar')
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(5)
  const [query, setQuery] = React.useState('')
  const [queryDraft, setQueryDraft] = React.useState('')
  const { personalData, getPersonalDataByToken } = useLoginStore()
  const { data, error, isLoading, mutate: mutateList } = useSWR(
    ['ecp-incoming', page, limit, query, personalData?.id || null],
    ([, p, l, q, uid]) => fetchIncoming(p as number, l as number, q as string, (uid as number | null)),
    { revalidateOnFocus: true, revalidateOnReconnect: true, refreshInterval: 15000, revalidateIfStale: true }
  )
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const { data: details, mutate: mutateDetails } = useSWR(
    selectedId ? ['ecp-doc-details', selectedId] : null,
    ([, id]) => ecpApi.getDocumentDetails(id as number),
    { revalidateOnFocus: false, revalidateOnReconnect: false, refreshInterval: 0, revalidateIfStale: false }
  )
  const [declineOpen, setDeclineOpen] = React.useState(false)
  const [declineReason, setDeclineReason] = React.useState('')
  const [isSigning, setIsSigning] = React.useState(false)
  const [signMethod, setSignMethod] = React.useState<'ECP' | 'SMS'>('ECP')
  const [smsCode, setSmsCode] = React.useState('')
  const [smsOperationId, setSmsOperationId] = React.useState<number | null>(null)
  const [smsPhone, setSmsPhone] = React.useState<string | null>(null)
  const [confirmArchiveId, setConfirmArchiveId] = React.useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<number | null>(null)
  const [isConfirmLoading, setIsConfirmLoading] = React.useState(false)
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null)
  const [isPdfLoading, setIsPdfLoading] = React.useState(false)
  const [pdfError, setPdfError] = React.useState<string | null>(null)
  const viewerRef = React.useRef<HTMLDivElement | null>(null)
  const { isOpen: isPreviewOpen, open: openPreview, close: closePreview } = useModal()
  React.useEffect(() => {
    const handler = () => { mutateList() }
    window.addEventListener('ecp:revalidate-counters', handler)
    return () => { window.removeEventListener('ecp:revalidate-counters', handler) }
  }, [mutateList])
  React.useEffect(() => {
    if (!personalData) {
      getPersonalDataByToken()
    }
  }, [personalData, getPersonalDataByToken])
  React.useEffect(() => {
    const f = (details?.files || [])[0] || null
    const rawId = f ? (f.storage_object_id ?? f.object_id ?? f.document_file_id) : null
    const fileId = typeof rawId === 'string' ? parseInt(rawId as any, 10) : rawId
    if (!(typeof fileId === 'number' && isFinite(fileId as any) && (fileId as any) > 0)) {
      setPdfUrl(null)
      setPdfError(null)
      setIsPdfLoading(false)
      return
    }
    let cancelled = false
    let localUrl: string | null = null
    const load = async () => {
      try {
        setIsPdfLoading(true)
        setPdfError(null)
        const token = authService.ensureToken()
        const res = await fetch(`${API_URL}/storage/${fileId}/download`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Ошибка загрузки файла')
        const blob = await res.blob()
        if (cancelled) return
        localUrl = URL.createObjectURL(blob)
        setPdfUrl(localUrl)
      } catch (e: any) {
        if (cancelled) return
        setPdfError(e?.message || 'Не удалось загрузить документ')
        setPdfUrl(null)
      } finally {
        if (!cancelled) setIsPdfLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
      if (localUrl) URL.revokeObjectURL(localUrl)
    }
  }, [details?.files, selectedId])
  

  const items: ListItem[] = data?.items || []
  const userId = typeof personalData?.id === 'number' ? personalData.id : null
  const filtered = React.useMemo(() => {
    const inclForNonAuthor = new Set(['ROUTED', 'PENDING_SIGNATURE', 'PARTIALLY_SIGNED', 'WAITING_CREATOR_SIGNATURE', 'SIGNED'])
    return items.filter((d: any) => {
      const status = String(d.status)
      const isAuthor = !!d?.is_author || (typeof d?.created_by === 'number' && userId && d.created_by === userId)
      if (isAuthor) {
        return (d?.can_sign === true) || (status === 'WAITING_CREATOR_SIGNATURE' || status === 'PARTIALLY_SIGNED')
      }
      return inclForNonAuthor.has(status)
    })
  }, [items, userId])
  const total = (data?.pagination?.total as number) || filtered.length
  const pages = Math.max(1, Math.ceil(total / (((data?.pagination?.limit as number) || limit))))

  const color = (s: string) => {
    if (s === 'SIGNED') return '#22c55e'
    if (s === 'PARTIALLY_SIGNED') return '#f59e0b'
    if (s === 'ROUTED' || s === 'PENDING_SIGNATURE' || s === 'WAITING_CREATOR_SIGNATURE') return '#2563eb'
    if (s === 'DECLINED') return '#ef4444'
    if (s === 'CANCELLED') return '#6b7280'
    return '#6b7280'
  }

  const canSign = !!(details && Array.isArray(details.signers) && details.signers.some((s: any) => s.can_sign))

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

  const truncate = (str: string, max = 28) => {
    const s = String(str)
    return s.length > max ? s.slice(0, max - 1) + '…' : s
  }

  const onSign = async () => {
    if (!selectedId) return

    // SMS подписание
    if (signMethod === 'SMS') {
      try {
        setIsSigning(true)
        const init = await ecpApi.signInitiate(selectedId, 'SIGN_SMS')
        setSmsOperationId(init.operation_id)
        setSmsPhone(init.phone || null)
        toast.success(`SMS код отправлен на ${init.phone}`)
      } catch (e: any) {
        toast.error(e?.message || 'Не удалось отправить SMS')
      } finally {
        setIsSigning(false)
      }
      return
    }

    // ЭЦП подписание
    const ok = await isNcaLayerAvailable()
    if (!ok) { toast.error('Подключите NCALayer'); return }
    try {
      setIsSigning(true)
      const method = await detectSignatureMethod()
      const init = await ecpApi.signInitiate(selectedId, method)
      const cms = method === 'SIGN_XML' ? await signXmlFromBase64(init.challenge) : await signChallengeBase64(init.challenge)
      const mySigner = (details?.signers || []).find((s: any) => s?.can_sign || s?.is_me)
      const taxId = String(mySigner?.iin_bin || '').trim()
      if (!taxId) {
        toast.error('ИИН/БИН не найден для подписанта')
        setIsSigning(false)
        return
      }
      const verifyRes = await ecpApi.signVerify(selectedId, { operation_id: init.operation_id, cms, tax_id: taxId })
      if (!verifyRes?.valid || verifyRes?.status !== 'VERIFIED') {
        toast.error('Ошибка проверки подписи')
        setIsSigning(false)
        return
      }
      const d = await ecpApi.getDocumentDetails(selectedId)
      await mutateDetails(d, false)
      await mutateList()
      toast.success('Подписано')
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось подписать')
    } finally {
      setIsSigning(false)
    }
  }

  const onVerifySms = async () => {
    const code = smsCode.replace(/\D/g, '').slice(0, 4)
    if (!selectedId || !smsOperationId || !code || code.length !== 4) {
      toast.error('Введите 4-значный код')
      return
    }
    try {
      setIsSigning(true)
      const verifyRes = await ecpApi.signVerifySms(selectedId, { operation_id: smsOperationId, code: parseInt(code) })
      if (!verifyRes?.valid || verifyRes?.status !== 'VERIFIED') {
        toast.error('Неверный код')
        setIsSigning(false)
        return
      }
      const completeRes = await ecpApi.signCompleteSms(selectedId, { operation_id: smsOperationId })
      if (completeRes?.success) {
        const d = await ecpApi.getDocumentDetails(selectedId)
        await mutateDetails(d, false)
        await mutateList()
        setSmsCode('')
        setSmsOperationId(null)
        setSmsPhone(null)
        toast.success('Документ успешно подписан!', {
          duration: 5000,
          icon: '✅',
          style: {
            background: '#22c55e',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
          },
        })
      }
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Документы — Входящие <span style={{ color: '#888', fontWeight: 400 }}>Всего: {total}</span></div>
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

        <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isLoading && <div>Загрузка…</div>}
            {error && <div>Ошибка загрузки</div>}
            {filtered.map((doc) => (
              <div
                key={doc.id}
                onClick={async () => {
                  try {
                    if (doc.is_new) {
                      await ecpApi.viewDocument(doc.id)
                      await mutateList()
                      window.dispatchEvent(new Event('ecp:revalidate-counters'))
                    }
                  } finally {
                    setSelectedId(doc.id)
                  }
                }}
                style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}
              >
                <div style={{ background: color(doc.status), color: '#fff', padding: '4px 10px', fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{
                    doc.status === 'SIGNED' ? 'Подписан' :
                    doc.status === 'PARTIALLY_SIGNED' ? 'Частично подписан' :
                    (doc.status === 'PENDING_SIGNATURE' || doc.status === 'WAITING_CREATOR_SIGNATURE') ? 'На подписи' :
                    doc.status === 'DECLINED' ? 'Отклонён' :
                    doc.status === 'CANCELLED' ? 'Отменён' :
                    'Получен'
                  }</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {doc.is_new ? (
                      <span style={{ background: '#ef4444', color: '#fff', borderRadius: 9999, padding: '2px 8px', fontSize: 12, fontWeight: 800 }}>New</span>
                    ) : null}
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
                    <button title="Удалить" onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(doc.id) }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: 4, borderRadius: 6, cursor: 'pointer' }}>
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
                  <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Дата получения: {formatAt(doc.created_at)}{doc.description ? ` · ${String(doc.description)}` : ''}</div>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, maxWidth: 520, alignSelf: 'start' }}>
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr',
                          gap: 10,
                          ...(((details.signers || []).length > 2)
                            ? { maxHeight: 220, overflow: 'auto', paddingRight: 8 }
                            : {})
                        }}
                      >
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
                    </div>
                    <div ref={viewerRef} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 10 }}>
                      {isPdfLoading ? (
                        <div style={{ padding: 12 }}>Загрузка документа…</div>
                      ) : pdfError ? (
                        <div style={{ padding: 12, color: '#ef4444' }}>{pdfError}</div>
                      ) : pdfUrl ? (
                        <iframe src={pdfUrl} style={{ width: 430, height: 400, border: 'none', borderRadius: 8 }} />
                      ) : (
                        <div style={{ padding: 12, color: '#666' }}>Документ отсутствует</div>
                      )}
                    </div>
                  </div>
                  <div>
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
                    <div style={{ marginTop: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{(details.files || [])[0]?.file_name || 'Файл отсутствует'}</span>
                      {(() => {
                        const f = (details.files || [])[0] || null
                        const rawId = f ? (f.storage_object_id ?? f.object_id ?? f.document_file_id) : null
                        const fileId = typeof rawId === 'string' ? parseInt(rawId as any, 10) : rawId
                        const disabled = !(typeof fileId === 'number' && isFinite(fileId as any) && (fileId as any) > 0)
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button onClick={() => { openPreview() }} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 8, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Посмотреть">
                              <Image src="/assets/ecp/document-file/see.svg" alt="see" width={18} height={18} />
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
                              style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 8, borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: disabled ? 0.6 : 1 }}
                              title="Скачать"
                            >
                              <Image src="/assets/ecp/document-file/download.svg" alt="download" width={18} height={18} />
                            </button>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
                
                {canSign && (
                  !declineOpen ? (
                  <div style={{ marginTop: 12 }}>
                    {!smsOperationId ? (
                      <>
                        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Способ подписания:</div>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <button
                              onClick={() => setSignMethod('ECP')}
                              style={{
                                flex: 1,
                                background: signMethod === 'ECP' ? '#2563eb' : '#f3f4f6',
                                color: signMethod === 'ECP' ? '#fff' : '#333',
                                border: '1px solid #e5e7eb',
                                padding: '10px 16px',
                                borderRadius: 8,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              ЭЦП (NCALayer)
                            </button>
                            <button
                              onClick={() => setSignMethod('SMS')}
                              style={{
                                flex: 1,
                                background: signMethod === 'SMS' ? '#2563eb' : '#f3f4f6',
                                color: signMethod === 'SMS' ? '#fff' : '#333',
                                border: '1px solid #e5e7eb',
                                padding: '10px 16px',
                                borderRadius: 8,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              SMS
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={onSign} disabled={isSigning} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: 12, fontWeight: 700, flex: 1 }}>{isSigning ? 'Подписание…' : 'Подписать'}</button>
                          <button onClick={() => setDeclineOpen(true)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: 12, fontWeight: 700 }}>Отклонить</button>
                        </div>
                      </>
                    ) : (
                      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                          Введите код из SMS, отправленный на {smsPhone}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                          {[0, 1, 2, 3].map((i) => (
                            <Input
                              key={i}
                              variant="otp"
                              value={smsCode[i] || ''}
                              autoFocus={i === 0 && smsCode.length === 0}
                              onChange={(e) => {
                                const inputVal = e.target.value
                                const digits = inputVal.replace(/\D/g, '')
                                
                                if (digits.length > 1) {
                                  // Если вставлен весь код сразу
                                  const code = digits.slice(0, 4)
                                  setSmsCode(code)
                                  if (code.length === 4) {
                                    const lastInput = e.target.parentElement?.parentElement?.querySelector(`input:nth-of-type(4)`) as HTMLInputElement
                                    lastInput?.focus()
                                  } else if (code.length > 0) {
                                    const nextInput = e.target.parentElement?.parentElement?.querySelector(`input:nth-of-type(${code.length + 1})`) as HTMLInputElement
                                    nextInput?.focus()
                                  }
                                } else if (digits.length === 1) {
                                  // Одна цифра - берем только последний символ
                                  const newCode = [...smsCode.split('')]
                                  // Заполняем массив до нужной длины
                                  while (newCode.length < 4) {
                                    newCode.push('')
                                  }
                                  newCode[i] = digits
                                  const code = newCode.join('').slice(0, 4)
                                  setSmsCode(code)
                                  if (i < 3) {
                                    // Переход к следующей ячейке
                                    setTimeout(() => {
                                      const nextInput = e.target.parentElement?.parentElement?.querySelector(`input:nth-of-type(${i + 2})`) as HTMLInputElement
                                      nextInput?.focus()
                                    }, 0)
                                  }
                                } else {
                                  // Очистка
                                  const newCode = [...smsCode.split('')]
                                  while (newCode.length < 4) {
                                    newCode.push('')
                                  }
                                  newCode[i] = ''
                                  setSmsCode(newCode.join(''))
                                }
                              }}
                              onKeyDown={(e: any) => {
                                if (e.key === 'Backspace') {
                                  if (smsCode[i]) {
                                    // Если в ячейке есть значение - очищаем её
                                    const newCode = smsCode.split('')
                                    newCode[i] = ''
                                    setSmsCode(newCode.join(''))
                                  } else if (i > 0) {
                                    // Если ячейка пустая - переходим к предыдущей и очищаем её
                                    const newCode = smsCode.split('')
                                    newCode[i - 1] = ''
                                    setSmsCode(newCode.join(''))
                                    const prevInput = e.target.parentElement?.parentElement?.querySelector(`input:nth-of-type(${i})`) as HTMLInputElement
                                    prevInput?.focus()
                                  }
                                } else if (e.key === 'ArrowLeft' && i > 0) {
                                  e.preventDefault()
                                  const prevInput = e.target.parentElement?.parentElement?.querySelector(`input:nth-of-type(${i})`) as HTMLInputElement
                                  prevInput?.focus()
                                } else if (e.key === 'ArrowRight' && i < 3) {
                                  e.preventDefault()
                                  const nextInput = e.target.parentElement?.parentElement?.querySelector(`input:nth-of-type(${i + 2})`) as HTMLInputElement
                                  nextInput?.focus()
                                }
                              }}
                              onPaste={(e: any) => {
                                e.preventDefault()
                                const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
                                if (pasted) {
                                  setSmsCode(pasted)
                                  if (pasted.length === 4) {
                                    const lastInput = e.target.parentElement?.parentElement?.querySelector(`input:nth-of-type(4)`) as HTMLInputElement
                                    lastInput?.focus()
                                  } else if (pasted.length > 0) {
                                    const nextInput = e.target.parentElement?.parentElement?.querySelector(`input:nth-of-type(${pasted.length + 1})`) as HTMLInputElement
                                    nextInput?.focus()
                                  }
                                }
                              }}
                              style={{ textAlign: 'center', fontSize: 18, fontWeight: 600 }}
                            />
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={onVerifySms}
                            disabled={isSigning || smsCode.length !== 4}
                            style={{
                              background: smsCode.length === 4 ? '#22c55e' : '#9ca3af',
                              color: '#fff',
                              border: 'none',
                              padding: '12px 18px',
                              borderRadius: 12,
                              fontWeight: 700,
                              flex: 1,
                              cursor: smsCode.length === 4 ? 'pointer' : 'not-allowed',
                            }}
                          >
                            {isSigning ? 'Проверка…' : 'Подтвердить'}
                          </button>
                          <button
                            onClick={() => {
                              setSmsCode('')
                              setSmsOperationId(null)
                              setSmsPhone(null)
                            }}
                            style={{
                              background: '#f3f4f6',
                              color: '#333',
                              border: '1px solid #e5e7eb',
                              padding: '12px 18px',
                              borderRadius: 12,
                              fontWeight: 700,
                            }}
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    )}
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

      <Modal isOpen={isPreviewOpen} onClose={closePreview} title={"Просмотр файла"} closeButton>
        {isPdfLoading ? (
          <div style={{ padding: 12 }}>Загрузка документа…</div>
        ) : pdfError ? (
          <div style={{ padding: 12, color: '#ef4444' }}>{pdfError}</div>
        ) : pdfUrl ? (
          <iframe src={pdfUrl} style={{ width: 820, height: 620, border: 'none', borderRadius: 8 }} />
        ) : (
          <div style={{ padding: 12, color: '#666' }}>Документ отсутствует</div>
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
