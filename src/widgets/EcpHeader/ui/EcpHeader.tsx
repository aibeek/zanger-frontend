'use client'

import React from 'react'
import Cookies from 'js-cookie'
import { useTranslations } from 'next-intl'
import { LangSwitcher } from '@/shared/ui-kit'
import { NotificationsDropdown } from '@/entities/notifications'
import { useLoginStore } from '@/features/auth/login'
import Image from 'next/image'
import avatarDefault from '@/app/assets/icons/avatar-default.svg'
import s from './EcpHeader.module.scss'
import { ModulesBar } from '@/shared/ui-kit/ModulesBar/ModulesBar'

interface EcpHeaderProps {
  title?: string
  icon?: any
}

export const EcpHeader: React.FC<EcpHeaderProps> = ({ title, icon: iconProp }) => {
  const t = useTranslations()
  const { personalData } = useLoginStore()

  const name = personalData?.name ?? ''
  const icon = personalData?.icon && !personalData.icon.includes('Lawyer.jpg') ? personalData.icon : ''
  const role = Cookies.get('role')
  const roleLabel = role === 'lawyer' ? t('dashboard.sidebar.lawyerRole') : t('dashboard.sidebar.clientRole')

  const headerTitle = title ?? t('dashboard.footer.sections.digitalSignature')

  return (
    <div className={s.headerWrapper}>
      <header className={s.header}>
        <div className={s.left}>
          <div className={s.key}>
            <Image src={iconProp || "/assets/ecp/header/key.svg"} alt="icon" width={20} height={20} />
          </div>
          <h1 className={s.title}>{headerTitle}</h1>
        </div>

        <div className={s.right}>
          <NotificationsDropdown />
          <LangSwitcher />
          <div className={s.user}>
            <div className={s.avatar}>
              <Image
                src={icon && icon.trim() !== '' ? icon : avatarDefault}
                alt={name || 'avatar'}
                width={56}
                height={56}
                style={{ borderRadius: 12, objectFit: 'cover' }}
              />
            </div>
            <div className={s.userInfo}>
              <span className={s.name}>{name}</span>
              <span className={s.role}>{roleLabel}</span>
            </div>
          </div>
        </div>
      </header>
      <ModulesBar />
    </div>
  )
}