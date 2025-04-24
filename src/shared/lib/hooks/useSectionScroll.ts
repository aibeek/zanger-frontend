import { useEffect, useState } from 'react'

export const useSectionScroll = () => {
	const [activeSection, setActiveSection] = useState<string | null>(null)

	useEffect(() => {
		const handleIntersect = (entries: IntersectionObserverEntry[]) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					setActiveSection(`#${entry.target.id}`)
				}
			})
		}

		const observer = new IntersectionObserver(handleIntersect, {
			rootMargin: '-40% 0px -55% 0px',
			threshold: 0.1,
		})

		const sections = document.querySelectorAll('section[id]')
		sections.forEach((section) => observer.observe(section))

		return () => {
			sections.forEach((section) => observer.unobserve(section))
		}
	}, [])

	return { activeSection, setActiveSection }
}
