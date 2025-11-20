'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Button, Input, Checkbox } from '@/shared/ui-kit'
import { counterpartiesApi, type CounterpartyPayload, signingApi } from '@/shared/api/ecp'
import { useLoginStore } from '@/features/auth/login'
import { ncalayerUtils } from '@/shared/lib/ncalayer'
import s from './page.module.scss'
import { toast } from 'react-hot-toast'

type Counterparty = {
  id: number
  name: string
  type: 'UL' | 'IP' | 'FL'
  region: string
  iinbin: string
  email?: string
  phone?: string
  bank?: string
}

const detectTypeCode = (name: string, iinbin: string, fallback: 'UL' | 'IP' | 'FL'): 'UL' | 'IP' | 'FL' => {
  const normalized = (name || '').toLowerCase()
  if (normalized.includes('ип')) return 'IP'
  if (normalized.includes('ооо') || normalized.includes('тоо')) return 'UL'
  if (iinbin && iinbin.trim().length === 12) return 'FL'
  return fallback
}

export default function EcpStatusesPage() {
  const t = useTranslations('ecp.statuses')

  const [active, setActive] = React.useState<'FL' | 'IP' | 'UL'>('FL')
  const [name, setName] = React.useState('')
  const [iinbin, setIinbin] = React.useState('')
  const [legalAddress, setLegalAddress] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [bank, setBank] = React.useState('')

  const [items, setItems] = React.useState<Counterparty[]>([])
  const personalData = useLoginStore((s) => s.personalData)
  const [loading, setLoading] = React.useState(false)
  const [verificationStep, setVerificationStep] = React.useState<'idle' | 'generating' | 'signing' | 'verifying' | 'success' | 'error'>('idle')
  const [editId, setEditId] = React.useState<number | null>(null)
  // Убираем режим открытия панели для ЮЛ — форма всегда сверху

  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set())

  const typeLabels: Record<'UL' | 'IP' | 'FL', string> = {
    UL: t('typeLabels.UL'),
    IP: t('typeLabels.IP'),
    FL: t('typeLabels.FL'),
  }

  const displayed = React.useMemo(() => {
    const filtered = items.filter((i) => i.type === active)
    return active === 'UL' ? filtered : filtered.slice(0, 1)
  }, [items, active])

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds((prev) => {
      if (prev.size === displayed.length) return new Set()
      return new Set(displayed.map((i) => i.id))
    })
  }

  const resetForm = () => {
    setName('')
    setIinbin('')
    setLegalAddress('')
    setEmail('')
    setPhone('')
    setBank('')
    setEditId(null)
    setVerificationStep('idle')
  }

  const startAdd = () => {
    resetForm()
  }

  /**
   * Получение текста состояния верификации
   */
  const getVerificationStatusText = (): string => {
    switch (verificationStep) {
      case 'generating':
        return 'Генерация челленджа...'
      case 'signing':
        return 'Ожидание подписания через NCALayer...'
      case 'verifying':
        return 'Проверка подписи...'
      case 'success':
        return 'Верификация успешна ✓'
      case 'error':
        return 'Ошибка верификации ✗'
      default:
        return ''
    }
  }

  /**
   * Генерация челленджа для подписания
   */
  const generateChallenge = (taxId: string, type: string): string => {
    const now = new Date().toISOString()
    const nonce = Math.random().toString(36).substring(2, 15)
    const data = {
      taxId,
      type,
      timestamp: now,
      nonce,
      purpose: 'COUNTERPARTY_VERIFICATION',
    }
    return btoa(JSON.stringify(data))
  }

  /**
   * Подписание челленджа через NCALayer
   */
  const signChallengeWithNCALayer = async (challenge: string): Promise<string> => {
    try {
      setVerificationStep('signing')
      // Проверяем доступность NCALayer
      const isAvailable = await ncalayerUtils.isNCALayerAvailable()
      if (!isAvailable) {
        throw new Error('NCALayer не доступен')
      }

      // Подписываем челлендж
      const signature = await ncalayerUtils.signData(challenge)
      return signature
    } catch (error) {
      throw new Error(`Ошибка при подписании: ${error.message}`)
    }
  }

  const onAddOrSave = async () => {
    if (!iinbin.trim()) {
      toast.error(t('errors.iinbinRequired'))
      return
    }

    // Тип контрагента строго соответствует активной вкладке
    const type = active

    try {
      setLoading(true)

      // Для новых записей (не редактирование) требуется верификация ЭЦП
      if (!editId) {
        // Проверяем доступность NCALayer перед началом процесса
        try {
          const isAvailable = await ncalayerUtils.isNCALayerAvailable()
          if (!isAvailable) {
            toast.error('NCALayer не доступен. Пожалуйста, установите и запустите NCALayer.')
            return
          }
        } catch (ncaError) {
          toast.error('Ошибка при проверке NCALayer: ' + ncaError.message)
          return
        }

        setVerificationStep('generating')
        // Генерируем челлендж
        const challenge = generateChallenge(iinbin, type)
        
        try {
          // Подписываем челлендж через NCALayer
          const signature = await signChallengeWithNCALayer(challenge)
          
          setVerificationStep('verifying')
          // Верифицируем подпись с ИИН/БИН
          const verification = await signingApi.verifyWithTaxId({
            tax_id: iinbin,
            cms: signature,
            challenge: challenge,
          })
          
          if (!verification.valid) {
            setVerificationStep('error')
            toast.error(verification.message || 'Верификация ЭЦП не удалась')
            return
          }
          
          setVerificationStep('success')
          toast.success('ЭЦП верификация успешна')
        } catch (verificationError) {
          setVerificationStep('error')
          toast.error(`Ошибка верификации ЭЦП: ${verificationError.message}`)
          return
        } finally {
          // Всегда сбрасываем состояние верификации после завершения
          setTimeout(() => setVerificationStep('idle'), 3000)
        }
      }

      const payload: CounterpartyPayload = {
        name: name || t('unknownName'),
        iin_bin: iinbin,
        type,
        email: email || undefined,
        phone: phone || undefined,
        legal_address: legalAddress || undefined,
        bank_details: bank || undefined,
      }

      if (editId) {
        const updated = await counterpartiesApi.update(editId, payload)
        setItems((prev) =>
          prev.map((i) =>
            i.id === editId
              ? {
                  ...i,
                  name: payload.name,
                  iinbin: payload.iin_bin,
                  type: payload.type as any,
                  email: payload.email,
                  phone: payload.phone,
                  region: (updated as any)?.legal_address || payload.legal_address || i.region,
                  bank: payload.bank_details,
                }
              : i
          )
        )
        toast.success(t('messages.updated'))
      } else {
        // Для ФЛ и ИП — допускаем только одну запись: обновляем существующую при сохранении
        if (type !== 'UL') {
          const existing = items.find((i) => i.type === type)
          if (existing) {
            const updated = await counterpartiesApi.update(existing.id, payload)
            setItems((prev) =>
              prev.map((i) =>
                i.id === existing.id
                  ? {
                      ...i,
                      name: payload.name,
                      iinbin: payload.iin_bin,
                      type: payload.type as any,
                      email: payload.email,
                      phone: payload.phone,
                      region: (updated as any)?.legal_address || payload.legal_address || i.region,
                      bank: payload.bank_details,
                    }
                  : i
              )
            )
            toast.success(t('messages.updated'))
            resetForm()
            return
          }
        }
        const created = await counterpartiesApi.storeMine(payload)
        const createdAny = created as any
        const createdId = Number(createdAny?.item?.id ?? createdAny?.id ?? Math.max(0, ...items.map((i) => i.id)) + 1)
        const createdItem: Counterparty = {
          id: createdId,
          name: payload.name,
          type: payload.type,
          region: (created as any)?.legal_address || payload.legal_address || '—',
          iinbin: payload.iin_bin,
          email: payload.email,
          phone: payload.phone,
          bank: payload.bank_details,
        }
        setItems((prev) => [createdItem, ...prev.filter((i) => !(i.type !== 'UL' && i.type === createdItem.type))])
        toast.success(t('messages.added'))
      }

      resetForm()
    } catch (e: any) {
      setVerificationStep('error')
      toast.error(e?.message || t('errors.requestFailed'))
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    if (selectedIds.size === 0) {
      toast.error(t('errors.selectAtLeastOne'))
      return
    }
    try {
      setLoading(true)
      await Promise.all(Array.from(selectedIds).map((id) => counterpartiesApi.destroy(id)))
      setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)))
      setSelectedIds(new Set())
      toast.success(t('messages.deleted'))
    } catch (e: any) {
      toast.error(e?.message || t('errors.deleteFailed'))
    } finally {
      setLoading(false)
    }
  }

  const onEdit = () => {
    if (selectedIds.size !== 1) {
      toast.error(t('errors.selectOneForEdit'))
      return
    }
    const id = Array.from(selectedIds)[0]
    const item = displayed.find((i) => i.id === id)
    if (!item) return
    setName(item.name)
    setIinbin(item.iinbin)
    setLegalAddress(item.region || '')
    setEmail(item.email || '')
    setPhone(item.phone || '')
    setBank(item.bank || '')
    setEditId(id)
    toast(t('messages.editMode'))
  }

  React.useEffect(() => {
    const load = async () => {
      if (!personalData?.id) return
      try {
        setLoading(true)
        const res = await counterpartiesApi.getByUserId(personalData.id)
        const data = Array.isArray((res as any)?.items)
          ? (res as any).items
          : Array.isArray(res as any)
          ? (res as any)
          : []
        const mapped: Counterparty[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          type: (d.type || 'UL') as 'UL' | 'IP' | 'FL',
          region: d.legal_address || '—',
          iinbin: d.iin_bin || d.iin || '',
          email: d.email || '',
          phone: d.phone || '',
          bank: d.bank_details || '',
        }))
        setItems(mapped)
      } catch (e: any) {
        toast.error(e?.message || t('errors.loadFailed'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [personalData?.id])

  const renderForm = (type: 'FL' | 'IP' | 'UL') => (
    <section className={s.card}>
      <div className={s.formHeader}>
        <div className={s.title}>{t('addTitle')}</div>
      </div>
      <div className={s.subtitle}>{t('addSubtitle')}</div>

      <div className={s.formGrid}>
        <Input placeholder={t('fields.name')} value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder={t('fields.email')} value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder={t(type === 'FL' ? 'fields.iin' : 'fields.iinbin')} value={iinbin} onChange={(e) => setIinbin(e.target.value)} />
        <Input placeholder={t('fields.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input placeholder={t('fields.legalAddress')} value={legalAddress} onChange={(e) => setLegalAddress(e.target.value)} />
        {type !== 'FL' && (
          <Input placeholder={t('fields.bankDetails')} value={bank} onChange={(e) => setBank(e.target.value)} />
        )}
      </div>

      <div className={s.actions}>
        {verificationStep !== 'idle' && (
          <div className={s.verificationStatus}>
            {getVerificationStatusText()}
          </div>
        )}
        <Button onClick={onAddOrSave} loading={loading} disabled={verificationStep === 'signing'}>
          {editId ? t('saveButton') : t('signAndAdd')}
        </Button>
      </div>
    </section>
  )

  return (
    <div className={s.page}>
      <div className={s.tabs}>
        <div className={`${s.tabBtn} ${active === 'FL' ? s.tabBtnActive : ''}`} onClick={() => setActive('FL')}>{t('tabs.fl')}</div>
        <div className={`${s.tabBtn} ${active === 'IP' ? s.tabBtnActive : ''}`} onClick={() => setActive('IP')}>{t('tabs.ip')}</div>
        <div className={`${s.tabBtn} ${active === 'UL' ? s.tabBtnActive : ''}`} onClick={() => setActive('UL')}>{t('tabs.ul')}</div>
      </div>

      <div className={s.content}>
        {/* Верхняя панель — добавление/редактирование */}
        {renderForm(active)}

        {/* Таблица записей для активного типа */}
        <section className={s.tableCard}>
          <div className={s.tableHeader}>
            <div className={s.title}>{active === 'UL' ? t('listTitleOrgs') : t('listTitle')}</div>
            <div className={s.tableActions}>
              <Button variant="border" size="sm" onClick={selectAll} disabled={loading}>{t('selectAll')}</Button>
              <Button variant="secondary" size="sm" onClick={onEdit} disabled={loading}>{t('edit')}</Button>
              <Button variant="danger" size="sm" onClick={onDelete} disabled={loading}>{t('delete')}</Button>
            </div>
          </div>

          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead className={s.thead}>
                <tr>
                  <th className={`${s.th} ${s.selectCol}`}></th>
                  <th className={s.th}>{t('columns.name')}</th>
                  {active === 'UL' && <th className={s.th}>{t('columns.address')}</th>}
                  <th className={s.th}>{t(active === 'FL' ? 'columns.iin' : 'columns.iinbin')}</th>
                  <th className={s.th}>Email</th>
                  <th className={s.th}>{t('columns.phone')}</th>
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 ? (
                  <tr>
                    <td className={s.td} colSpan={active === 'UL' ? 6 : 5}>
                      <div className={s.empty}>{t('empty')}</div>
                    </td>
                  </tr>
                ) : (
                  displayed.map((i) => (
                    <tr className={s.row} key={i.id}>
                      <td className={`${s.td} ${s.selectCol}`}>
                        <Checkbox checked={selectedIds.has(i.id)} onChange={() => toggleSelect(i.id)} />
                      </td>
                      <td className={s.td}>{i.name}</td>
                      {active === 'UL' && <td className={s.td}>{i.region}</td>}
                      <td className={s.td}>{i.iinbin}</td>
                      <td className={s.td}>{i.email}</td>
                      <td className={s.td}>{i.phone}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}