'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { Button, Input, Loader, ConfirmModal } from '@/shared/ui-kit'
import s from './page.module.scss'
import { toast } from 'react-hot-toast'
import { ecpApi, EsdcaDocumentDetails, EsdcaDocumentType, counterpartiesApi, signingApi } from '@/shared/api'
import { signChallengeBase64, isNcaLayerAvailable, signXmlFromBase64, detectSignatureMethod } from '@/shared/lib/ncalayer'
import { useLoginStore } from '@/features/auth'
import { API_URL } from '@/shared/config'
import { authService } from '@/features/auth'

export default function EcpCreateDocumentPage() {
  const t = useTranslations('ecp.create')
  const locale = useLocale()

  const [signer, setSigner] = React.useState<string>('')
  const [counterparty, setCounterparty] = React.useState<string>('')
  const [file, setFile] = React.useState<File | null>(null)
  const [name, setName] = React.useState('')
  const [docNumber, setDocNumber] = React.useState('')
  const [isCreated, setIsCreated] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [documentId, setDocumentId] = React.useState<number | null>(null)
  const [details, setDetails] = React.useState<EsdcaDocumentDetails | null>(null)
  const [documentTypes, setDocumentTypes] = React.useState<EsdcaDocumentType[]>([])
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = React.useState<number | null>(null)

  // Подписанты и поиск контрагентов
  type CounterpartyItem = { id: number; name: string; iin_bin?: string; type?: string; email?: string; phone?: string; is_verified?: boolean }
  const { personalData, getPersonalDataByToken } = useLoginStore()
  const [signatories, setSignatories] = React.useState<CounterpartyItem[]>([])
  const [loadingSignatories, setLoadingSignatories] = React.useState<boolean>(false)
  const [signatoriesError, setSignatoriesError] = React.useState<string | null>(null)
  const [selectedSignerId, setSelectedSignerId] = React.useState<number | ''>('')
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [searchResults, setSearchResults] = React.useState<CounterpartyItem[]>([])
  const [loadingSearch, setLoadingSearch] = React.useState<boolean>(false)
  const [selectedCounterpartyId, setSelectedCounterpartyId] = React.useState<number | null>(null)
  const [selectedCounterparties, setSelectedCounterparties] = React.useState<CounterpartyItem[]>([])
  const [confirmSendOpen, setConfirmSendOpen] = React.useState(false)
  const [confirmSignOpen, setConfirmSignOpen] = React.useState(false)
  const [confirmLoading, setConfirmLoading] = React.useState(false)
  

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      const f = files[0]
      const isPdf = (f.type && f.type.toLowerCase() === 'application/pdf') || /\.pdf$/i.test(f.name)
      if (!isPdf) {
        toast.error('Разрешён только PDF')
        e.target.value = ''
        return
      }
      setFile(f)
    }
  }

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0]
      const isPdf = (f.type && f.type.toLowerCase() === 'application/pdf') || /\.pdf$/i.test(f.name)
      if (!isPdf) {
        toast.error('Разрешён только PDF')
        return
      }
      setFile(f)
    }
  }

  // Удалено: обработчик черновика
  const proceedSendWithoutSign = async () => {
    if (!documentId) {
      toast.error(t('createFirst'))
      return
    }
    try {
      // 1) Сформировать список подписантов: контрагенты (stage 1) + инициатор (stage 2, последним)
      const signersPayload: any[] = []
      selectedCounterparties.forEach((cp) => {
        signersPayload.push({ counterparty_id: cp.id, role: 'SIGNER', stage_no: 1 })
      })
      // Подписант — стадия 2 (последним)
      if (selectedSignerId && typeof selectedSignerId === 'number') {
        signersPayload.push({ counterparty_id: selectedSignerId, role: 'SIGNER', stage_no: 2 })
      }

      // 2) Добавить подписантов через add-signers
      if (signersPayload.length > 0) {
        await ecpApi.addSigners(documentId, signersPayload)
      }

      // 3) Вызвать send: если DRAFT → переведёт в ROUTED (semantics sign_after_all=true)
      await ecpApi.sendForSigning(documentId)
      const latest = await ecpApi.getDocumentDetails(documentId)
      setDetails(latest)
      toast.success(latest?.status === 'ROUTED' ? (locale === 'kz' ? 'Маршрутизировано' : 'Маршрутизировано') : t('sentWithoutSign'))
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка отправки')
    }
  }
  const proceedSignAndSend = async () => {
    if (!documentId) {
      toast.error(t('createFirst'))
      return
    }
    const ok = await isNcaLayerAvailable()
    if (!ok) { toast.error(locale === 'kz' ? 'NCALayer қосыңыз' : 'Подключите NCALayer'); return }
    try {
      if (!selectedSignerId || typeof selectedSignerId !== 'number') {
        toast.error(locale === 'kz' ? 'Алдымен қол қоюшыны таңдаңыз(Тіркелген статустан таңдаңыз)' : 'Сначала выберите подписанта(Выберите из вашего статуса)')
        return
      }

      const signerItem = signatories.find((s) => s.id === selectedSignerId)
      const taxId = signerItem?.iin_bin?.trim()
      if (!taxId) {
        toast.error(locale === 'kz' ? 'Қол қоюшыда ИИН/БИН жоқ' : 'У выбранного подписанта отсутствует ИИН/БИН')
        return
      }

      const signersPayload: any[] = []
      selectedCounterparties.forEach((cp) => {
        signersPayload.push({ counterparty_id: cp.id, role: 'SIGNER', stage_no: 1 })
      })

      const method = await detectSignatureMethod()
      const init = await ecpApi.signInitiate(documentId, method, details?.status === 'DRAFT' ? { counterparty_id: selectedSignerId } : undefined)
      const { operation_id, challenge } = init
      const signature = method === 'SIGN_XML' ? await signXmlFromBase64(challenge) : await signChallengeBase64(challenge)

      let verifyOk = false
      try {
        const verify = await ecpApi.signVerify(documentId, { operation_id, cms: signature, tax_id: taxId })
        verifyOk = !!verify?.valid
        if (!verifyOk) {
          toast.error(locale === 'kz' ? 'Қолтаңбаны тексеру қате' : 'Ошибка проверки подписи')
        }
      } catch (err: any) {
        toast.error(err?.message || (locale === 'kz' ? 'Қолтаңбаны тексеру қате' : 'Ошибка проверки подписи'))
        verifyOk = false
      }
      if (!verifyOk) {
        try { await signingApi.rollbackInitiate(documentId, { counterparty_id: selectedSignerId, operation_id }) } catch {}
        return
      }

      


      if (signersPayload.length > 0) {
        await ecpApi.addSigners(documentId, signersPayload)
      }
      await ecpApi.sendForSigning(documentId)

      const d = await ecpApi.getDocumentDetails(documentId)
      setDetails(d)
      toast.success(t('signedAndSent'))
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось подписать')
    }
  }

  React.useEffect(() => {
  }, [])

  // Убедиться, что персональные данные загружены, чтобы получить userId
  React.useEffect(() => {
    if (!personalData) {
      getPersonalDataByToken().catch(() => {})
    }
  }, [personalData, getPersonalDataByToken])

  

  // Загрузка подписантов по userId
  React.useEffect(() => {
    const userId = personalData?.id
    if (!userId) return

    let mounted = true
    setLoadingSignatories(true)
    setSignatoriesError(null)
    counterpartiesApi
      .getByUserId(userId)
      .then((res: any) => {
        if (!mounted) return
        const normalized: CounterpartyItem[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : []
        setSignatories(normalized)
      })
      .catch((e: any) => {
        const msg = e?.message || 'Не удалось загрузить подписантов'
        setSignatoriesError(msg)
      })
      .finally(() => {
        setLoadingSignatories(false)
      })

    return () => {
      mounted = false
    }
  }, [personalData])

  // Поиск контрагентов (debounce)
  React.useEffect(() => {
    const q = searchQuery.trim()
    if (!q) {
      setSearchResults([])
      return
    }
    setLoadingSearch(true)
    const tId = setTimeout(async () => {
      try {
        const res: any = await counterpartiesApi.search({ query: q })
        const normalized: CounterpartyItem[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : []
        setSearchResults(normalized)
      } catch (e: any) {
        toast.error(e?.message || 'Ошибка поиска контрагентов')
      } finally {
        setLoadingSearch(false)
      }
    }, 350)

    return () => clearTimeout(tId)
  }, [searchQuery])

  const onCreate = async () => {
    // Простая валидация: нужен файл и наименование
    if (!file || !name) {
      toast.error(`${t('upload')}: ${t('dropText').split(',')[0]} · ${t('name')}`)
      return
    }

    try {
      setIsCreating(true)

      // 1) Определить тип документа на основе выбора пользователя (или первый как дефолт)
      const documentTypeId = 1

      // 2) Создать документ (черновик)
      const description = docNumber ? `№${docNumber}` : '—'
      const createRes = await ecpApi.createDocument({
        title: name,
        description,
        amount: null,
        document_type_id: documentTypeId,
        require_sender_signature: false,
      })

      setDocumentId(createRes.id)
      setIsCreated(true)
      toast.success(t('documentCreated'))

      // 3) Загрузить файл как MAIN и привязать к документу
      await ecpApi.uploadMainFile(createRes.id, file)

      // 4) Получить детали и показать справа
      const d = await ecpApi.getDocumentDetails(createRes.id)
      setDetails(d)
    } catch (e: any) {
      const msg = e?.message || 'Ошибка'
      toast.error(`${t('errorOccurred') || 'Ошибка'}: ${msg}`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className={s.page}>
      {/* Left main card (form) */}
      <div className={s.card}>
        {/* Upload */}
        <div className={s.sectionHeader} style={{ marginTop: 16 }}>📎 {t('upload')}</div>
        <div
          className={s.uploadZone}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className={s.uploadIcon}>⬇️</div>
          <div>
            <div>{file ? file.name : t('dropText')}</div>
            <div className={s.formats}>{t('allowedFormats')}</div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>

        <div className={s.grid2}>
          <div>
            <label htmlFor="name" className={s.sectionHeader} style={{ marginBottom: 6 }}>📝 {t('name')}</label>
            <Input
              id="name"
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="number" className={s.sectionHeader} style={{ marginBottom: 6 }}>{t('docNumber')}</label>
            <Input
              id="number"
              placeholder={t('docNumberPlaceholder')}
              value={docNumber}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(e) => setDocNumber(e.target.value.replace(/\D+/g, ''))}
            />
          </div>
        </div>

        

      {!isCreated && (
        <div className={s.actions}>
          <Button onClick={onCreate} disabled={isCreating}>
            {isCreating ? t('creating') : t('createButton')}
          </Button>
        </div>
      )}
      {/* Блоки выбора подписанта, поиск контрагентов и кнопки — только после создания и при статусе DRAFT */}
      {isCreated && details?.status === 'DRAFT' && (
        <>
          {/* Signatories dropdown */}
          <div className={s.sectionHeader} style={{ marginTop: 16 }}>🖋️ Подписанты</div>
          <div className={s.divider} />
          {loadingSignatories ? (
            <div style={{ padding: 8 }}>
              <Loader /> Загрузка...
            </div>
          ) : signatoriesError ? (
            <div style={{ color: 'var(--danger)', padding: 8 }}>{signatoriesError}</div>
          ) : (
            <select
              className={s.selectBox}
              value={selectedSignerId}
              onChange={async (e) => {
                const id = Number(e.target.value)
                setSelectedSignerId(id || '')
                const sItem = signatories.find((s) => s.id === id)
                if (!sItem) return
                setSigner(sItem.name)
                setCounterparty(sItem.name)
              }}
              disabled={signatories.length === 0}
            >
              <option value="" disabled>
                {locale === 'kz' ? 'Подписантты таңдаңыз(Тіркелген статустан таңдаңыз)' : 'Выберите подписанта(Выберите из вашего статуса)'}
              </option>
              {signatories.map((sItem) => (
                <option key={sItem.id} value={sItem.id}>
                  {sItem.name}{sItem.iin_bin ? ` · ${sItem.iin_bin}` : ''}
                </option>
              ))}
            </select>
          )}

          {/* Counterparties search */}
          <div className={s.sectionHeader} style={{ marginTop: 16 }}>🔎 Поиск контрагентов</div>
          <Input
            placeholder="Введите имя или ИИН/БИН"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {selectedCounterparties.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {selectedCounterparties.map((cp) => (
            <div key={cp.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eef2ff', border: '1px solid #e5e7eb', borderRadius: 9999, padding: '6px 10px' }}>
              <span style={{ fontWeight: 600 }}>{cp.name}{cp.iin_bin ? ` · ${cp.iin_bin}` : ''}{cp.is_verified === false ? ' · Не подтверждён' : ''}</span>
              <button
                onClick={() => setSelectedCounterparties(selectedCounterparties.filter((x) => x.id !== cp.id))}
                style={{ background: '#e5e7eb', border: 'none', borderRadius: 8, padding: '4px 8px' }}
              >Сбросить</button>
            </div>
          ))}
            </div>
          )}
          {loadingSearch ? (
            <div style={{ padding: 8 }}>
              <Loader /> Поиск...
            </div>
          ) : searchQuery && (
            <div className={s.searchDropdown} style={{ marginTop: 8, border: '1px solid #e5e7eb', borderRadius: 8 }}>
              {searchResults.length === 0 ? (
                <div className={s.selectPlaceholder} style={{ padding: 8 }}>Ничего не найдено</div>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {searchResults.map((item) => (
                    <li
                      key={item.id}
                      className={s.userRow}
                      style={{ padding: '8px 12px', borderBottom: '1px solid #f5f6fb', cursor: 'pointer' }}
                      onClick={async () => {
                        const exists = selectedCounterparties.some((x) => x.id === item.id)
                        const next = exists ? selectedCounterparties : [...selectedCounterparties, item]
                        setSelectedCounterparties(next)
                        setSigner(item.name)
                        setCounterparty(item.name)
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {item.iin_bin ? `ИИН/БИН: ${item.iin_bin}` : ''}
                        {item.phone ? (item.iin_bin ? ' · ' : '') + `Тел: ${item.phone}` : ''}
                        {item.is_verified === false ? ((item.iin_bin || item.phone) ? ' · ' : '') + 'Не подтверждён' : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Actions after creation (no draft button) */}
          <div className={s.actions}>
            <Button variant="secondary" onClick={() => setConfirmSendOpen(true)}>{t('sendWithoutSign')}</Button>
            <Button onClick={() => setConfirmSignOpen(true)}>{t('signAndSend')}</Button>
          </div>
        </>
      )}
      </div>

      <ConfirmModal
        isOpen={confirmSendOpen}
        title={'Отправить без подписи?'}
        message={(() => {
          const hasUnverified = selectedCounterparties.some((c) => c.is_verified === false)
          let msg = 'Документ будет отправлен адресатам без подписи инициатора.'
          if (hasUnverified) msg += ' Ваш контрагент не зарегистрирован в системе. Он получит уведомление на электронную почту и сможет подписать документ после регистрации на платформе.'
          return msg
        })()}
        confirmText={'Отправить'}
        onClose={() => setConfirmSendOpen(false)}
        confirmVariant={'primary'}
        loading={confirmLoading}
        onConfirm={async () => { try { setConfirmLoading(true); await proceedSendWithoutSign() } finally { setConfirmLoading(false); setConfirmSendOpen(false) } }}
      />

      <ConfirmModal
        isOpen={confirmSignOpen}
        title={'Подписать и отправить?'}
        message={(() => {
          const hasUnverified = selectedCounterparties.some((c) => c.is_verified === false)
          let msg = 'Вы отправляете документ на подписание. Инициатор подпишет документ и он будет направлен адресатам.'
          if (hasUnverified) msg += ' Ваш контрагент не зарегистрирован в системе. Он получит уведомление на электронную почту и сможет подписать документ после регистрации на платформе.'
          return msg
        })()}
        confirmText={'Подписать и отправить'}
        onClose={() => setConfirmSignOpen(false)}
        confirmVariant={'primary'}
        loading={confirmLoading}
        onConfirm={async () => { try { setConfirmLoading(true); await proceedSignAndSend() } finally { setConfirmLoading(false); setConfirmSignOpen(false) } }}
      />

      <div className={s.card}>
        <div className={s.historyTitle}>{t('history')}</div>
        <div className={s.divider} />

        {details ? (
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{details.title}</div>
            {(() => {
              const s = String(details.status)
              const label = (() => {
                if (locale === 'kz') {
                  if (s === 'SIGNED') return 'Қол қойылған'
                  if (s === 'PARTIALLY_SIGNED') return 'Ішінара қол қойылған'
                  if (s === 'PENDING_SIGNATURE') return 'Қол қоюда'
                  if (s === 'ROUTED') return 'Маршрутталды'
                  if (s === 'DRAFT') return 'Жоба'
                  if (s === 'DECLINED') return 'Қабылданбады'
                  if (s === 'CANCELLED') return 'Болдырмау'
                  if (s === 'EXPIRED') return 'Мерзімі өтті'
                  if (s === 'ARCHIVED') return 'Мұрағатталған'
                  if (s === 'WAITING_CREATOR_SIGNATURE') return 'Инициатор қолын күтуде'
                  return s
                } else {
                  if (s === 'SIGNED') return 'Подписан'
                  if (s === 'PARTIALLY_SIGNED') return 'Частично подписан'
                  if (s === 'PENDING_SIGNATURE') return 'На подписи'
                  if (s === 'ROUTED') return 'Маршрутизирован'
                  if (s === 'DRAFT') return 'Черновик'
                  if (s === 'DECLINED') return 'Отклонён'
                  if (s === 'CANCELLED') return 'Отменён'
                  if (s === 'EXPIRED') return 'Истёк'
                  if (s === 'ARCHIVED') return 'В архиве'
                  if (s === 'WAITING_CREATOR_SIGNATURE') return 'Ожидает подпись инициатора'
                  return s
                }
              })()
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ background: '#2563eb', color: '#fff', borderRadius: 9999, padding: '6px 10px', fontWeight: 700 }}>{label}</span>
                  <span style={{ color: '#666', fontSize: 12 }}>ID: {details.id}</span>
                </div>
              )
            })()}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
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

              <div style={{ marginTop: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{(details.files || [])[0]?.file_name || 'Файл отсутствует'}</span>
                {(() => {
                  const f = (details.files || [])[0] || null
                  const rawId = f ? (f as any).storage_object_id ?? (f as any).object_id ?? (f as any).document_file_id : null
                  const fileId = typeof rawId === 'string' ? parseInt(rawId as any, 10) : rawId
                  const disabled = !(typeof fileId === 'number' && isFinite(fileId as any) && (fileId as any) > 0)
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => {}} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 8, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Посмотреть">
                        <Image src="/assets/ecp/document-file/see.svg" alt="see" width={18} height={18} />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            if (disabled) { toast.error('Файл недоступен для скачивания'); return }
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
        ) : (
          <div className={s.historyEmpty}>{t('historyEmpty')}</div>
        )}
      </div>
    </div>
  )
}

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
