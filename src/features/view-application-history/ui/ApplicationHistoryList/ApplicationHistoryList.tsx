'use client'

import s from './ApplicationHistoryList.module.scss'
import { useApplicationHistoryStore } from '../../model/applicationHistoryStore'

export const ApplicationHistoryList = () => {
	const { applicationsHistory } = useApplicationHistoryStore()

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.items}>
					{applicationsHistory.map((item) => (
						<article
							className={s.item}
							key={item.id}>
							<div className={s.top}>
								<div className={s.date}>
									<p>Опубликовано: {item.created_at}</p>
								</div>

								<h5 className={s.title}>TITLE TITLE</h5>

								{item.tag && <span className={s.tag}>{item.tag.name}</span>}

								<p className={s.descr}>{item.description}</p>
							</div>

							<div className={s.bottom}>
								<p>Статус:</p>
								<span className={s.status}>{item.status}</span>
							</div>
						</article>
					))}
				</div>
			</div>
		</div>
	)
}
