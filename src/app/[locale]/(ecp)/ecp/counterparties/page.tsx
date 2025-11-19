'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Button, Input, Checkbox } from '@/shared/ui-kit'
import { counterpartiesApi, type CounterpartyPayload } from '@/shared/api/counterpartiesApi'
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

  const [items, setItems] = React.useState<Counterparty[]>([])
  const personalData = useLoginStore((s) => s.personalData)
  const [loading, setLoading] = React.useState(false)
  const [editId, setEditId] = React.useState<number | null>(null)

  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set())

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
        } : i)))
        toast.success(t('messages.updated'))
      } else {
        const created = await counterpartiesApi.store(payload)
        const createdItem: Counterparty = {
          // @ts-expect-error server may return id
          id: created?.id ?? Math.max(0, ...items.map(i => i.id)) + 1,
          name: payload.name,
          type: payload.type,
          region: (created as any)?.legal_address || payload.legal_address || '—',
          iinbin: payload.iin_bin,
          email: payload.email,
          phone: payload.phone,
        }
        setItems(prev => [createdItem, ...prev])
        toast.success(t('messages.added'))
      }
      resetForm()
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка запроса')
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
      await Promise.all(Array.from(selectedIds).map(id => counterpartiesApi.destroy(id)))
      setItems(prev => prev.filter(i => !selectedIds.has(i.id)))
      setSelectedIds(new Set())
      toast.success(t('messages.deleted'))
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось удалить')
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
          <Input placeholder={t('fields.name')} value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder={t('fields.email')} value={email} onChange={e => setEmail(e.target.value)} />
          <Input placeholder={t('fields.iinbin')} value={iinbin} onChange={e => setIinbin(e.target.value)} />
          <Input placeholder={t('fields.phone')} value={phone} onChange={e => setPhone(e.target.value)} />
          <Input placeholder={t('fields.legalAddress')} value={legalAddress} onChange={e => setLegalAddress(e.target.value)} />
          <Input placeholder={t('fields.bankDetails')} value={bank} onChange={e => setBank(e.target.value)} />
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
                <th className={s.th}>{t('columns.phone')}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className={s.td} colSpan={7}>
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
                    <td className={s.td}>{i.phone}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}