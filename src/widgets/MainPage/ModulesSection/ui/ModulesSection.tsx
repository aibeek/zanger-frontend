'use client'

import { useTranslations } from 'next-intl'
import s from './ModulesSection.module.scss'

interface Module {
  id: number
  title: string
  description: string
  icon: string
}

export const ModulesSection = () => {
  const t = useTranslations('lending.modulesSection')
  
  // Получаем модули из переводов
  const modulesData = t.raw('modules') as Array<{title: string, description: string}>
  
  const modules: Module[] = modulesData.map((module, index) => ({
    id: index + 1,
    title: module.title,
    description: module.description,
    icon: '→'
  }))

  return (
    <section id="modules" className={s.modulesSection}>
      <div className={s.container}>
        <div className={s.titleLine}></div>
        <h2 className={s.title}>{t('title')}</h2>
        
        <div className={s.modulesGrid}>
          {modules.map((module) => (
            <div key={module.id} className={s.moduleCard}>
              <div className={s.cardContent}>
                <h3 className={s.moduleTitle}>{module.title}</h3>
                <p className={s.moduleDescription}>{module.description}</p>
              </div>
              <div className={s.moduleIcon}>
                <div className={s.iconCircle}>
                  →
                </div>
              </div>
            </div>        
          ))}
        </div>
      </div>
    </section>
  )
}
