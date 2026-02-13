import { useTranslations } from 'next-intl'
import s from './AboutSection.module.scss'

export const AboutSection = () => {
  const t = useTranslations('lending.aboutSection')

  return (
    <section id="about" className={s.aboutSection}>
      <div className={s.container}>
        <h2 className={s.title}>{t('title')}</h2>
        <div className={s.descriptionBlock}>
          <p className={s.description}>
            {t.rich('description', {
				span: (chunks) => <span className={s.regular}>{chunks}</span>,
				b: (chunks) => <b>{chunks}</b>,
            })}
          </p>
        </div>
      </div>
    </section>
  )
}
