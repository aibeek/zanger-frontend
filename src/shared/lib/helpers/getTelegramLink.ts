export function getTelegramLink(contact: string | undefined | null): string {
	if (!contact) return 'https://t.me'

	const cleaned = contact.trim()

	if (/^\+?\d+$/.test(cleaned)) {
		const digitsOnly = cleaned.replace(/\D/g, '')
		return `https://t.me/+${digitsOnly}`
	}

	if (cleaned.startsWith('@')) {
		return `https://t.me/${cleaned.slice(1)}`
	}

	return `https://t.me/${cleaned}`
}
