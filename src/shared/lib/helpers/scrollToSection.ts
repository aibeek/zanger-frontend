export const scrollToSection = (e: React.MouseEvent | any, href: string) => {
	if (href.startsWith('#')) {
		e.preventDefault()
		const el = document.querySelector(href)
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' })
		}
	}
}
