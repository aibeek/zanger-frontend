'use client'

import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import { useState } from 'react'
import { Modal, Button } from '@/shared/ui-kit'
import moduleIcon from '@/app/assets/icons/moduleIcon.svg'
import docIcon from '@/app/assets/icons/document.svg'
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
    const isEdoOrEcp =
      normalized.includes('ЭДО') ||
      normalized.includes('EDO') ||
      normalized.includes('ЭЦП') ||
      normalized.includes('ЭЦҚ') ||
      normalized.includes('ECP')

    if (isEdoOrEcp) {
      const res = await authService.check()
      if (res?.isAuthenticated) {
        router.push(`/ru/ecp/statuses`)
      } else {
        router.push(`/ru/auth/login`)
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
                <h3 className={s.moduleTitle}>{module.title}</h3>
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
