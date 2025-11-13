'use client'

import React from 'react'
import useSWR from 'swr'
import { useTranslations } from 'next-intl'
import { ecpApi } from '@/shared/api'

type DocItem = {
  id: number
  title: string
  status: string
  created_at: string
  created_by: number
  signers_count: number
  files?: { file_name: string; file_type: string }[]
}

const fetchDrafts = async () => {
  const res: any = await ecpApi.listDocuments({ status: 'DRAFT', outbox: true, inbox: false, page: 1, limit: 50 })
  const items: DocItem[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
  const pagination = res?.pagination || null
  return { items, pagination }
}

export default function EcpDraftsPage() {
  const t = useTranslations('ecp.sidebar')
  const { data, error, isLoading } = useSWR('ecp-drafts', fetchDrafts)

  if (isLoading) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          Загрузка…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          Ошибка загрузки
        </div>
      </div>
    )
  }

  const items: DocItem[] = data?.items || []
  const total: number = data?.pagination?.total ?? items.length

  return (
    <div style={{ padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>
            Документы — {t('drafts')} <span style={{ color: '#888', fontWeight: 400 }}>Всего: {total}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {items.map((doc) => (
            <div key={doc.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{doc.title}</div>
              <div style={{ display: 'flex', gap: 16, color: '#666', fontSize: 13 }}>
                <span>Статус: {doc.status}</span>
                <span>Дата создания: {new Date(doc.created_at).toLocaleDateString()}</span>
                <span>Подписанты: {doc.signers_count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}