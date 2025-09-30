import { useTranslations } from 'next-intl'
import s from './AboutSection.module.scss'

export const AboutSection = () => {
  const t = useTranslations('lending.aboutSection')
  
  // Получаем массив инструментов из переводов
  const tools = t.raw('tools') as string[]
  
  return (
    <section id="about" className={s.aboutSection}>
      <div className={s.container}>
        <h2 className={s.title}>
          {t('title')}
        </h2>
        <p className={s.description}>
          {t('description')}
        </p>
        
        <div className={s.platformTools}>
          <h3 className={s.toolsTitle}>
            {t('platformTools')}
          </h3>
          <ul className={s.toolsList}>
            {tools.map((tool, index) => (
              <li key={index} className={s.toolItem}>
                {tool}
              </li>
            ))}
          </ul>
        </div>
        
        <div className={s.developmentNote}>
          <p className={s.noteText}>
            {t('developmentNote')}
          </p>
        </div>
      </div>
    </section>
  )
}