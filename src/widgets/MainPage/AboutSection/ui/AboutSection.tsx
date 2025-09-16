import { useTranslations } from 'next-intl'
import s from './AboutSection.module.scss'

export const AboutSection = () => {
  const t = useTranslations('lending.aboutSection')
  
  return (
    <section id="about" className={s.aboutSection}>
      <div className={s.container}>
        <h2 className={s.title}>
          {t('title')}
        </h2>
        <p className={s.description}>
          {t('description')}
        </p>
      </div>
    </section>
  )
}