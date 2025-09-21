'use client'
import { useState, useEffect } from 'react'
import { Button, Input } from '@/shared/ui-kit'
import { useTranslations } from 'next-intl'
import { Textarea } from '@headlessui/react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SearchSelect, useRegions } from '@/features/auth'
import { useTags } from '@/features/create-application'
import { useRegionsUtils } from '@/shared/lib'
import { z } from 'zod'
import s from './ChatBot.module.scss'

interface ChatFormData {
	fullName?: string
	phone?: string
	tag_id?: number | null
	region_id?: number
	description?: string
}

// Схема валидации для чат-бота
const chatBotSchema = z.object({
	fullName: z.string().min(1, 'Имя обязательно').optional(),
	phone: z.string().min(1, 'Телефон обязателен').optional(),
	tag_id: z.union([z.number(), z.null()]).optional(),
	region_id: z.number().optional(),
	description: z.string().optional(),
})

export const ChatBot = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [isMinimized, setIsMinimized] = useState(false)
	const [currentStep, setCurrentStep] = useState<'welcome' | 'name' | 'phone' | 'service' | 'region' | 'description' | 'success'>('welcome')
	
	const t = useTranslations('chatBot')
	const { tags, loadingTags } = useTags()
	const { regions } = useRegions()
	const { optionsForSelect, allOptions } = useRegionsUtils(regions, [])
	
	// Предотвращаем скролл страницы при открытии выпадающих списков
	useEffect(() => {
		const handleSelectOpen = () => {
			document.body.classList.add('chatbot-dropdown-open')
		}
		
		const handleSelectClose = () => {
			document.body.classList.remove('chatbot-dropdown-open')
		}
		
		const handleWheel = (e: WheelEvent) => {
			// Если скролл происходит в выпадающем списке, предотвращаем скролл страницы
			if (e.target && (e.target as Element).closest('.ant-select-dropdown')) {
				e.preventDefault()
				e.stopPropagation()
				return false
			}
		}
		
		const handleMouseDown = (e: MouseEvent) => {
			// Если клик по Select компоненту, блокируем скролл
			if (e.target && (e.target as Element).closest('.ant-select')) {
				handleSelectOpen()
			}
		}
		
		const handleClick = (e: MouseEvent) => {
			// Если клик не по выпадающему списку и не по Select, разблокируем скролл
			if (!(e.target as Element).closest('.ant-select-dropdown') && 
				!(e.target as Element).closest('.ant-select')) {
				handleSelectClose()
			}
		}
		
		// Добавляем обработчики событий
		document.addEventListener('wheel', handleWheel, { passive: false })
		document.addEventListener('mousedown', handleMouseDown)
		document.addEventListener('click', handleClick)
		
		// Очистка при размонтировании
		return () => {
			handleSelectClose()
			document.removeEventListener('wheel', handleWheel)
			document.removeEventListener('mousedown', handleMouseDown)
			document.removeEventListener('click', handleClick)
		}
	}, [])

	const {
		handleSubmit,
		control,
		watch,
		formState: { errors },
	} = useForm<ChatFormData>({
		resolver: zodResolver(chatBotSchema),
		mode: 'onSubmit',
		defaultValues: {
			fullName: '',
			phone: '+7',
			tag_id: null,
			region_id: 0,
			description: ''
		}
	})

	const formData = watch()

	const open = () => setIsOpen(true)
	const close = () => {
		setIsOpen(false)
		setIsMinimized(false)
		setCurrentStep('welcome')
	}

	const handleNext = () => {
		console.log('handleNext called, current step:', currentStep)
		
		if (currentStep === 'welcome') {
			console.log('Moving from welcome to name')
			setCurrentStep('name')
		} else if (currentStep === 'name' && formData.fullName?.trim()) {
			console.log('Moving from name to phone')
			setCurrentStep('phone')
		} else if (currentStep === 'phone' && formData.phone?.trim()) {
			console.log('Moving from phone to service')
			setCurrentStep('service')
		} else if (currentStep === 'service') {
			console.log('Moving from service to region')
			setCurrentStep('region')
		} else if (currentStep === 'region' && formData.region_id) {
			console.log('Moving from region to description')
			setCurrentStep('description')
		} else if (currentStep === 'description' && formData.description?.trim()) {
			console.log('Moving to success')
			setCurrentStep('success')
			// Здесь можно добавить логику отправки данных на сервер
			setTimeout(() => {
				close()
			}, 3000)
		}
	}

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		console.log('Form submitted, current step:', currentStep)
		console.log('Form data:', formData)
		console.log('Calling handleNext...')
		handleNext()
		console.log('handleNext completed')
	}

	const resetChat = () => {
		setCurrentStep('welcome')
	}

	const formatPhoneNumber = (value: string) => {
		// Убираем все кроме цифр
		const cleaned = value.replace(/\D/g, '')
		
		// Если номер пустой, возвращаем +7
		if (cleaned.length === 0) {
			return '+7'
		}
		
		// Если номер начинается с 7 или 8, заменяем на +7
		let phoneNumber = cleaned
		if (phoneNumber.startsWith('7') || phoneNumber.startsWith('8')) {
			phoneNumber = phoneNumber.substring(1)
		}
		
		console.log('Processing phone number:', phoneNumber, 'Length:', phoneNumber.length)
		
		// Форматируем номер в формате +7 (XXX) XXX-XX-XX (максимум 11 цифр)
		let result = ''
		if (phoneNumber.length <= 3) {
			result = `+7 ${phoneNumber}`
		} else if (phoneNumber.length <= 6) {
			result = `+7 (${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
		} else if (phoneNumber.length <= 8) {
			result = `+7 (${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`
		} else if (phoneNumber.length <= 10) {
			result = `+7 (${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 8)}-${phoneNumber.slice(8)}`
		} else if (phoneNumber.length === 11) {
			// Ровно 11 цифр: +7 (XXX) XXX-XX-XX
			result = `+7 (${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 8)}-${phoneNumber.slice(8, 10)}-${phoneNumber.slice(10)}`
		}
		// Номера длиннее 11 цифр не обрабатываются
		
		console.log('Formatted result:', result)
		return result
	}

	if (isMinimized) {
		return (
			<div className={s.minimizedChat} onClick={() => setIsMinimized(false)}>
				<div className={s.minimizedIcon}>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
					</svg>
				</div>
				<div className={s.minimizedText}>
					{t('needHelp')}
				</div>
			</div>
		)
	}

	return (
		<>
			{isOpen && (
				<div className={s.chatBot}>
					<div className={s.chatHeader}>
						<div className={s.chatTitle}>
							<div className={s.chatIcon}>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
									<path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
								</svg>
							</div>
							<span>{t('title')}</span>
						</div>
						<div className={s.chatActions}>
							<button 
								className={s.minimizeBtn}
								onClick={() => setIsMinimized(true)}
								title={t('minimize')}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
									<path d="M19 13H5V11H19V13Z" fill="currentColor"/>
								</svg>
							</button>
						</div>
					</div>

					<div className={s.chatBody}>
						{currentStep === 'welcome' && (
							<div className={s.welcomeStep}>
								<div className={s.botMessage}>
									<div className={s.messageBubble}>
										{t('welcomeMessage')}
									</div>
								</div>
								<Button
									onClick={handleNext}
									variant="primary"
									size="md"
									className={s.startBtn}
								>
									{t('start')}
								</Button>
							</div>
						)}

						{currentStep === 'name' && (
							<div className={s.nameStep}>
								<div className={s.botMessage}>
									<div className={s.messageBubble}>
										{t('askName')}
									</div>
								</div>
								<form onSubmit={handleFormSubmit} className={s.form}>
									<Controller
										name="fullName"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												placeholder={t('namePlaceholder')}
												className={s.input}
											/>
										)}
									/>
									<Button
										type="submit"
										variant="primary"
										size="md"
										disabled={!formData.fullName?.trim()}
										className={s.nextBtn}
									>
										{t('next')}
									</Button>
								</form>
							</div>
						)}

						{currentStep === 'phone' && (
							<div className={s.phoneStep}>
								<div className={s.botMessage}>
									<div className={s.messageBubble}>
										{t('askPhone')}
									</div>
								</div>
								<form onSubmit={handleFormSubmit} className={s.form}>
									<Controller
										name="phone"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												placeholder={t('phonePlaceholder')}
												className={s.input}
												inputMode="numeric"
												onChange={(e) => {
													const formatted = formatPhoneNumber(e.target.value)
													field.onChange(formatted)
												}}
											/>
										)}
									/>
									<Button
										type="submit"
										variant="primary"
										size="md"
										disabled={!formData.phone?.trim()}
										className={s.nextBtn}
									>
										{t('next')}
									</Button>
								</form>
							</div>
						)}

						{currentStep === 'service' && (
							<div className={s.serviceStep}>
								<div className={s.botMessage}>
									<div className={s.messageBubble}>
										{t('askService')}
									</div>
								</div>
								<form onSubmit={handleFormSubmit} className={s.form}>
									<Controller
										name="tag_id"
										control={control}
										render={({ field }) => (
											<SearchSelect
												className="search-select"
												data={loadingTags ? [] : (Array.isArray(tags) ? [...tags].sort((a, b) => a.name.localeCompare(b.name)) : [])}
												loading={loadingTags}
												value={Array.isArray(tags) ? tags.find((tag) => tag.id === field.value) : null}
												onChange={(tag) => field.onChange(tag && 'id' in tag ? tag.id : null)}
												getId={(item) => 'id' in item ? item.id ?? 'null' : 'null'}
												getLabel={(item) => 'name' in item ? item.name : ''}
												placeholder={loadingTags ? 'Загрузка...' : t('servicePlaceholder')}
												disabled={loadingTags}
											/>
										)}
									/>
									{loadingTags && (
										<div className={s.loadingMessage}>
											Загружаем список услуг...
										</div>
									)}
									<Button
										type="submit"
										variant="primary"
										size="md"
										className={s.nextBtn}
										disabled={loadingTags}
									>
										{t('next')}
									</Button>
								</form>
							</div>
						)}

						{currentStep === 'region' && (
							<div className={s.regionStep}>
								<div className={s.botMessage}>
									<div className={s.messageBubble}>
										{t('askRegion')}
									</div>
								</div>
								<form onSubmit={handleFormSubmit} className={s.form}>
									<Controller
										name="region_id"
										control={control}
										render={({ field }) => (
											<SearchSelect
												className="search-select"
												data={optionsForSelect || []}
												searchData={allOptions || []}
												value={allOptions?.find((r) => r.id === field.value) || null}
												onChange={(region) => field.onChange(region?.id)}
												getId={(item) => item.id}
												getLabel={(item) => (item.path ? `${item.name} (${item.path})` : item.name)}
												renderGroupLabel={(label) => <span>{label.slice(3)}</span>}
												placeholder={!regions ? 'Загрузка...' : t('regionPlaceholder')}
												loading={!regions}
												disabled={!regions}
											/>
										)}
									/>
									{!regions && (
										<div className={s.loadingMessage}>
											Загружаем список регионов...
										</div>
									)}
									<Button
										type="submit"
										variant="primary"
										size="md"
										disabled={!formData.region_id || !regions}
										className={s.nextBtn}
									>
										{t('next')}
									</Button>
								</form>
							</div>
						)}

						{currentStep === 'description' && (
							<div className={s.descriptionStep}>
								<div className={s.botMessage}>
									<div className={s.messageBubble}>
										{t('askDescription')}
									</div>
								</div>
								<form onSubmit={handleFormSubmit} className={s.form}>
									<Controller
										name="description"
										control={control}
										render={({ field }) => (
											<Textarea
												{...field}
												value={field.value ?? ''}
												onChange={field.onChange}
												className={s.textarea}
												placeholder={t('descriptionPlaceholder')}
											/>
										)}
									/>
									<Button
										type="submit"
										variant="primary"
										size="md"
										disabled={!formData.description?.trim()}
										className={s.nextBtn}
									>
										{t('submit')}
									</Button>
								</form>
							</div>
						)}

						{currentStep === 'success' && (
							<div className={s.successStep}>
								<div className={s.botMessage}>
									<div className={s.messageBubble}>
										{t('successMessage')}
									</div>
								</div>
								<div className={s.successInfo}>
									<p><strong>{t('fullName')}:</strong> {formData.fullName}</p>
									<p><strong>{t('phone')}:</strong> {formData.phone}</p>
									{formData.tag_id && (
										<p><strong>{t('service.label')}:</strong> {tags.find(t => t.id === formData.tag_id)?.name}</p>
									)}
									{formData.region_id && (
										<p><strong>{t('region')}:</strong> {allOptions.find(r => r.id === formData.region_id)?.name}</p>
									)}
									{formData.description && (
										<p><strong>{t('description')}:</strong> {formData.description}</p>
									)}
								</div>
							</div>
						)}
					</div>

					<div className={s.chatFooter}>
						<Button
							onClick={resetChat}
							variant="border"
							size="sm"
							className={s.resetBtn}
						>
							{t('reset')}
						</Button>
					</div>
				</div>
			)}

			{!isOpen && (
				<div className={s.triggerContainer}>
					<button className={s.chatTrigger} onClick={open}>
						<div className={s.triggerIcon}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
								<path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
							</svg>
						</div>
						<div className={s.triggerText}>
							{t('needHelp')}
						</div>
					</button>
				</div>
			)}
		</>
	)
}
