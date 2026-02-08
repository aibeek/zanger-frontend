'use client'

import React, { useEffect } from 'react'
import s from './EcpLayout.module.scss'
import { EcpSidebar } from '@/shared/ui-kit/EcpSidebar'
import { EcpHeader } from '@/widgets/EcpHeader'
import { useLoginStore } from '@/features/auth/login'

type Props = {
  children: React.ReactNode
}

// test comment v1

export const EcpLayout: React.FC<Props> = ({ children }) => {
  const { getPersonalDataByToken } = useLoginStore()

  useEffect(() => {
    getPersonalDataByToken()
  }, [getPersonalDataByToken])

  return (
    <div className={s.layout}>
      <div className={s.sidebar}>
        <EcpSidebar />
      </div>
      <div className={s.header}>
        <EcpHeader />
      </div>
      <main className={s.content}>{children}</main>
    </div>
  )
}