'use client'

import React from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button, Input, Loader } from '@/shared/ui-kit'
import s from './page.module.scss'
import { toast } from 'react-hot-toast'
import { ecpApi, EsdcaDocumentDetails, EsdcaDocumentType, counterpartiesApi } from '@/shared/api'
import { signChallengeBase64 } from '@/shared/lib/ncalayer'
import { useLoginStore } from '@/features/auth'

export default function EcpCreateDocumentPage() {
  const t = useTranslations('ecp.create')
  const locale = useLocale()

  const [signer, setSigner] = React.useState<string>('')
  const [counterparty, setCounterparty] = React.useState<string>('')
  const [file, setFile] = React.useState<File | null>(null)
  const [name, setName] = React.useState('')
  const [docNumber, setDocNumber] = React.useState('')
  const [createdAt, setCreatedAt] = React.useState('')
  const [isCreated, setIsCreated] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [documentId, setDocumentId] = React.useState<number | null>(null)
  const [details, setDetails] = React.useState<EsdcaDocumentDetails | null>(null)
  const [documentTypes, setDocumentTypes] = React.useState<EsdcaDocumentType[]>([])
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = React.useState<number | null>(null)

  // Подписанты и поиск контрагентов
  type CounterpartyItem = { id: number; name: string; iin_bin?: string; type?: string; email?: string; phone?: string }
  const { personalData, getPersonalDataByToken } = useLoginStore()
  const [signatories, setSignatories] = React.useState<CounterpartyItem[]>([])
  const [loadingSignatories, setLoadingSignatories] = React.useState<boolean>(false)
  const [signatoriesError, setSignatoriesError] = React.useState<string | null>(null)
  const [selectedSignerId, setSelectedSignerId] = React.useState<number | ''>('')
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [searchResults, setSearchResults] = React.useState<CounterpartyItem[]>([])
  const [loadingSearch, setLoadingSearch] = React.useState<boolean>(false)
  const [selectedCounterpartyId, setSelectedCounterpartyId] = React.useState<number | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      setFile(files[0])
    }
  }

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const onDraft = () => {
    toast.success(t('draftSaved'))
  }
  const onSendWithoutSign = async () => {
    if (!documentId) {
      toast.error(t('createFirst'))
      return
    }
    try {
      // 1) Сформировать список подписантов: контрагенты (stage 1) + инициатор (stage 2, последним)
      const signersPayload: any[] = []
      // Контрагенты — стадия 1
      if (selectedCounterpartyId && (!selectedSignerId || selectedCounterpartyId !== selectedSignerId)) {
        signersPayload.push({ counterparty_id: selectedCounterpartyId, role: 'SIGNER', stage_no: 1 })
      }
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
  const onSignAndSend = async () => {
    if (!documentId) {
      toast.error(t('createFirst'))
      return
    }
    try {
      // 1) Добавить подписантов: контрагенты (stage 1) + выбранный подписант (stage 2)
      const signersPayload: any[] = []
      if (selectedCounterpartyId && (!selectedSignerId || selectedCounterpartyId !== selectedSignerId)) {
        signersPayload.push({ counterparty_id: selectedCounterpartyId, role: 'SIGNER', stage_no: 1 })
      }
      if (selectedSignerId && typeof selectedSignerId === 'number') {
        signersPayload.push({ counterparty_id: selectedSignerId, role: 'SIGNER', stage_no: 2 })
      }
      if (signersPayload.length > 0) {
        await ecpApi.addSigners(documentId, signersPayload)
      }

      // 2) Обеспечить статус для подписи
      // Первый send: DRAFT -> ROUTED; Второй send: ROUTED -> PENDING_SIGNATURE
      await ecpApi.sendForSigning(documentId)
      let latest = await ecpApi.getDocumentDetails(documentId)
      if (latest?.status === 'ROUTED') {
        await ecpApi.sendForSigning(documentId)
        latest = await ecpApi.getDocumentDetails(documentId)
      }
      setDetails(latest)

      // 3) Инициализировать подпись для текущего пользователя
      const init = await ecpApi.signInitiate(documentId, 'SIGN_CMS')
      const { operation_id, challenge } = init

      // 4) Подписать challenge через NCALayer
      const cmsBase64 = await signChallengeBase64(challenge)

      // 5) Верифицировать подпись на сервере
      const verifyRes = await ecpApi.signVerify(documentId, { operation_id, cms: cmsBase64 })
      if (!verifyRes?.valid || verifyRes?.status !== 'VERIFIED') {
        toast.error(locale === 'kz' ? 'Қолтаңбаны тексеру қате' : 'Ошибка проверки подписи')
        return
      }

      // 6) Завершить подпись: записать подпись и обновить статусы
      await ecpApi.signComplete(documentId, { operation_id, cms: cmsBase64 })

      const d = await ecpApi.getDocumentDetails(documentId)
      setDetails(d)
      toast.success(t('signedAndSent'))
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось подписать')
    }
  }

  React.useEffect(() => {
    let mounted = true
    ecpApi
      .getDocumentTypes()
      .then((types) => {
        if (!mounted) return
        const maybeObj = types as any
        const normalized = Array.isArray(types)
          ? types
          : Array.isArray(maybeObj?.data)
          ? maybeObj.data
          : Array.isArray(maybeObj?.items)
          ? maybeObj.items
          : Array.isArray(maybeObj?.document_types)
          ? maybeObj.document_types
          : []
        setDocumentTypes(normalized)
        // Не выбираем автоматически, пользователь сам выберет; можно раскомментировать, чтобы ставить первый тип по умолчанию
        // if (types && types.length > 0) setSelectedDocumentTypeId(types[0].id)
      })
      .catch((e: any) => {
        const msg = e?.message || 'Ошибка загрузки типов документов'
        toast.error(msg)
      })
    return () => {
      mounted = false
    }
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
      const documentTypeId = selectedDocumentTypeId ?? (documentTypes[0]?.id ?? 1)

      // 2) Создать документ (черновик)
      const description = `${t('docNumber')}: ${docNumber || '—'}; ${t('createdAt')}: ${createdAt || '—'}`
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
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>

        {/* Name + Number + Date grid */}
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
              onChange={(e) => setDocNumber(e.target.value)}
            />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label htmlFor="date" className={s.sectionHeader} style={{ marginBottom: 6 }}>{t('createdAt')}</label>
          <Input
            id="date"
            type="date"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
          />
        </div>

        {/* Document type select */}
        <div style={{ marginTop: 12 }}>
          <div className={s.sectionHeader} style={{ marginBottom: 6 }}>📄 Тип документа</div>
          <select
            value={selectedDocumentTypeId ?? ''}
            onChange={(e) => setSelectedDocumentTypeId(Number(e.target.value) || null)}
            disabled={isCreating}
            className={s.selectBox}
          >
            <option value="" disabled>
              {locale === 'kz' ? 'Түрін таңдаңыз' : 'Выберите тип'}
            </option>
            {documentTypes.map((dt) => (
              <option key={dt.id} value={dt.id}>
                {locale === 'kz' ? dt.name_kaz : dt.name_rus}
              </option>
            ))}
          </select>
        </div>

      {/* New Create button */}
      <div className={s.actions}>
        <Button onClick={onCreate} disabled={isCreating}>
          {isCreating ? t('creating') : t('createButton')}
        </Button>
      </div>

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
            {locale === 'kz' ? 'Подписантты таңдаңыз' : 'Выберите подписанта'}
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
                      setSelectedCounterpartyId(item.id)
                      setSigner(item.name)
                      setCounterparty(item.name)
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {item.iin_bin ? `ИИН/БИН: ${item.iin_bin}` : ''}
                      {item.phone ? (item.iin_bin ? ' · ' : '') + `Тел: ${item.phone}` : ''}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Existing actions at the end */}
        <div className={s.actions}>
          <Button className={s.draftBtn} onClick={onDraft}>{t('draft')}</Button>
          <Button variant="secondary" onClick={onSendWithoutSign}>{t('sendWithoutSign')}</Button>
          <Button onClick={onSignAndSend}>{t('signAndSend')}</Button>
        </div>
      </div>

      {/* Right details/history card */}
      <div className={s.card}>
        <div className={s.historyTitle}>{t('history')}</div>
        <div className={s.divider} />

        {details ? (
          <div className={s.detailsBlock}>
            <div style={{ marginBottom: 8 }}>
              <b>ID:</b> {details.id} · <b>{t('status')}:</b> {details.status}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>{t('name')}:</b> {details.title}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>{t('upload')}:</b>{' '}
              {details.files && details.files.length > 0
                ? details.files.map((f) => `${f.file_name} (${f.file_type})`).join(', ')
                : t('historyEmpty')}
            </div>
          </div>
        ) : (
          <div className={s.historyEmpty}>{t('historyEmpty')}</div>
        )}
      </div>
    </div>
  )
}