'use client'

import { useEffect } from 'react'
import s from './page.module.scss'
import { useLoginStore } from '@/features/auth/login/model'

export default function ClientPage() {
	const { personalData, getPersonalDataByToken } = useLoginStore()

	useEffect(() => {
		if (!personalData) {
			getPersonalDataByToken()
		}
	}, [personalData, getPersonalDataByToken])

	if (!personalData) {
		return <div className={s.page}>Загрузка...</div>
	}

	const { name, phone, language, icon, onboarded, id, region, role_id } = personalData

	return (
		<div className={s.page}>
			<h1>ClientPage</h1>
			<p>
				<strong>ID:</strong> {id}
			</p>
			<p>
				<strong>Имя:</strong> {name}
			</p>
			<p>
				<strong>Телефон:</strong> {phone}
			</p>
			<p>
				<strong>Язык:</strong> {language}
			</p>
			<p>
				<strong>Иконка:</strong> {icon ?? 'Нет'}
			</p>
			<p>
				<strong>Пройден онбординг:</strong> {onboarded ? 'Да' : 'Нет'}
			</p>

			{region && (
				<div style={{ marginTop: '1rem' }}>
					<h3>Регион:</h3>
					<p>
						<strong>ID:</strong> {region.id}
					</p>
					<p>
						<strong>Название:</strong> {region.name}
					</p>
					<p>
						<strong>Путь:</strong> {region.path}
					</p>
					<p>
						<strong>Тип:</strong> {region.type?.name}
					</p>
				</div>
			)}

			{role_id && (
				<div style={{ marginTop: '1rem' }}>
					<h3>Роль:</h3>
					<p>
						<strong>ID:</strong> {role_id.id}
					</p>
					<p>
						<strong>Код:</strong> {role_id.code}
					</p>
					<p>
						<strong>Название:</strong> {role_id.name}
					</p>
				</div>
			)}
		</div>
	)
}
