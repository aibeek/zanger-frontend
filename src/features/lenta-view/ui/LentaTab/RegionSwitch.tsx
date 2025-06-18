import { Switch } from '@headlessui/react'
import s from './LentaTab.module.scss'

export const RegionSwitch = ({ value, onChange }: { value: boolean; onChange: (val: boolean) => void }) => (
	<div className={s.switchWrapper}>
		<Switch
			checked={value}
			onChange={(val) => {
				onChange(val)
			}}
			className={`${s.switch} ${value ? s.switchChecked : ''}`}>
			<span className={`${s.thumb} ${value ? s.thumbChecked : ''}`} />
		</Switch>
		<span className={s.switchText}>Отобразить заявки из всех регионов</span>
	</div>
)
