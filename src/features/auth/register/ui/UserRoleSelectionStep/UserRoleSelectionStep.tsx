'use client'

import Image from 'next/image'
// import { Button } from '@/shared/ui-kit'
import { Link } from '@/i18n'
import { useTranslations } from 'next-intl'

import s from './UserRoleSelectionStep.module.scss'


export const UserRoleSelectionStep = () => {
  const t = useTranslations('auth.roleSelection')

  const cardData = [
    {
      role: 'lawyer',
      className: 'lawyerCard',
      title: t('lawyer.title'),
      descr: t('lawyer.description'),
      icon: '/assets/images/Vector.svg',
    },
    {
      role: 'client',
      className: 'clientCard',
      title: t('client.title'),
      descr: t('client.description'),
      icon: '/assets/images/chel.svg',
    },
  ]

  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        <Image src="/logo-blue.svg" alt="Zanger logo" width={48} height={56} />
        <span className={s.brand}>ZANGER</span>
      </div>
	  <h1 className={s.statusTitle}>{t('heading', { default: 'Ваш статус' } as any) || 'Ваш статус'}</h1>
      <div className={s.cards}>
        {cardData.map(({ role, className, title, descr, icon }) => (
          <Link
            key={role}
            href={`/auth/register/${role}`}
            className={`${s.cardLink} ${s[className]}`}
            aria-label={`${title}`}
          >
            <article className={s.inner}>
              <div className={s.left}>
                <h2 className={s.title}>{title}</h2>
                <p className={s.descr}>{descr}</p>
              </div>
              <div className={s.iconWrap} aria-hidden="true">
                <Image src={icon} alt="" width={120} height={120} />
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
