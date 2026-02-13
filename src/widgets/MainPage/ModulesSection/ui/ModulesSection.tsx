'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useState } from 'react'
import { Modal, Button } from '@/shared/ui-kit'
import Image from 'next/image'
import monitor from '@/app/assets/icons/monitor.webp'
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

  const handleModuleClick = async (module: Module) => {
    const normalized = module.title.replace(/\s+/g, '').toUpperCase()

    const isEcp =
      normalized.includes('ЭЦП') ||
      normalized.includes('ЭЦҚ') ||
      normalized.includes('ECP')

    const isVks =
      normalized.includes('ВКС') ||
      normalized.includes('VIDEO') ||
      normalized.includes('БЕЙНЕ') ||
      normalized.includes('CONFERENCE') ||
      normalized.includes('ВИДЕО')

    if (isEcp) {
      const res = await authService.check()
      if (res?.isAuthenticated) {
        router.push(`/${locale}/ecp/statuses`)
      } else {
        router.push(`/${locale}/auth/login`)
      }
      return
    }

    if (isVks) {
      router.push(`/${locale}/dashboard/video-conference`)
      return
    }

    setIsModalOpen(true)
  }

  // Модули, которые должны быть подсвечены синим фоном
  const isHighlighted = (title: string): boolean => {
    const n = title.replace(/\s+/g, '').toUpperCase()
    return (
      n.includes('БАЗА') ||
      n.includes('БІЛІМ') ||
      n.includes('КОНТРАГЕНТ') ||
      n.includes('УПРАВЛЕНИ') ||
      n.includes('ДОКУМЕНТ')
    )
  }

  // ВКС и ЭЦП — голубой фон #EAF4FF
  const isBlueCard = (title: string): boolean => {
    const n = title.replace(/\s+/g, '').toUpperCase()
    return (
      n.includes('ВКС') ||
      n.includes('VIDEO') ||
      n.includes('БЕЙНЕ') ||
      n.includes('CONFERENCE') ||
      n.includes('ВИДЕО') ||
      n.includes('ЭЦП') ||
      n.includes('ЭЦҚ') ||
      n.includes('ECP')
    )
  }

  return (
    <section id="modules" className={s.modulesSection}>
      <div className={s.container}>
        <h2 className={s.title}>{t('title')}</h2>
        
        <div className={s.modulesGrid}>
          {modules.map((module, index) => {
            const card = (
              <div
                key={module.id}
                className={`${s.moduleCard} ${isHighlighted(module.title) ? s.moduleCardHighlighted : ''} ${isBlueCard(module.title) ? s.moduleCardBlue : ''}`}
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
                  <h3 className={s.moduleTitle}>{module.title}</h3>
                  <p className={s.moduleDescription}>{module.description}</p>
                </div>
                <div className={s.moduleIcon}>
                  <div className={s.arrowIcon}>
                    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </div>
              </div>
            )

            // Вставляем paraq.png после "База данных" (index 1)
            if (index === 1) {
              return (
                <>{card}<div key="img-paraq" className={s.illustrationCard}><Image src="/assets/sectionimg/paraq.png" alt="" width={300} height={300} className={s.illustrationImage} /></div></>
              )
            }

            // Вставляем tarazy.png после "Видео-конференц связь" (index 2)
            if (index === 2) {
              return (
                <>{card}<div key="img-tarazy" className={s.illustrationCard}><Image src="/assets/sectionimg/tarazy.png" alt="" width={300} height={300} className={s.illustrationImage} /></div></>
              )
            }

            return card
          })}
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
