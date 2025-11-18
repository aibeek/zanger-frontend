'use client'

import React from 'react'
import useSWR from 'swr'
import { ecpApi } from '@/shared/api'
import { API_URL } from '@/shared/config'
import { authService } from '@/features/auth'
import { toast } from 'react-hot-toast'

type ListItem = { id: number; title: string; status: string; created_at: string; description?: string }

const ALLOWED = new Set(['REMOVED'])

const fetchRemoved = async (page: number, limit: number) => {
  const res: any = await ecpApi.listDocuments({ page, limit, status: 'REMOVED' })
  const items: ListItem[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
  const filtered = items.filter((d) => ALLOWED.has(String(d.status)))
  const pagination = res?.pagination || { page, limit, total: filtered.length }
  return { items: filtered, pagination }
}

export default function EcpTrashPage() {
  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(10)
  const [query, setQuery] = React.useState('')
  const [selected, setSelected] = React.useState<Set<number>>(new Set())
  const { data, error, isLoading } = useSWR(['ecp-trash', page, limit], ([, p, l]) => fetchRemoved(p as number, l as number))

  const items: ListItem[] = (data?.items || []).filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
  const total = (data?.pagination?.total as number) || items.length
  const pages = Math.max(1, Math.ceil(total / ((data?.pagination?.limit as number) || limit)))

  const color = (s: string) => (s === 'REMOVED' ? '#ef4444' : '#6b7280')

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const selectAll = () => setSelected(new Set(items.map((i) => i.id)))
  const clearAll = () => setSelected(new Set())

  const onRestore = async () => {
    try {
      const ids = Array.from(selected)
      if (!ids.length) { toast.error('Выберите документы'); return }
      await ecpApi.trashRestore(ids)
      toast.success('Восстановлено')
      clearAll()
      window.location.reload()
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось восстановить')
    }
  }

  const onPurge = async () => {
    try {
      const ids = Array.from(selected)
      if (!ids.length) { toast.error('Выберите документы'); return }
      const ok = window.confirm('Удалить выбранные документы безвозвратно?')
      if (!ok) return
      await ecpApi.trashPurge(ids)
      toast.success('Удалено')
      clearAll()
      window.location.reload()
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось удалить')
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Документы — Корзина <span style={{ color: '#888', fontWeight: 400 }}>Всего: {total}</span></div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={'Поиск'} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', width: 260 }} />
            <button onClick={selectAll} style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 700 }}>Выбрать все</button>
            <button onClick={onRestore} style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 700 }}>Восстановить</button>
            <button onClick={onPurge} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 700 }}>Удалить</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {isLoading && <div>Загрузка…</div>}
          {error && <div>Ошибка загрузки</div>}
          {items.map((doc) => (
            <div key={doc.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', minHeight: 120 }}>
              <div style={{ background: color(doc.status), color: '#fff', padding: '4px 10px', fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Удалён</span>
                <input type="checkbox" checked={selected.has(doc.id)} onChange={() => toggle(doc.id)} style={{ width: 16, height: 16 }} />
              </div>
              <div style={{ padding: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{doc.title}</div>
                <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Дата: {String(doc.created_at).split(' ')[0]}{doc.description ? ` · № ${String(doc.description)}` : ''}</div>
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
      </div>
    </div>
  )
}
