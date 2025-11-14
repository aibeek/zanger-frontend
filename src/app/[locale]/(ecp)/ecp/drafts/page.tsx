'use client'

import React from 'react'
import useSWR from 'swr'
import { useTranslations, useLocale } from 'next-intl'
import { ecpApi, counterpartiesApi } from '@/shared/api'
import { API_URL } from '@/shared/config'
import { authService } from '@/features/auth'
import { useLoginStore } from '@/features/auth'
import { signChallengeBase64 } from '@/shared/lib/ncalayer'
import { toast } from 'react-hot-toast'

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

const fetchDrafts = async () => {
  const res: any = await ecpApi.listDocuments({ status: 'DRAFT', outbox: true, inbox: false, page: 1, limit: 50 })
  const items: DocItem[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
  const pagination = res?.pagination || null
  return { items, pagination }
}

export default function EcpDraftsPage() {
  const t = useTranslations('ecp.create')
  const locale = useLocale()
  const { personalData, getPersonalDataByToken } = useLoginStore()

  const { data, error, isLoading } = useSWR('ecp-drafts', fetchDrafts)
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

  const items: DocItem[] = data?.items || []
  const total: number = data?.pagination?.total ?? items.length

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
      let latest = await ecpApi.getDocumentDetails(selectedId)
      if (latest?.status === 'ROUTED') {
        await ecpApi.sendForSigning(selectedId)
        latest = await ecpApi.getDocumentDetails(selectedId)
      }
      await mutateDetails(latest, false)
      toast.success(latest?.status === 'PENDING_SIGNATURE' ? 'Отправлено на подпись' : 'Маршрутизировано')
      setIsEditing(false)
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка отправки')
    }
  }

  const onSignAndSend = async () => {
    if (!selectedId) return
    try {
      const signersPayload: any[] = []
      const chosenCounterparty2 = findCounterpartyById(selectedCounterpartyId)
      if (selectedCounterpartyId && !chosenCounterparty2?.user_id) {
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
      let latest = await ecpApi.getDocumentDetails(selectedId)
      if (latest?.status === 'ROUTED') {
        await ecpApi.sendForSigning(selectedId)
        latest = await ecpApi.getDocumentDetails(selectedId)
      }
      const init = await ecpApi.signInitiate(selectedId, 'SIGN_CMS')
      const cmsBase64 = await signChallengeBase64(init.challenge)
      const verifyRes = await ecpApi.signVerify(selectedId, { operation_id: init.operation_id, cms: cmsBase64 })
      if (!verifyRes?.valid || verifyRes?.status !== 'VERIFIED') {
        toast.error('Ошибка проверки подписи')
        return
      }
      await ecpApi.signComplete(selectedId, { operation_id: init.operation_id, cms: cmsBase64 })
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Документы — Черновики <span style={{ color: '#888', fontWeight: 400 }}>Всего: {total}</span></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder={'Поиск'} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', width: 260 }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isLoading && <div>Загрузка…</div>}
            {error && <div>Ошибка загрузки</div>}
            {items.map((doc) => (
              <div key={doc.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: '#2563eb', color: '#fff', padding: '6px 10px', fontWeight: 600 }}>Черновик</div>
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{doc.title}</div>
                    <button onClick={() => setSelectedId(doc.id)} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '6px 10px', borderRadius: 8 }}>Открыть</button>
                  </div>
                  <div style={{ color: '#666', fontSize: 13 }}>Дата создания: {new Date(doc.created_at).toLocaleDateString()} · Подписанты: {doc.signers_count}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
            {selectedId && details ? (
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{details.title}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 12 }}>
                  {(details.signers || []).map((s: any, idx: number) => (
                    <div key={idx} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.fio || 'Подписант'}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>Стадия {s.stage_no || 1}</div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280' }}>{s.status || 'Не отправлен'}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {!isEditing ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => setIsEditing(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 10 }}>Продолжить редактирование</button>
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 10 }}>
                      {(details.files || []).map((f: any, i: number) => (
                        <span key={i} style={{ marginRight: 12 }}>
                          {f.file_name}
                          {f.storage_object_id ? (
                            <button
                              onClick={async () => {
                                try {
                                  const token = authService.ensureToken()
                                  const res = await fetch(`${API_URL}/storage/${f.storage_object_id}/download`, {
                                    headers: { Authorization: `Bearer ${token}` },
                                  })
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
                              style={{ marginLeft: 8, background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '4px 8px', borderRadius: 8 }}
                            >Скачать</button>
                          ) : null}
                        </span>
                      ))}
                    </div>
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
    </div>
  )
}