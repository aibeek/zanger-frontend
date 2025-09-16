'use client'
import { useEffect } from 'react'
import type { PulseChatConfig } from '../types'

interface PulseChatProps {
	chatId?: string
	disabled?: boolean
	onLoad?: () => void
	onError?: (error: Error) => void
}

export const PulseChat = ({ 
	chatId = '68beb8714d31c577970ac394',
	disabled = false,
	onLoad,
	onError
}: PulseChatProps) => {
	useEffect(() => {
		// Если компонент отключен, не загружаем скрипт
		if (disabled) {
			return
		}

		// Проверяем, не загружен ли уже скрипт
		const existingScript = document.querySelector('[data-live-chat-id]')
		if (existingScript) {
			return
		}

		// Создаем и загружаем скрипт Pulse
		const script = document.createElement('script')
		script.src = 'https://cdn.pulse.is/livechat/loader.js'
		script.setAttribute('data-live-chat-id', chatId)
		script.async = true

		// Обработчики событий загрузки
		script.onload = () => {
			console.log('Pulse Chat loaded successfully')
			onLoad?.()
		}

		script.onerror = () => {
			const error = new Error('Failed to load Pulse Chat script')
			console.error('Pulse Chat loading error:', error)
			onError?.(error)
		}

		// Добавляем скрипт в документ
		document.body.appendChild(script)

		// Функция очистки при размонтировании компонента
		return () => {
			const scriptToRemove = document.querySelector(`[data-live-chat-id="${chatId}"]`)
			if (scriptToRemove && scriptToRemove.parentNode) {
				scriptToRemove.parentNode.removeChild(scriptToRemove)
			}

			// Удаляем виджет Pulse, если он был создан
			const pulseWidget = document.querySelector('#pulse-livechat-widget, [class*="pulse"], [id*="pulse"]')
			if (pulseWidget && pulseWidget.parentNode) {
				pulseWidget.parentNode.removeChild(pulseWidget)
			}
		}
	}, [chatId, disabled, onLoad, onError])

	// Компонент не рендерит ничего видимого, так как Pulse создает свой виджет
	return null
}
