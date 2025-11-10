'use client'

import React from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button, Input } from '@/shared/ui-kit'
import s from './page.module.scss'
import { toast } from 'react-hot-toast'

export default function EcpCreateDocumentPage() {
  const t = useTranslations('ecp.create')
  const locale = useLocale()

  const [signer, setSigner] = React.useState<string>('')
  const [counterparty, setCounterparty] = React.useState<string>('')
  const [file, setFile] = React.useState<File | null>(null)
  const [name, setName] = React.useState('')
  const [docNumber, setDocNumber] = React.useState('')
  const [createdAt, setCreatedAt] = React.useState('')

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

  return (
    <div className={s.page}>
      {/* Left main card (form) */}
      <div className={s.card}>
        {/* Signer */}
        <div className={s.sectionHeader}>🔏 {t('signer')}</div>
        <div className={s.selectBox} onClick={() => toast(t('chooseSigner'))}>
          <span className={signer ? '' : s.selectPlaceholder}>{signer || t('chooseSigner')}</span>
          <span>▾</span>
        </div>

        {/* Counterparty */}
        <div className={s.sectionHeader} style={{ marginTop: 16 }}>👥 {t('counterparty')}</div>
        <div className={s.selectBox} onClick={() => toast(t('chooseCounterparty'))}>
          <span className={counterparty ? '' : s.selectPlaceholder}>{counterparty || t('chooseCounterparty')}</span>
          <span>▾</span>
        </div>

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

        {/* Actions */}
        <div className={s.actions}>
          <Button className={s.draftBtn} onClick={onDraft}>{t('draft')}</Button>
          <Button variant="secondary" onClick={onSendWithoutSign}>{t('sendWithoutSign')}</Button>
          <Button onClick={onSignAndSend}>{t('signAndSend')}</Button>
        </div>
      </div>

      {/* Right history card */}
      <div className={s.card}>
        <div className={s.historyTitle}>{t('history')}</div>
        <div className={s.divider} />
        <div className={s.historyEmpty}>{t('historyEmpty')}</div>
      </div>
    </div>
  )
}