'use client'

import React from 'react'
import useSWR from 'swr'
import { useTranslations } from 'next-intl'
import { ecpApi } from '@/shared/api'

type ListItem = {
  id: number
  title: string
  status: string
  created_at: string
  signers_count: number
}

const ALLOWED = new Set(['ROUTED', 'PENDING_SIGNATURE', 'PARTIALLY_SIGNED', 'SIGNED'])

const fetchSent = async () => {
  const res: any = await ecpApi.listDocuments({ outbox: true, inbox: false, page: 1, limit: 100 })
  const items: ListItem[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
  const filtered = items.filter((d) => ALLOWED.has(String(d.status)))
  const pagination = res?.pagination || null
  return { items: filtered, pagination }
}

export default function EcpSentPage() {
  const t = useTranslations('ecp.sidebar')
  const { data, error, isLoading } = useSWR('ecp-sent', fetchSent)
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [query, setQuery] = React.useState('')
  const { data: details } = useSWR(selectedId ? ['ecp-doc-details', selectedId] : null, ([, id]) => ecpApi.getDocumentDetails(id as number))

  const items: ListItem[] = data?.items || []
  const filtered = items.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
  const total = filtered.length

  const color = (s: string) => {
    if (s === 'SIGNED') return '#22c55e'
    if (s === 'ROUTED' || s === 'PENDING_SIGNATURE' || s === 'PARTIALLY_SIGNED') return '#2563eb'
    if (s === 'DECLINED' || s === 'CANCELLED') return '#ef4444'
    return '#6b7280'
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Документы — Отправленные <span style={{ color: '#888', fontWeight: 400 }}>Всего: {total}</span></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={'Поиск'} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', width: 260 }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isLoading && <div>Загрузка…</div>}
            {error && <div>Ошибка загрузки</div>}
            {filtered.map((doc) => (
              <div key={doc.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: color(doc.status), color: '#fff', padding: '6px 10px', fontWeight: 600 }}>{doc.status === 'SIGNED' ? 'Подписан' : doc.status === 'PARTIALLY_SIGNED' ? 'Частично подписан' : doc.status === 'PENDING_SIGNATURE' ? 'На подписи' : 'Направлен контрагенту'}</div>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                  {(details.signers || []).map((s: any, idx: number) => (
                    <div key={idx} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.fio || 'Подписант'}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>Стадия {s.stage_no || 1}</div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: s.status === 'SIGNED' ? '#22c55e' : s.status === 'REQUESTED' || s.status === 'PENDING' ? '#2563eb' : '#6b7280' }}>{s.status === 'SIGNED' ? 'Подписан' : s.status === 'REQUESTED' || s.status === 'PENDING' ? 'На рассмотрении' : s.status || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>История</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                    {(details.log || []).map((l: any, i: number) => (
                      <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{l.event_code}</span>
                          <span style={{ color: '#666' }}>{new Date(l.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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