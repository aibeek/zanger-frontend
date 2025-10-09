'use client'

/**
 * Обрезает описание до первых 2-х предложений
 * @param text - полный текст описания
 * @param maxSentences - максимальное количество предложений (по умолчанию 2)
 * @returns обрезанный текст
 */
export const truncateDescription = (text: string, maxSentences: number = 2): string => {
	if (!text) return ''
	
	// Разбиваем текст на предложения по точке, вопросительному или восклицательному знаку
	const sentences = text.match(/[^.!?]+[.!?]+/g) || []
	
	if (sentences.length === 0) {
		// Если не нашли предложений с знаками препинания, берём первые 150 символов
		return text.length > 150 ? text.substring(0, 150) + '...' : text
	}
	
	// Берём первые maxSentences предложений
	const truncated = sentences.slice(0, maxSentences).join(' ').trim()
	
	// Если было больше предложений, добавляем многоточие
	return sentences.length > maxSentences ? truncated + '...' : truncated
}
