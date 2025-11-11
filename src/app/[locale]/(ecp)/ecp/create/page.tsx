'use client'

import React from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button, Input } from '@/shared/ui-kit'
import s from './page.module.scss'
import { toast } from 'react-hot-toast'
import { ecpApi, EsdcaDocumentDetails } from '@/shared/api'

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
  const onSendWithoutSign = () => {
    toast.success(t('sentWithoutSign'))
  }
  const onSignAndSend = () => {
    toast.success(t('signedAndSent'))
  }

  const onCreate = async () => {
    // Простая валидация: нужен файл и наименование
    if (!file || !name) {
      toast.error(`${t('upload')}: ${t('dropText').split(',')[0]} · ${t('name')}`)
      return
    }

    try {
      setIsCreating(true)

      // 1) Получить типы документов и выбрать первый как дефолт
      const types = await ecpApi.getDocumentTypes().catch(() => [])
      const documentTypeId = Array.isArray(types) && types.length > 0 ? types[0].id : 1

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

        {/* New Create button */}
        <div className={s.actions}>
          <Button onClick={onCreate} disabled={isCreating}>
            {isCreating ? t('creating') : t('createButton')}
          </Button>
        </div>

        {/* Signer */}
        <div className={s.sectionHeader} style={{ marginTop: 16 }}>🔏 {t('signer')}</div>
        <div
          className={s.selectBox}
          style={{ opacity: isCreated ? 1 : 0.7 }}
          onClick={() => (isCreated ? toast(t('chooseSigner')) : toast(t('createFirst')))}
        >
          <span className={signer ? '' : s.selectPlaceholder}>{signer || t('chooseSigner')}</span>
          <span>▾</span>
        </div>

        {/* Counterparty */}
        <div className={s.sectionHeader} style={{ marginTop: 16 }}>👥 {t('counterparty')}</div>
        <div
          className={s.selectBox}
          style={{ opacity: isCreated ? 1 : 0.7 }}
          onClick={() => (isCreated ? toast(t('chooseCounterparty')) : toast(t('createFirst')))}
        >
          <span className={counterparty ? '' : s.selectPlaceholder}>{counterparty || t('chooseCounterparty')}</span>
          <span>▾</span>
        </div>

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