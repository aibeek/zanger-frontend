'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Button, Input, Checkbox, ConfirmModal } from '@/shared/ui-kit'
import { counterpartiesApi, type CounterpartyPayload } from '@/shared/api/ecp'
import { useLoginStore } from '@/features/auth/login'
import s from './page.module.scss'
import { toast } from 'react-hot-toast'

type Counterparty = {
  id: number
  name: string
  type: string
  region: string
  iinbin: string
  email?: string
  phone?: string
  is_verified?: boolean
}

const detectTypeCode = (name: string, iinbin: string): 'UL' | 'IP' | 'FL' => {
  const normalized = (name || '').toLowerCase()
  if (normalized.includes('ип')) return 'IP'
  if (normalized.includes('ооо') || normalized.includes('тоо')) return 'UL'
  if (iinbin && iinbin.trim().length === 12) return 'FL'
  return 'UL'
}

export default function CounterpartiesPage() {
  const t = useTranslations('ecp.counterparties')
  const typeLabels: Record<string, string> = {
    UL: t('typeLabels.UL'),
    IP: t('typeLabels.IP'),
    FL: t('typeLabels.FL'),
  }

  const [name, setName] = React.useState('')
  const [iinbin, setIinbin] = React.useState('')
  const [legalAddress, setLegalAddress] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [bank, setBank] = React.useState('')
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})

  const [items, setItems] = React.useState<Counterparty[]>([])
  const personalData = useLoginStore((s) => s.personalData)
  const [loading, setLoading] = React.useState(false)
  const [editId, setEditId] = React.useState<number | null>(null)

  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set())
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(prev => {
      if (prev.size === items.length) return new Set()
      return new Set(items.map(i => i.id))
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
    setFieldErrors({})
  }

  const onAddOrSave = async () => {
    if (!iinbin.trim()) {
      toast.error(t('errors.iinbinRequired'))
      return
    }

    const payload: CounterpartyPayload = {
      name: name || t('unknownName'),
      iin_bin: iinbin,
      type: detectTypeCode(name, iinbin),
      email: email || undefined,
      phone: phone || undefined,
      legal_address: legalAddress || undefined,
      bank_details: bank || undefined,
    }

    try {
      setLoading(true)
      if (editId) {
        const updated = await counterpartiesApi.update(editId, payload)
        // Пытаемся аккуратно заменить элемент в списке
        setItems(prev => prev.map(i => (i.id === editId ? {
          ...i,
          name: payload.name,
          iinbin: payload.iin_bin,
          type: payload.type,
          email: payload.email,
          phone: payload.phone,
          region: (updated as any)?.legal_address || payload.legal_address || i.region,
          is_verified: (updated as any)?.is_verified ?? i.is_verified,
        } : i)))
        toast.success(t('messages.updated'))
      } else {
        const created = await counterpartiesApi.store(payload)
        const createdAny = created as any
        const createdId = Number(createdAny?.item?.id ?? createdAny?.id ?? Math.max(0, ...items.map(i => i.id)) + 1)
        const createdItem: Counterparty = {
          id: createdId,
          name: payload.name,
          type: payload.type,
          region: (created as any)?.legal_address || payload.legal_address || '—',
          iinbin: payload.iin_bin,
          email: payload.email,
          phone: payload.phone,
          is_verified: Boolean(createdAny?.item?.is_verified ?? createdAny?.is_verified ?? false),
        }
        setItems(prev => [createdItem, ...prev])
        toast.success(t('messages.added'))
      }
      resetForm()
    } catch (e: any) {
      const errors: Record<string, string[]> | undefined = e?.errors
      if (errors && typeof errors === 'object') {
        const mapped: Record<string, string> = {}
        if (Array.isArray(errors.name) && errors.name[0]) mapped.name = String(errors.name[0])
        if (Array.isArray(errors.email) && errors.email[0]) mapped.email = String(errors.email[0])
        if (Array.isArray(errors.iin_bin) && errors.iin_bin[0]) mapped.iinbin = String(errors.iin_bin[0])
        if (Array.isArray(errors.phone) && errors.phone[0]) mapped.phone = String(errors.phone[0])
        if (Array.isArray(errors.legal_address) && errors.legal_address[0]) mapped.legalAddress = String(errors.legal_address[0])
        if (Array.isArray(errors.bank_details) && errors.bank_details[0]) mapped.bank = String(errors.bank_details[0])
        setFieldErrors(mapped)
        const firstMsg = Object.values(mapped)[0]
        toast.error(firstMsg || e?.message || 'Ошибка запроса')
      } else {
        toast.error(e?.message || 'Ошибка запроса')
      }
    } finally {
      setLoading(false)
    }
  }

  const getDeleteConfirmMessage = (): string => {
    const count = items.filter((i) => selectedIds.has(i.id)).length
    if (count <= 1) return 'Вы хотите удалить запись?'
    return 'Вы хотите удалить выбранные записи?'
  }

  const onDelete = () => {
    if (selectedIds.size === 0) {
      toast.error(t('errors.selectAtLeastOne'))
      return
    }
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    try {
      setLoading(true)
      await Promise.all(Array.from(selectedIds).map((id) => counterpartiesApi.destroy(id)))
      setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)))
      setSelectedIds(new Set())
      toast.success(t('messages.deleted'))
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось удалить')
    } finally {
      setLoading(false)
      setConfirmOpen(false)
    }
  }

  const onEdit = () => {
    if (selectedIds.size !== 1) {
      toast.error(t('errors.selectOneForEdit'))
      return
    }
    const id = Array.from(selectedIds)[0]
    const item = items.find(i => i.id === id)
    if (!item) return
    setName(item.name)
    setIinbin(item.iinbin)
    setLegalAddress(item.region || '')
    setEmail(item.email || '')
    setPhone(item.phone || '')
    setBank('')
    setEditId(id)
    toast(t('messages.editMode'))
  }

  React.useEffect(() => {
    const load = async () => {
      if (!personalData?.id) return
      try {
        setLoading(true)
        const res = await counterpartiesApi.getByCreatorId(personalData.id)
        const data = Array.isArray((res as any)?.items)
          ? (res as any).items
          : Array.isArray(res as any)
          ? (res as any)
          : []
        const mapped: Counterparty[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          type: d.type || 'UL',
          region: d.legal_address || '—',
          iinbin: d.iin_bin || d.iin || '',
          email: d.email || '',
          phone: d.phone || '',
          is_verified: !!d.is_verified,
        }))
        setItems(mapped)
      } catch (e: any) {
        toast.error(e?.message || 'Не удалось загрузить контрагентов')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [personalData?.id])

  return (
    <div className={s.page}>
      <section className={s.card}>
        <div className={s.title}>{t('addTitle')}</div>
        <div className={s.subtitle}>{t('addSubtitle')}</div>

        <div className={s.formGrid}>
          <div>
            <Input placeholder={t('fields.name')} value={name} onChange={e => setName(e.target.value)} hasError={!!fieldErrors.name} />
            {fieldErrors.name && <div className={s.errorText}>{fieldErrors.name}</div>}
          </div>
          <div>
            <Input placeholder={t('fields.email')} value={email} onChange={e => setEmail(e.target.value)} hasError={!!fieldErrors.email} />
            {fieldErrors.email && <div className={s.errorText}>{fieldErrors.email}</div>}
          </div>
          <div>
            <Input placeholder={t('fields.iinbin')} value={iinbin} onChange={e => setIinbin(e.target.value)} hasError={!!fieldErrors.iinbin} />
            {fieldErrors.iinbin && <div className={s.errorText}>{fieldErrors.iinbin}</div>}
          </div>
          <div>
            <Input placeholder={t('fields.phone')} value={phone} onChange={e => setPhone(e.target.value)} hasError={!!fieldErrors.phone} />
            {fieldErrors.phone && <div className={s.errorText}>{fieldErrors.phone}</div>}
          </div>
          <div>
            <Input placeholder={t('fields.legalAddress')} value={legalAddress} onChange={e => setLegalAddress(e.target.value)} hasError={!!fieldErrors.legalAddress} />
            {fieldErrors.legalAddress && <div className={s.errorText}>{fieldErrors.legalAddress}</div>}
          </div>
          <div>
            <Input placeholder={t('fields.bankDetails')} value={bank} onChange={e => setBank(e.target.value)} hasError={!!fieldErrors.bank} />
            {fieldErrors.bank && <div className={s.errorText}>{fieldErrors.bank}</div>}
          </div>
        </div>

        <div className={s.actions}>
          <Button onClick={onAddOrSave} loading={loading}>
            {editId ? t('saveButton') : t('addButton')}
          </Button>
        </div>
      </section>

      <section className={s.tableCard}>
        <div className={s.tableHeader}>
          <div className={s.title}>{t('listTitle')}</div>
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
                <th className={s.th}>{t('columns.type')}</th>
                <th className={s.th}>{t('columns.region')}</th>
                <th className={s.th}>{t('columns.iinbin')}</th>
                <th className={s.th}>{t('columns.emailPhone')}</th>
                <th className={s.th}>Подтвержден</th>
                <th className={s.th}>{t('columns.phone')}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className={s.td} colSpan={8}>
                    <div className={s.empty}>{t('empty')}</div>
                  </td>
                </tr>
              ) : (
                items.map((i) => (
                  <tr className={s.row} key={i.id}>
                    <td className={`${s.td} ${s.selectCol}`}>
                      <Checkbox checked={selectedIds.has(i.id)} onChange={() => toggleSelect(i.id)} />
                    </td>
                    <td className={s.td}>{i.name}</td>
                    <td className={s.td}>{typeLabels[i.type] || i.type}</td>
                    <td className={s.td}>{i.region}</td>
                    <td className={s.td}>{i.iinbin}</td>
                    <td className={s.td}>{i.email}</td>
                    <td className={s.td}>{i.is_verified ? 'Да' : 'Нет'}</td>
                    <td className={s.td}>{i.phone}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      <ConfirmModal
        isOpen={confirmOpen}
        title={'Подтверждение удаления'}
        message={getDeleteConfirmMessage()}
        confirmText={'Удалить'}
        cancelText={'Отменить'}
        onConfirm={confirmDelete}
        onClose={() => setConfirmOpen(false)}
        confirmVariant={'danger'}
        loading={loading}
      />
    </div>
  )
}
