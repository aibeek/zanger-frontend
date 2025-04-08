export function formatPhoneNumber(phone: string): string {
	if (!phone || phone.length !== 11) return phone
	const code = phone.slice(1, 4)
	const part1 = phone.slice(4, 7)
	const part2 = phone.slice(7, 9)
	const part3 = phone.slice(9, 11)
	return `+7 (${code}) ${part1}-${part2}-${part3}`
}
