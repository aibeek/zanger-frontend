'use client'

import { useTranslations } from 'next-intl'
import s from './DomainsSection.module.scss'

export const DomainsSection = () => {
	const t = useTranslations('lending.domainsSection')

	return (
		<section id="domains" className={s.wrapper}>
			<div className={s.container}>
				<div className={s.badge}>{t('badge')}</div>
				<h2 className={s.title}>{t('title')}</h2>
				<p className={s.subtitle}>{t('subtitle')}</p>
				<div className={s.domainsGrid}>
					<a
						className={s.domainCard}
						href="https://zanger-app.kz"
						target="_blank"
						rel="noreferrer noopener"
					>
						<span className={s.domainLabel}>{t('primaryDomain')}</span>
						<span className={s.domainName}>zanger-app.kz</span>
					</a>
					<a
						className={s.domainCard}
						href="https://zanger5510.kz"
						target="_blank"
						rel="noreferrer noopener"
					>
						<span className={s.domainLabel}>{t('newDomain')}</span>
						<span className={s.domainName}>zanger5510.kz</span>
					</a>
				</div>
				<p className={s.helperText}>{t('helperText')}</p>
			</div>
		</section>
	)
}
