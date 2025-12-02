'use client'

import { useTranslations, useLocale } from 'next-intl'
import Image, { StaticImageData } from 'next/image'
import { useState } from 'react'
import { Modal, Button } from '@/shared/ui-kit'
import moduleIcon from '@/app/assets/icons/moduleIcon.svg'
import monitor from '@/app/assets/icons/monitor.webp'
import myApplicationsIcon from '@/app/assets/icons/dashboard-icons/my-applications.svg'
import documentIcon from '@/app/assets/icons/document.svg'
import chatIcon from '@/app/assets/icons/dashboard-icons/chat.svg'
import peopleIcon from '@/app/assets/icons/people.svg'
import faqIcon from '@/app/assets/icons/dashboard-icons/faq.svg'
import s from './ModulesSection.module.scss'
import { useRouter } from 'next/navigation'
import { authService } from '@/features/auth'

interface Module {
  id: number
  title: string
  description: string
}

export const ModulesSection = () => {
  const t = useTranslations('lending.modulesSection')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const locale = useLocale()
  
  // Получаем модули из переводов
  const modulesData = t.raw('modules') as Array<{title: string, description: string}>
  
  const modules: Module[] = modulesData.map((module, index) => ({
    id: index + 1,
    title: module.title,
    description: module.description
  }))

  const isModuleReady = (title: string): boolean => {
    const n = title.replace(/\s+/g, '').toUpperCase()
    return (
      n.includes('ЗАЯВКИ') ||
      n.includes('ӨТІНІМДЕР') ||
      n.includes('ЭДО') ||
      n.includes('ЭЦҚ') ||
      n.includes('ECP') ||
      n.includes('EDO')
      // ВКС исключено из "готов"
    )
  }

  const getModuleIcon = (title: string): string | StaticImageData => {
    const normalized = title.replace(/\s+/g, '').toUpperCase()
    if (normalized.includes('ЗАЯВКИ') || normalized.includes('ӨТІНІМДЕР')) return myApplicationsIcon
    if (normalized.includes('ЭДО') || normalized.includes('ЭЦҚ')) return documentIcon
    if (normalized.includes('ВКС') || normalized.includes('БЕЙНЕ')) return '/assets/icons/vks.svg'
    if (normalized.includes('ИИ') || normalized.includes('CONSULTANT')) return chatIcon
    if (normalized.includes('ФОРУМ')) return peopleIcon
    if (normalized.includes('БАЗА') || normalized.includes('БІЛІМ') || normalized.includes('КОНТРАГЕНТ')) return faqIcon
    return documentIcon
  }

  const handleModuleClick = async (module: Module) => {
    const normalized = module.title.replace(/\s+/g, '').toUpperCase()
    const isEdoOrEcp =
      normalized.includes('ЭДО') ||
      normalized.includes('EDO') ||
      normalized.includes('ЭЦП') ||
      normalized.includes('ЭЦҚ') ||
      normalized.includes('ECP')

    const isApplications = 
      normalized.includes('ЗАЯВКИ') ||
      normalized.includes('ӨТІНІМДЕР')

    const isVks =
      normalized.includes('ВКС') ||
      normalized.includes('VIDEO') ||
      normalized.includes('БЕЙНЕ') ||
      normalized.includes('CONFERENCE')

    if (isEdoOrEcp) {
      const res = await authService.check()
      if (res?.isAuthenticated) {
        router.push(`/${locale}/ecp/statuses`)
      } else {
        router.push(`/${locale}/auth/login`)
      }
      return
    }

    if (isApplications) {
      const res = await authService.check()
      if (res?.isAuthenticated) {
        router.push(`/${locale}/dashboard/applications`)
      } else {
        router.push(`/${locale}/auth/login`)
      }
      return
    }

    if (isVks) {
      const res = await authService.check()
      if (res?.isAuthenticated) {
        router.push(`/${locale}/dashboard/video-conference`)
      } else {
        router.push(`/${locale}/auth/login`)
      }
      return
    }

    setIsModalOpen(true)
  }

  return (
    <section id="modules" className={s.modulesSection}>
      <div className={s.container}>
        <div className={s.titleLine}></div>
        <h2 className={s.title}>{t('title')}</h2>
        
        <div className={s.modulesGrid}>
          {modules.map((module) => (
            <div
              key={module.id}
              className={s.moduleCard}
              role="button"
              tabIndex={0}
              onClick={() => handleModuleClick(module)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleModuleClick(module)
                }
              }}
            >
              <div className={s.cardContent}>
                <div className={s.cardHeader}>
                  <Image src={getModuleIcon(module.title)} alt={module.title} width={32} height={32} />
                  <h3 className={s.moduleTitle}>{module.title}</h3>
                  {isModuleReady(module.title) ? (
                    <span className={s.readyBadge}>Готов</span>
                  ) : (
                    <span className={s.devBadge}>В разработке</span>
                  )}
                </div>
                <p className={s.moduleDescription}>{module.description}</p>
              </div>
              <div className={s.moduleIcon}>
                <div className={s.iconCircle}>
                  <Image src={moduleIcon} alt="Module icon" width={48} height={48} />
                </div>
              </div>
            </div>        
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '20px',
          textAlign: 'center'
        }}>
          <Image
            src={monitor}
            alt="monitor"
            width={114}
            height={104}
          />
          <p style={{ 
            fontSize: '18px', 
            fontWeight: '500', 
            margin: '20px 0',
            color: '#333'
          }}>
            Модули в разработке
          </p>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(false)}>
            Понятно
          </Button>
        </div>
      </Modal>
    </section>
  )
}
