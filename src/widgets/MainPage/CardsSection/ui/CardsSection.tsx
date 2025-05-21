import Image, { StaticImageData } from 'next/image'

import s from './CardsSection.module.scss'

type Cards = {
	imgUrl: StaticImageData
	title: string
	descr: string
}

type Props = {
	title: string
	data: Cards[]
	id: string
}

export const CardsSection = ({ title, data, id }: Props) => {
	return (
		<section
			id={id}
			className={s.wrapper}>
			<div className="container-middle">
				<div className={s.inner}>
					<div className={s.top}>
						<h2
							className="lending-title"
							dangerouslySetInnerHTML={{ __html: title }}
						/>
					</div>
					<div className={s.cards}>
						{data.map((card) => (
							<div
								key={card.title}
								className={s.card}>
								<div className={s.cardInner}>
									<div className={s.cardContent}>
										<Image
											alt={card.title}
											style={{ objectFit: 'contain' }}
											src={card.imgUrl}
										/>
										<h2 className={s.title}>{card.title}</h2>
										<p className={s.descr}>{card.descr}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
