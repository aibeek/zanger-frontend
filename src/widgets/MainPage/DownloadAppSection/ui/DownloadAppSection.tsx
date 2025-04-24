import Image from 'next/image'

import Iphones from '@/app/assets/images/double-iphones.webp'
import Qr from '@/app/assets/icons/qr.svg'
import GooglePlay from '@/app/assets/icons/googleplay.webp'
import AppleStore from '@/app/assets/icons/appstore.webp'

import s from './DownloadAppSection.module.scss'
import Link from 'next/link'

export const DownloadAppSection = () => {
	return (
		<section className={s.wrapper}>
			<div className="container-middle">
				<div className={s.inner}>
					<div className={s.left}>
						<div className={s.leftTop}>
							<h3 className={s.title}>
								Установите приложение
								<br /> Zanger на свой смартфон
							</h3>
							<p className="lending-descr">Приложение можно загрузить из App Store и Google play</p>
						</div>
						<div className={s.leftBottom}>
							<Image
								className={s.qr}
								src={Qr}
								alt={'изображение телефонов'}
								width={210}
								height={216}
							/>
							<div className={s.downloadLinks}>
								<Link href={'#'}>
									<Image
										src={AppleStore}
										alt={'apple store'}
										width={180}
										height={52}
									/>
								</Link>
								<Link href={'#'}>
									<Image
										src={GooglePlay}
										alt={'google play'}
										width={180}
										height={52}
									/>
								</Link>
							</div>
						</div>
					</div>
					<div className={s.right}>
						<Image
							className={s.doubleIphones}
							src={Iphones}
							alt={'изображение телефонов'}
							width={481}
							height={583}
						/>
					</div>
				</div>
			</div>
		</section>
	)
}
